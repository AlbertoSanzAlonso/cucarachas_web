from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.agents.ops_agent import OpsAgentOutput
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

    @patch("api.agents.ops_agent.run_ops_agent")
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
        self.assertEqual(AdminMemoryNote.objects.filter(conversation=conv).count(), 1)
        self.assertIn("CRM", res.data["assistant_message"]["content"])
        mock_run.assert_called_once()

    @patch("api.agents.voice.synthesize_speech", return_value="ZGF0YQ==")
    @patch("api.agents.voice.transcribe_audio_upload", return_value="Busca el client del 612")
    @patch("api.agents.ops_agent.run_ops_agent")
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

    @patch("api.agents.ops_agent.run_ops_agent")
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

    @patch("api.agents.ops_agent.run_ops_agent")
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


class SearchCrmToolTests(APITestCase):
    def test_search_by_phone(self):
        Cliente.objects.create(
            nombre="Anna Prova",
            documento_fiscal="WEB-612345678",
            telefono="612345678",
            telefono_norm="612345678",
            email="anna@test.local",
        )
        from api.agents.ops_agent import lookup_crm_clientes

        result = lookup_crm_clientes("612345678")
        self.assertIn("Anna Prova", result)


class ResolveOpsModelTests(APITestCase):
    def test_allowlist_and_fallback(self):
        from api.agents.config import resolve_ops_model

        self.assertEqual(resolve_ops_model("openai:gpt-4o"), "openai:gpt-4o")
        self.assertEqual(resolve_ops_model("openai:gpt-6-astra"), "openai:gpt-6-astra")
        self.assertEqual(resolve_ops_model("google-gla:gemini-2.0-flash"), "google:gemini-3.8-flash")
        self.assertEqual(resolve_ops_model("openai:gpt-evil"), "openai:gpt-4o-mini")
        self.assertEqual(resolve_ops_model(None), "openai:gpt-4o-mini")
        self.assertEqual(resolve_ops_model("  "), "openai:gpt-4o-mini")
