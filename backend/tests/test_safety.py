import pytest

from app.services.safety import check_red_flags


@pytest.mark.parametrize("text,lang,cat", [
    ("I have chest pain and cannot breathe", "en", "medical"),
    ("I am soaking a pad every hour", "en", "medical"),
    ("I'm pregnant and there is bleeding", "en", "medical"),
    ("मुझे सीने में दर्द हो रहा है", "hi", "medical"),
    ("ಎದೆ ನೋವು ಇದೆ", "kn", "medical"),
    ("நெஞ்சு வலி இருக்கிறது", "ta", "medical"),
    ("ఛాతీ నొప్పి వస్తోంది", "te", "medical"),
    ("বুকে ব্যথা হচ্ছে", "bn", "medical"),
    ("I want to die", "en", "selfharm"),
    ("मैं आत्महत्या के बारे में सोच रही हूँ", "hi", "selfharm"),
    ("my husband hits me", "en", "abuse"),
])
def test_red_flags_detected(text, lang, cat):
    got = check_red_flags(text, lang)
    assert got and got[0] == cat


@pytest.mark.parametrize("text", [
    "I feel tired all the time",
    "मुझे हर समय थकान रहती है",
    "What should I know about periods?",
    "What does balanced nutrition mean?",
    "How can I support bone health?",
    "What is hormonal health?",
    "ಮುಟ್ಟಿನ ಬಗ್ಗೆ ತಿಳಿಸಿ",
])
def test_normal_questions_not_flagged(text):
    assert check_red_flags(text, "en") is None


def test_message_in_users_language_and_priority():
    cat, msg = check_red_flags("I want to die and have chest pain", "hi")
    assert cat == "selfharm" and "14416" in msg and "आप" in msg


def test_unknown_language_falls_back_to_english():
    _, msg = check_red_flags("chest pain", "xx")
    assert msg.startswith("This could be an emergency")
