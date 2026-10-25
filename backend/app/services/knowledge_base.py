"""Curated, deliberately conservative knowledge base injected into the system prompt.

Keep entries short, general and non-prescriptive. Have a doctor on the team review
this file before the demo - it is the 'source of truth' the assistant leans on.
The whole KB is small enough to send every time, which also makes retrieval
language-independent (users can ask in any language).
"""

KNOWLEDGE_BASE: dict[str, str] = {
    "Persistent tiredness": (
        "Feeling tired for a long time has many possible causes: low iron (anaemia), thyroid problems, "
        "low vitamin D or B12, poor sleep, stress or low mood, and diabetes. It cannot be diagnosed from "
        "symptoms alone. If tiredness lasts more than about 2 weeks, or comes with dizziness, breathlessness, "
        "heavy periods, weight change or hair loss, a doctor can order simple blood tests "
        "(for example haemoglobin, thyroid, blood sugar, vitamin D/B12)."
    ),
    "Anaemia (low haemoglobin)": (
        "Common signs: tiredness, weakness, pale skin, dizziness, headaches, breathlessness on effort. "
        "Common causes in women: not enough iron in food, heavy periods, pregnancy. A blood test "
        "(haemoglobin) confirms it. Iron-rich foods: lentils, beans, green leafy vegetables, jaggery, "
        "eggs, fish, meat. Vitamin C foods (lemon, amla, guava) help absorption; tea or coffee with meals "
        "reduces it. Do not start iron tablets on your own - a doctor decides if and how much is needed."
    ),
    "Calcium, vitamin D and bone health": (
        "Bones weaken gradually, especially after menopause. Helpful habits: calcium-rich foods (milk, curd, "
        "paneer, ragi, sesame, green leafy vegetables, small fish eaten with bones), some safe morning sunlight "
        "for vitamin D, and regular weight-bearing activity such as walking. Signs that need a doctor: "
        "frequent fractures, back pain with loss of height, bone or joint pain that doesn't settle. "
        "Supplements and bone-density tests should be decided with a doctor."
    ),
    "Menstrual health": (
        "Cycles often run 21-35 days and bleeding lasts about 2-7 days, but every woman differs. "
        "See a doctor if: periods stop for 3 months or more (and you are not pregnant or menopausal), "
        "bleeding is very heavy (soaking a pad every 1-2 hours, or large clots), pain stops you from daily "
        "activities, bleeding happens between periods or after intercourse, or any bleeding after menopause. "
        "Tracking dates and symptoms helps the doctor."
    ),
    "PCOS": (
        "PCOS is a hormonal condition. Possible signs: irregular or missed periods, extra facial/body hair, "
        "acne, weight gain, thinning scalp hair, trouble conceiving. It is diagnosed by a doctor "
        "(history, blood tests, sometimes ultrasound). Regular activity, balanced meals and sleep help; "
        "treatment is decided by a doctor."
    ),
    "Menopause": (
        "Menopause means 12 months without a period, usually between ages 45 and 55. Common changes: hot flushes, "
        "night sweats, poor sleep, mood changes, vaginal dryness, and faster bone loss. These can be eased - "
        "a doctor can discuss options. Any bleeding after menopause needs a doctor's check."
    ),
    "Thyroid": (
        "An under- or over-active thyroid can cause tiredness, weight change, hair loss, feeling too cold or hot, "
        "and irregular periods. A simple blood test (TSH) checks it, and it is treatable."
    ),
    "Breast and cervical screening": (
        "Breast awareness: know how your breasts normally look and feel. See a doctor for a new lump, nipple "
        "discharge, skin dimpling or persistent pain in one area. Doctors advise clinical breast examination "
        "and mammography based on age and risk. Cervical cancer screening (HPV test, Pap smear or VIA) is "
        "generally advised from around age 30 and repeated as the doctor recommends; an HPV vaccine also exists. "
        "Ask a doctor which checks are right for you."
    ),
    "Pregnancy care": (
        "Register the pregnancy early and attend all antenatal check-ups. Iron-folic acid and calcium are "
        "given as advised by the health worker or doctor. Go to a hospital urgently for: vaginal bleeding, "
        "severe headache with blurred vision, swelling of face/hands, severe belly pain, fluid leaking, "
        "fever, or baby moving much less."
    ),
    "Urinary and vaginal health": (
        "Burning while passing urine, passing urine very often, or lower belly pain may be a urinary infection "
        "and needs a doctor - do not take leftover antibiotics. Drinking enough water and good hygiene help. "
        "Unusual smelly discharge, itching or pain also deserve a check."
    ),
    "Everyday nutrition for women": (
        "Many homemakers eat last or skip meals. Regular meals matter: include a protein food (dal, eggs, "
        "fish, curd, paneer), vegetables or greens, fruit, and whole grains each day. Drink water through the day. "
        "Needs differ in pregnancy, breastfeeding, menopause and illness - ask a doctor or nutritionist."
    ),
    "Mental wellbeing": (
        "Stress, worry, low mood and poor sleep are common and treatable. Talking to someone you trust helps. "
        "If sadness, hopelessness or loss of interest lasts more than 2 weeks, see a doctor or counsellor. "
        "Tele-MANAS (14416) offers free mental-health support in many languages."
    ),
}


def render_knowledge_base() -> str:
    return "\n\n".join(f"## {title}\n{body}" for title, body in KNOWLEDGE_BASE.items())
