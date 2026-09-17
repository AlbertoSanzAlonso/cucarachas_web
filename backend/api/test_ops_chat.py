from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.agents.ops.agent import OpsAgentOutput
from api.models import AdminConversation, AdminMemoryNote, AdminMessage, Cliente


class AdminOpsChatApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="opsadmin",
            email="ops@test.local",
            password="pass12345",
        )
        self.other = User.objects.create_user(
            username="otherops",
            email="other@test.local",
            password="pass12345",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_requires_auth(self):
        self.client.credentials()
        res = self.client.get("/api/ops/conversations/")
        self.assertEqual(res.status_code, 401)
        models = self.client.get("/api/ops/models/")
        self.assertEqual(models.status_code, 401)

    def test_create_and_list_own_conversations(self):
        res = self.client.post("/api/ops/conversations/", {}, format="json")
        self.assertEqual(res.status_code, 201)
        conv_id = res.data["id"]
        AdminConversation.objects.create(user=self.other, title="Secret")
        listed = self.client.get("/api/ops/conversations/")
        self.assertEqual(listed.status_code, 200)
        ids = {item["id"] for item in listed.data}
        self.assertIn(conv_id, ids)
        self.assertEqual(len(ids), 1)

    @patch("api.agents.ops.agent.run_ops_agent")
    def test_post_message_persists_history_and_notes(self, mock_run):
        mock_run.return_value = OpsAgentOutput(
            message="He trobat el client al CRM.",
            suggested_title="Cerca client",
            important_notes=["Telèfon 612345678 — no duplicar"],
        )
        conv = AdminConversation.objects.create(user=self.user, title="")
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {"content": "Busca el 612345678", "language": "ca"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        conv.refresh_from_db()
        self.assertTrue(conv.title)
        self.assertEqual(AdminMessage.objects.filter(conversation=conv).count(), 2)
        # Notes només si l'operari ho demana explícitament.
        self.assertEqual(AdminMemoryNote.objects.filter(conversation=conv).count(), 0)
        self.assertIn("CRM", res.data["assistant_message"]["content"])
        self.assertIsNone(res.data.get("pending_action"))
        mock_run.assert_called_once()

    @patch("api.agents.ops.agent.run_ops_agent")
    def test_post_message_stores_pending_for_chat_confirm(self, mock_run):
        from api.agents.ops.agent import OpsPendingAction

        mock_run.return_value = OpsAgentOutput(
            message="He trobat en Mauro.",
            pending_action=OpsPendingAction(
                kind="whatsapp",
                summary="WhatsApp a Mauro Montenegro",
                telefono="270144886579415@lid",
                nombre="Mauro Montenegro",
                mensaje="",
            ),
        )
        conv = AdminConversation.objects.create(user=self.user, title="WA")
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {"content": "Envia un WhatsApp a Mauro", "language": "ca"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertIsNone(res.data.get("pending_action"))
        conv.refresh_from_db()
        self.assertEqual(conv.pending_action["telefono"], "270144886579415@lid")
        content = res.data["assistant_message"]["content"]
        self.assertIn("sí", content.casefold())
        self.assertIn("Mauro", content)
        self.assertNotIn("@lid", content)

    @patch("api.ops_actions.OpenWaClient")
    def test_chat_si_sends_pending_whatsapp(self, mock_client_cls):
        client = mock_client_cls.return_value
        client.send_text.return_value = type(
            "R",
            (),
            {"ok": True, "dry_run": False, "chat_id": "270@lid", "message": "Enviat"},
        )()
        conv = AdminConversation.objects.create(
            user=self.user,
            title="Confirm",
            pending_action={
                "kind": "whatsapp",
                "summary": "Salut Mauro",
                "telefono": "270144886579415@lid",
                "nombre": "Mauro Montenegro",
                "mensaje": "Hola Mauro",
            },
        )
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {"content": "sí", "language": "ca"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        content = res.data["assistant_message"]["content"]
        self.assertIn("enviat", content.casefold())
        self.assertIn("Mauro", content)
        self.assertNotIn("@lid", content)
        client.send_text.assert_called_once()
        conv.refresh_from_db()
        self.assertIsNone(conv.pending_action)

    @patch("api.ops_actions.OpenWaClient")
    def test_confirm_action_sends_whatsapp_without_llm(self, mock_client_cls):
        client = mock_client_cls.return_value
        client.send_text.return_value = type(
            "R",
            (),
            {"ok": True, "dry_run": False, "chat_id": "34612345678@c.us", "message": "Enviat"},
        )()
        conv = AdminConversation.objects.create(user=self.user, title="Confirm")
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {
                "language": "ca",
                "confirm_action": {
                    "kind": "whatsapp",
                    "summary": "Salut a Joan",
                    "telefono": "612345678",
                    "mensaje": "Hola Joan",
                },
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertIn("enviat", res.data["assistant_message"]["content"].lower())
        client.send_text.assert_called_once()
        self.assertEqual(AdminMessage.objects.filter(conversation=conv).count(), 2)

    @patch("api.agents.ops.voice.synthesize_speech", return_value="ZGF0YQ==")
    @patch("api.agents.ops.voice.transcribe_audio_upload", return_value="Busca el client del 612")
    @patch("api.agents.ops.agent.run_ops_agent")
    def test_voice_message_transcribes_then_runs_agent(self, mock_run, _tr, _tts):
        from django.core.files.uploadedfile import SimpleUploadedFile

        mock_run.return_value = OpsAgentOutput(
            message="Client localitzat.",
            suggested_title=None,
            important_notes=[],
        )
        conv = AdminConversation.objects.create(user=self.user, title="Veu")
        audio = SimpleUploadedFile("nota.webm", b"\x00\x01fake-audio", content_type="audio/webm")
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {"language": "ca", "audio": audio},
            format="multipart",
        )
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.data["via_voice"])
        self.assertEqual(res.data["user_message"]["source"], "voice")
        self.assertEqual(res.data["user_message"]["content"], "Busca el client del 612")
        self.assertEqual(res.data["assistant_message"]["content"], "Client localitzat.")
        self.assertIsNone(res.data.get("assistant_audio_base64"))
        _tts.assert_not_called()
        mock_run.assert_called_once()
        self.assertEqual(mock_run.call_args.kwargs["user_message"], "Busca el client del 612")

    def test_list_ops_models_catalog(self):
        res = self.client.get("/api/ops/models/")
        self.assertEqual(res.status_code, 200)
        ids = {item["id"] for item in res.data["models"]}
        self.assertIn("openai:gpt-6-astra", ids)
        self.assertIn("openai:gpt-5.6", ids)
        self.assertIn("openai:gpt-4o-mini", ids)
        self.assertIn("google:gemini-3.8-flash", ids)
        self.assertNotIn("google-gla:gemini-2.0-flash", ids)
        self.assertIn(res.data["default"], ids)

    @patch("api.agents.ops.agent.run_ops_agent")
    def test_post_message_uses_allowlisted_model(self, mock_run):
        mock_run.return_value = OpsAgentOutput(message="Ok", suggested_title=None, important_notes=[])
        conv = AdminConversation.objects.create(user=self.user, title="Model")
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {"content": "Hola", "language": "ca", "model": "openai:gpt-4o"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["model"], "openai:gpt-4o")
        self.assertEqual(mock_run.call_args.kwargs["model"], "openai:gpt-4o")

    @patch("api.agents.ops.agent.run_ops_agent")
    def test_invalid_model_falls_back(self, mock_run):
        mock_run.return_value = OpsAgentOutput(message="Ok", suggested_title=None, important_notes=[])
        conv = AdminConversation.objects.create(user=self.user, title="Model")
        res = self.client.post(
            f"/api/ops/conversations/{conv.id}/messages/",
            {"content": "Hola", "language": "ca", "model": "openai:gpt-evil"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["model"], "openai:gpt-4o-mini")
        self.assertEqual(mock_run.call_args.kwargs["model"], "openai:gpt-evil")

    def test_cannot_read_other_user_thread(self):
        conv = AdminConversation.objects.create(user=self.other, title="Aliè")
        res = self.client.get(f"/api/ops/conversations/{conv.id}/")
        self.assertEqual(res.status_code, 404)

    def test_manual_note(self):
        conv = AdminConversation.objects.create(user=self.user, title="Fil")
        res = self.client.post(
            "/api/ops/notes/",
            {"conversation": conv.id, "title": "Codi iGEO", "content": "CLI-99", "pinned": True},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["title"], "Codi iGEO")
        self.assertEqual(AdminMemoryNote.objects.get(pk=res.data["id"]).user_id, self.user.id)

    def test_global_note_indexes_ops_rag(self):
        from knowledge.models import TechnicalKnowledge
        from knowledge.ops_notes_rag import admin_note_source_key
        from unittest.mock import patch

        with patch("knowledge.sync._safe_embedding", return_value=[0.0] * 3072):
            res = self.client.post(
                "/api/ops/notes/",
                {
                    "conversation": None,
                    "title": "Delegació pre",
                    "content": "Sempre usa DEL-PRE-01 per potencials",
                    "pinned": True,
                },
                format="json",
            )
        self.assertEqual(res.status_code, 201)
        key = admin_note_source_key(res.data["id"])
        self.assertTrue(TechnicalKnowledge.objects.filter(source_key=key, audience="ops").exists())
        stored = TechnicalKnowledge.objects.get(source_key=key)
        self.assertIn("DEL-PRE-01", stored.content)

        with patch("knowledge.sync._safe_embedding", return_value=[0.0] * 3072):
            del_res = self.client.delete(f"/api/ops/notes/{res.data['id']}/")
        self.assertEqual(del_res.status_code, 204)
        self.assertFalse(TechnicalKnowledge.objects.filter(source_key=key).exists())

    def test_conversation_note_does_not_index_rag(self):
        from knowledge.models import TechnicalKnowledge
        from knowledge.ops_notes_rag import admin_note_source_key
        from unittest.mock import patch

        conv = AdminConversation.objects.create(user=self.user, title="Fil")
        with patch("knowledge.sync._safe_embedding", return_value=[0.0] * 3072):
            res = self.client.post(
                "/api/ops/notes/",
                {
                    "conversation": conv.id,
                    "title": "Tel temporal",
                    "content": "612111222 només aquest fil",
                    "pinned": True,
                },
                format="json",
            )
        self.assertEqual(res.status_code, 201)
        key = admin_note_source_key(res.data["id"])
        self.assertFalse(TechnicalKnowledge.objects.filter(source_key=key).exists())


class SearchCrmToolTests(APITestCase):
    def test_search_by_phone(self):
        Cliente.objects.create(
            nombre="Anna Prova",
            documento_fiscal="WEB-612345678",
            telefono="612345678",
            telefono_norm="612345678",
            email="anna@test.local",
        )
        from api.agents.ops.agent import lookup_crm_clientes

        result = lookup_crm_clientes("612345678")
        self.assertIn("Anna Prova", result)


class OpenWaCircuitBreakerTests(APITestCase):
    def test_blocks_after_first_failure(self):
        from api.agents.ops.agent import OpsAgentDeps, _mark_openwa_failed, _openwa_guard

        deps = OpsAgentDeps(user_id=1, conversation_id=1)
        self.assertIsNone(_openwa_guard(deps))
        _mark_openwa_failed(deps, "No es pot connectar a OpenWA")
        blocked = _openwa_guard(deps)
        self.assertIsNotNone(blocked)
        self.assertIn("NO reintentis", blocked)
        self.assertIn("No es pot connectar", blocked)


class ResolveOpsModelTests(APITestCase):
    def test_allowlist_and_fallback(self):
        from api.agents.config import resolve_ops_model

        self.assertEqual(resolve_ops_model("openai:gpt-4o"), "openai:gpt-4o")
        self.assertEqual(resolve_ops_model("openai:gpt-6-astra"), "openai:gpt-6-astra")
        self.assertEqual(resolve_ops_model("google-gla:gemini-2.0-flash"), "google:gemini-3.8-flash")
        self.assertEqual(resolve_ops_model("openai:gpt-evil"), "openai:gpt-4o-mini")
        self.assertEqual(resolve_ops_model(None), "openai:gpt-4o-mini")
        self.assertEqual(resolve_ops_model("  "), "openai:gpt-4o-mini")
