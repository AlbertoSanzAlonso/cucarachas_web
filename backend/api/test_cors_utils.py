from api.cors_utils import is_allowed_cors_origin


def test_vercel_preview_origin_allowed():
    origin = "https://cucarachas-web-git-main-albertosanzdevs-projects.vercel.app"
    assert is_allowed_cors_origin(origin) is True


def test_production_origin_allowed():
    assert is_allowed_cors_origin("https://cucarachasbarcelona.cat") is True


def test_unknown_origin_rejected():
    assert is_allowed_cors_origin("https://evil.example.com") is False
