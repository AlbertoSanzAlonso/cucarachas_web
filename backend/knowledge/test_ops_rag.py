"""Tests RAG ops: audience isolation + sync corpus + inject en prompt."""

from __future__ import annotations

from unittest import mock

from django.test import TestCase

from knowledge.models import TechnicalKnowledge
from knowledge.ops_sync import sync_ops_corpus_markdown
from knowledge.retriever import retrieve_ops_knowledge, retrieve_relevant_knowledge
from knowledge.sync import upsert_knowledge


class OpsAudienceIsolationTests(TestCase):
    def setUp(self):
        self._emb = mock.patch(
            "knowledge.sync._safe_embedding",
            return_value=[0.0] * 3072,
        )
        self._emb.start()
        upsert_knowledge(
            source_key="public:blog:cucas",
            title="Prevenció pública",
            content="Consells de prevenció de paneroles a casa per clients.",
            category=TechnicalKnowledge.Category.BLOG,
            audience=TechnicalKnowledge.Audience.PUBLIC,
        )
        upsert_knowledge(
            source_key="ops:sop:potencial",
            title="Alta CLIENTE_POTENCIAL",
            content=(
                "Per crear CLIENTE_POTENCIAL cal nombre, codigoDelegacion i "
                "codigoGestionadoPor. No inventar codis mestres."
            ),
            category=TechnicalKnowledge.Category.OPS_SOP,
            audience=TechnicalKnowledge.Audience.OPS,
        )
        upsert_knowledge(
            source_key="both:faq:garantia",
            title="Garantia repàs",
            content="El repàs en garantia no té cost addicional si cau dins del termini.",
            category=TechnicalKnowledge.Category.OPS_FAQ,
            audience=TechnicalKnowledge.Audience.BOTH,
        )

    def tearDown(self):
        self._emb.stop()

    def test_public_retriever_excludes_ops_only(self):
        result = retrieve_relevant_knowledge(
            "CLIENTE_POTENCIAL codigoDelegacion",
            limit=5,
        )
        self.assertNotIn("codigoDelegacion", result)
        self.assertNotIn("No inventar codis mestres", result)

    def test_public_retriever_includes_both(self):
        result = retrieve_relevant_knowledge("garantia repàs termini", limit=5)
        self.assertIn("garantia", result.lower())

    def test_ops_retriever_finds_ops_and_not_public_blog(self):
        result = retrieve_ops_knowledge(
            "crear CLIENTE_POTENCIAL codigoDelegacion",
            limit=5,
        )
        self.assertIn("codigoDelegacion", result)
        self.assertNotIn("Consells de prevenció", result)

    def test_ops_retriever_includes_both(self):
        result = retrieve_ops_knowledge("repàs garantia cost", limit=5)
        self.assertIn("garantia", result.lower())


class OpsCorpusSyncTests(TestCase):
    def setUp(self):
        self._emb = mock.patch(
            "knowledge.sync._safe_embedding",
            return_value=[0.0] * 3072,
        )
        self._emb.start()

    def tearDown(self):
        self._emb.stop()

    def test_sync_ops_corpus_creates_audience_ops(self):
        n = sync_ops_corpus_markdown()
        self.assertGreater(n, 0)
        rows = TechnicalKnowledge.objects.filter(audience=TechnicalKnowledge.Audience.OPS)
        self.assertTrue(rows.exists())
        self.assertTrue(rows.filter(source_key__startswith="ops:sop:").exists())
        # Aislamiento: nada de corpus ops con audience public
        self.assertFalse(
            TechnicalKnowledge.objects.filter(
                source_key__startswith="ops:sop:",
                audience=TechnicalKnowledge.Audience.PUBLIC,
            ).exists()
        )


class OpsAgentRagInjectTests(TestCase):
    def setUp(self):
        self._emb = mock.patch(
            "knowledge.sync._safe_embedding",
            return_value=[0.0] * 3072,
        )
        self._emb.start()
        upsert_knowledge(
            source_key="ops:sop:ack-fail",
            title="ACK fallit",
            content=(
                "Si el ACK falla, corregeix els camps *! i reenvia amb el mateix "
                "remoteOperationId sense crear un altre CREATE."
            ),
            category=TechnicalKnowledge.Category.OPS_FAQ,
            audience=TechnicalKnowledge.Audience.OPS,
        )

    def tearDown(self):
        self._emb.stop()

    @mock.patch("api.agents.ops.agent.ops_agent.run_sync")
    @mock.patch("api.agents.ops.agent.setup_ai_keys")
    @mock.patch(
        "knowledge.retriever.retrieve_ops_knowledge",
        return_value=(
            "--- ACK fallit ---\n"
            "Si el ACK falla, reenvia amb el mateix remoteOperationId."
        ),
    )
    def test_run_ops_agent_prompt_includes_rag_and_notes(self, _rag, _keys, mock_run):
        from api.agents.ops.agent import OpsAgentOutput, run_ops_agent

        mock_run.return_value = mock.Mock(
            output=OpsAgentOutput(message="Ok", important_notes=[]),
        )
        run_ops_agent(
            user_message="Qué hago si el ACK de iGEO falla?",
            history=[{"role": "user", "content": "Hola"}],
            user_id=1,
            conversation_id=1,
            language="es",
            memory_notes=["Codi delegació pre: DEL-1"],
        )
        mock_run.assert_called_once()
        prompt = mock_run.call_args.args[0]
        self.assertIn("Coneixement intern (RAG", prompt)
        self.assertIn("remoteOperationId", prompt)
        self.assertIn("Notes pinnejades", prompt)
        self.assertIn("DEL-1", prompt)
        self.assertIn("Missatge nou de l'operari", prompt)


class OpsChatPassesMemoryNotesTests(TestCase):
    """API: les notes pinnejades arriben a run_ops_agent."""

    def setUp(self):
        from django.contrib.auth import get_user_model
        from rest_framework.authtoken.models import Token
        from rest_framework.test import APIClient

        from api.models import AdminConversation, AdminMemoryNote

        User = get_user_model()
        self.user = User.objects.create_user(
            username="ragops",
            email="ragops@test.local",
            password="pass12345",
        )
        self.token = Token.objects.create(user=self.user)
        self.api = APIClient()
        self.api.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        self.conv = AdminConversation.objects.create(user=self.user, title="RAG")
        AdminMemoryNote.objects.create(
            user=self.user,
            conversation=self.conv,
            title="Maestro",
            content="Delegació PRE-99",
            pinned=True,
        )

    @mock.patch("api.agents.ops.agent.run_ops_agent")
    def test_message_forwards_memory_notes(self, mock_run):
        from api.agents.ops.agent import OpsAgentOutput

        mock_run.return_value = OpsAgentOutput(message="Fet", important_notes=[])
        res = self.api.post(
            f"/api/ops/conversations/{self.conv.id}/messages/",
            {"content": "Com creo un potencial?", "language": "ca"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        notes = mock_run.call_args.kwargs.get("memory_notes") or []
        self.assertTrue(any("PRE-99" in n for n in notes))
