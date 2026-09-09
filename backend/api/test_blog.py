from datetime import date

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.models import BlogArticle


class BlogArticleApiTests(APITestCase):
    def setUp(self):
        self.article = BlogArticle.objects.create(
            title="Test article",
            slug="test-article",
            excerpt="Short excerpt",
            body="Paragraph one.\n\nParagraph two.",
            category="prevencion",
            published_at=date.today(),
            is_published=True,
        )
        self.draft = BlogArticle.objects.create(
            title="Draft",
            slug="draft-article",
            excerpt="Hidden",
            body="Body",
            is_published=False,
        )
        User = get_user_model()
        self.user = User.objects.create_user(
            username="blogadmin",
            email="blogadmin@test.local",
            password="pass12345",
        )
        self.token = Token.objects.create(user=self.user)

    def test_public_list_hides_drafts(self):
        res = self.client.get("/api/blog/")
        self.assertEqual(res.status_code, 200)
        slugs = {item["slug"] for item in res.data}
        self.assertIn("test-article", slugs)
        self.assertNotIn("draft-article", slugs)

    def test_public_retrieve(self):
        res = self.client.get("/api/blog/test-article/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["title"], "Test article")
        self.assertIn("read_time", res.data)

    def test_create_requires_auth(self):
        res = self.client.post(
            "/api/blog/",
            {
                "title": "Nuevo",
                "excerpt": "ex",
                "body": "body",
                "category": "tecnico",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_admin_can_create_and_list_all(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        res = self.client.post(
            "/api/blog/",
            {
                "title": "Desde admin",
                "excerpt": "ex",
                "body": "Cuerpo del artículo",
                "category": "salud",
                "is_published": True,
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.data["slug"])

        listed = self.client.get("/api/blog/?all=1")
        self.assertEqual(listed.status_code, 200)
        slugs = {item["slug"] for item in listed.data}
        self.assertIn("draft-article", slugs)
        self.assertIn(res.data["slug"], slugs)
