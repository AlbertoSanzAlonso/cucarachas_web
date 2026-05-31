from api.agents.text_utils import limit_one_question


def test_limit_one_question_keeps_single_question():
    text = "Entenc. Quin tipus de plaga has vist?"
    assert limit_one_question(text) == text


def test_limit_one_question_trims_multiple():
    text = "Entenc el teu cas.\nQuantes n'has vist?\nDes de quan passa?"
    result = limit_one_question(text)
    assert "Quantes" in result
    assert "Des de quan" not in result
