
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { useNavigate, useLocation } from 'react-router-dom'
import ChatPanel from './features/chatbot/ChatPanel.jsx'
import HealthcareFinder from './features/healthcare/HealthcareFinder.jsx'
import { finderNavLabel } from './features/healthcare/strings.js'
import { useChat } from './hooks/useChat.js'
import { fetchMe, setAuthToken, clearAuthToken, setOnUnauthenticated } from './services/api.js'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import HealthTracker from './features/health/HealthTracker.jsx'
import Symptoms from './features/symptoms/Symptoms.jsx'
import Reminders from './features/reminders/Reminders.jsx'
import Reports from './features/reports/Reports.jsx'

const translations = {
  English: {
    home: "Home",
    tracker: "Health tracker",
    learn: "Learn",
    assistant: "AI assistant",
    heroTitle: "Your health, your way",
    heroSubtitle: "Your health matters, every single day. Find trusted health education, understand your wellbeing and take your next step with confidence.",
    heroPrimaryButton: "Explore your health",
    heroSecondaryButton: "Discover & learn",
    trackerKicker: "A LITTLE CHECK-IN WITH YOURSELF",
    trackerHeading: "Your health, your way",
    trackerIntro: "Keep a private record of how you're feeling, one day at a time.",
    trackerPeriodKicker: "01 · PERIOD TRACKER",
    trackerPeriodTitle: "Mark your period days",
    trackerPeriodDescription: "Select a date to mark or unmark it as a period day.",
    trackerChooseDate: "Choose a date",
    trackerMarkPeriodDay: "Mark period day",
    trackerRemovePeriodDay: "Remove period day",
    trackerDateRecorded: "date recorded in this session",
    trackerDatesRecorded: "dates recorded in this session",
    trackerWellnessKicker: "02 · DAILY WELLNESS",
    trackerWellnessTitle: "How are you feeling?",
    trackerWellnessDescription: "Choose the option that best describes how you feel today.",
    trackerMood: "Mood",
    trackerMoodGreat: "Great",
    trackerMoodGood: "Good",
    trackerMoodOkay: "Okay",
    trackerMoodLow: "Low",
    trackerMoodStressed: "Stressed",
    trackerSymptomsLabel: "Symptoms or observations",
    trackerSymptomCramps: "Cramps",
    trackerSymptomHeadache: "Headache",
    trackerSymptomTiredness: "Tiredness",
    trackerSymptomBloating: "Bloating",
    trackerNotesLabel: "Personal notes (optional)",
    trackerNotesPlaceholder: "Anything you'd like to remember...",
    trackerPrivacy: "Prototype only: these entries are held in page memory and are not saved to a medical record.",
    trackerDisclaimer: "This tracker is for personal awareness, not diagnosis or prediction. Seek advice from a qualified healthcare professional for health concerns.",
    learnKicker: "A HEALTHIER YOU STARTS WITH KNOWLEDGE",
    learnHeading: "Learn about your health",
    learnIntro: "Reliable health education starts with understanding your body. Explore topics at your own pace.",
    learnBadge: "Learn at your pace",
    learnAllTopics: "All topics",
    learnFiltersAria: "Filter health topics",
    learnQuickGuide: "✦ QUICK GUIDE",
    learnVideoComingSoon: "▷ VIDEO COMING SOON",
    learnShowLess: "Show less ↑",
    learnExploreTopic: "Explore topic ↗",
    learnBackToTopics: "Back to topics",
    learnWhatToKnow: "What to know",
    learnRemember: "Remember",
    learnConsult: "For personal medical concerns, consult a qualified healthcare professional.",
    learnVideoNoteTitle: "Doctor-verified videos, coming soon",
    learnVideoNoteBody: "We're preparing accessible health education resources. Video content will be added after appropriate review.",
    learnDisclaimer: "These introductory resources are for general awareness and do not replace advice from a qualified healthcare professional.",
    learnTopicMenstrual: "Menstrual health",
    learnTopicMenstrualDetail: "Understand your cycle",
    learnTopicNutrition: "Nutrition",
    learnTopicNutritionDetail: "Everyday nourishment",
    learnTopicBone: "Bone health",
    learnTopicBoneDetail: "Build healthy habits",
    learnTopicHormonal: "Hormonal health",
    learnTopicHormonalDetail: "Learn about changes",
    learnMenstrualIntro: "Understanding your menstrual cycle can help you recognise your own patterns and notice changes.",
    learnMenstrualPoint1: "Track the first day of each period and how long bleeding lasts.",
    learnMenstrualPoint2: "Notice symptoms such as cramps, mood changes, or changes in flow.",
    learnMenstrualPoint3: "Cycles can vary. Seek medical advice for severe pain, unusually heavy bleeding, or persistent changes.",
    learnMenstrualTakeaway: "Your cycle is personal. Tracking it can help you have more informed conversations with a healthcare professional.",
    learnNutritionIntro: "Everyday nourishment supports energy, growth, concentration, and overall wellbeing.",
    learnNutritionPoint1: "Aim for a variety of vegetables, fruits, whole grains, protein foods, and healthy fats.",
    learnNutritionPoint2: "Drink water regularly throughout the day.",
    learnNutritionPoint3: "Iron-rich foods, such as beans, lentils, and leafy greens, can be part of a balanced diet.",
    learnNutritionTakeaway: "There is no single perfect diet. Your needs depend on your age, health, culture, and circumstances.",
    learnBoneIntro: "Bones support your body and protect organs. Bone health matters throughout life.",
    learnBonePoint1: "Include calcium-containing foods such as dairy products or suitable fortified alternatives.",
    learnBonePoint2: "Vitamin D helps your body absorb calcium.",
    learnBonePoint3: "Regular weight-bearing movement, such as walking or dancing, can support bone health.",
    learnBoneTakeaway: "Ask a healthcare professional about bone health concerns or whether you need vitamin D assessment or supplements.",
    learnHormonalIntro: "Hormones help regulate processes such as menstrual cycles, sleep, mood, and metabolism.",
    learnHormonalPoint1: "Hormonal changes can happen during puberty, menstrual cycles, pregnancy, and menopause.",
    learnHormonalPoint2: "Sleep, balanced nutrition, and regular activity support general wellbeing.",
    learnHormonalPoint3: "Persistent or concerning symptoms deserve a conversation with a qualified healthcare professional.",
    learnHormonalTakeaway: "Symptoms alone cannot confirm a hormonal condition. A healthcare professional can help assess what is happening.",
    notFoundKicker: "PAGE NOT FOUND",
    notFoundTitle: "Looking for something?",
    notFoundText: "The page you are looking for does not exist or may have been moved.",
    notFoundButton: "Return to Home",
    assistantPageKicker: "A SUPPORTIVE SPACE TO ASK",
    assistantPageHeading: "Talk to Sakhi",
    assistantPageIntro: "Explore general health information in a calm, welcoming space.",
    assistantCardTitle: "Your health questions matter.",
    assistantCardSubtitle: "Start with a suggested question or type your own below.",
    assistantSuggestionLabel: "YOU CAN ASK ABOUT",
    assistantSuggestedQ1: "What should I know about periods?",
    assistantSuggestedQ2: "What does balanced nutrition mean?",
    assistantSuggestedQ3: "How can I support bone health?",
    assistantSuggestedQ4: "What is hormonal health?",
    assistantPanelTitle: "Sakhi Health Assistant",
    assistantPanelSubtitle: "Educational demo",
    assistantStatusDemo: "● Demo",
    assistantClearChat: "Clear Chat",
    assistantClearChatAria: "Clear chat conversation",
    assistantInputAria: "Your health question",
    assistantInputPlaceholder: "Ask a general health question...",
    assistantSend: "Send",
    assistantDisclaimer: "Demo responses only — not a diagnosis or a substitute for professional medical advice. Avoid entering personal or sensitive medical information.",
    homeAssistantKicker: "HERE WHEN YOU NEED A STARTING POINT",
    homeAssistantHeading: "Questions about your health?",
    homeAssistantIntro: "Explore health information in a simple, welcoming space. For symptoms or personal medical concerns, a qualified healthcare professional can help you decide what to do next.",
    homeAssistantInputLabel: "What would you like to learn about?",
    homeAssistantPrivacy: "This demo does not send or save your question.",
    chatInitialGreeting: "Hi! I'm Sakhi. I can help you explore general women's health information. What would you like to learn about?",
    chatReplyGreeting: "Hi! 🌸 Welcome to Sakhi. You can ask me general questions about menstrual health, nutrition, bone health, or hormonal health. What would you like to learn about?",
    chatReplyMenstrual: "🌷 Menstrual health: Cycles and symptoms can vary from person to person. Tracking period dates and symptoms may help you notice patterns. Severe pain, unusually heavy bleeding, or persistent changes are good reasons to seek advice from a healthcare professional.",
    chatReplyNutrition: "🥗 Nutrition: A varied diet with vegetables, fruits, whole grains, protein foods, and healthy fats supports general wellbeing. Beans, lentils, and leafy greens are examples of iron-containing foods. Individual nutrition needs vary.",
    chatReplyBone: "🦴 Bone health: Calcium and vitamin D are important for healthy bones. A varied diet and regular, age-appropriate physical activity can help support bone health. Ask a healthcare professional if you have concerns about supplements or your bone health.",
    chatReplyHormonal: "🌼 Hormonal health: Hormones help regulate many processes in the body, including menstrual cycles, puberty, and growth. Conditions like PCOS or PMS involve complex hormonal patterns. Symptoms alone cannot confirm a condition; a healthcare professional can help assess persistent or worrying symptoms.",
    chatReplyThanks: "You're welcome! 🌸 Keep exploring the Sakhi Learn section for general health education.",
    chatReplyFallback: "I'm a demo assistant, so I may not understand every question yet. Try asking about periods, nutrition, bone health, or hormones. For personal medical concerns, please speak with a qualified healthcare professional.",
  },
  हिन्दी: {
    home: "होम",
    tracker: "स्वास्थ्य ट्रैकर",
    learn: "सीखें",
    assistant: "AI सहायक",
    heroTitle: "आपका स्वास्थ्य, आपकी प्राथमिकता",
    heroSubtitle: "आपका स्वास्थ्य हर दिन महत्वपूर्ण है। विश्वसनीय स्वास्थ्य शिक्षा पाएँ, अपनी सेहत को समझें और आत्मविश्वास के साथ अगला कदम बढ़ाएँ।",
    heroPrimaryButton: "अपनी सेहत जानें",
    heroSecondaryButton: "जानें और सीखें",
    trackerKicker: "अपने साथ एक छोटी सी जाँच",
    trackerHeading: "आपका स्वास्थ्य, आपका तरीका",
    trackerIntro: "हर दिन, यह निजी रिकॉर्ड रखें कि आप कैसा महसूस कर रही हैं।",
    trackerPeriodKicker: "01 · पीरियड ट्रैकर",
    trackerPeriodTitle: "अपने पीरियड के दिन चिह्नित करें",
    trackerPeriodDescription: "किसी तारीख को पीरियड का दिन चिह्नित करने या हटाने के लिए चुनें।",
    trackerChooseDate: "तारीख चुनें",
    trackerMarkPeriodDay: "पीरियड का दिन चिह्नित करें",
    trackerRemovePeriodDay: "पीरियड का दिन हटाएँ",
    trackerDateRecorded: "तारीख इस सत्र में दर्ज",
    trackerDatesRecorded: "तारीखें इस सत्र में दर्ज",
    trackerWellnessKicker: "02 · दैनिक स्वास्थ्य",
    trackerWellnessTitle: "आप कैसा महसूस कर रही हैं?",
    trackerWellnessDescription: "वह विकल्प चुनें जो आज आपकी भावना को सबसे बेहतर बताता है।",
    trackerMood: "मूड",
    trackerMoodGreat: "बहुत अच्छा",
    trackerMoodGood: "अच्छा",
    trackerMoodOkay: "ठीक",
    trackerMoodLow: "कम",
    trackerMoodStressed: "तनाव में",
    trackerSymptomsLabel: "लक्षण या टिप्पणियाँ",
    trackerSymptomCramps: "ऐंठन",
    trackerSymptomHeadache: "सिरदर्द",
    trackerSymptomTiredness: "थकान",
    trackerSymptomBloating: "सूजन",
    trackerNotesLabel: "निजी नोट्स (वैकल्पिक)",
    trackerNotesPlaceholder: "कुछ भी जो आप याद रखना चाहें...",
    trackerPrivacy: "केवल प्रोटोटाइप: ये प्रविष्टियाँ पेज की मेमोरी में रहती हैं और किसी मेडिकल रिकॉर्ड में नहीं सहेजी जातीं।",
    trackerDisclaimer: "यह ट्रैकर व्यक्तिगत जागरूकता के लिए है, निदान या भविष्यवाणी के लिए नहीं। स्वास्थ्य संबंधी चिंताओं के लिए योग्य स्वास्थ्य पेशेवर से सलाह लें।",
    learnKicker: "ज्ञान से शुरू होती है स्वस्थ आप",
    learnHeading: "अपने स्वास्थ्य के बारे में जानें",
    learnIntro: "विश्वसनीय स्वास्थ्य शिक्षा आपके शरीर को समझने से शुरू होती है। विषयों को अपनी गति से देखें।",
    learnBadge: "अपनी गति से सीखें",
    learnAllTopics: "सभी विषय",
    learnFiltersAria: "स्वास्थ्य विषय छाँटें",
    learnQuickGuide: "✦ संक्षिप्त गाइड",
    learnVideoComingSoon: "▷ वीडियो जल्द आ रहा है",
    learnShowLess: "कम दिखाएँ ↑",
    learnExploreTopic: "विषय देखें ↗",
    learnBackToTopics: "विषयों पर वापस जाएँ",
    learnWhatToKnow: "क्या जानें",
    learnRemember: "याद रखें",
    learnConsult: "व्यक्तिगत चिकित्सा चिंताओं के लिए योग्य स्वास्थ्य पेशेवर से सलाह लें।",
    learnVideoNoteTitle: "डॉक्टर-सत्यापित वीडियो, जल्द आ रहे हैं",
    learnVideoNoteBody: "हम सुलभ स्वास्थ्य शिक्षा संसाधन तैयार कर रहे हैं। उपयुक्त समीक्षा के बाद वीडियो सामग्री जोड़ी जाएगी।",
    learnDisclaimer: "ये परिचयात्मक संसाधन सामान्य जागरूकता के लिए हैं और योग्य स्वास्थ्य पेशेवर की सलाह की जगह नहीं लेते।",
    learnTopicMenstrual: "मासिक धर्म स्वास्थ्य",
    learnTopicMenstrualDetail: "अपने चक्र को समझें",
    learnTopicNutrition: "पोषण",
    learnTopicNutritionDetail: "रोज़मर्रा का पोषण",
    learnTopicBone: "हड्डी स्वास्थ्य",
    learnTopicBoneDetail: "स्वस्थ आदतें बनाएँ",
    learnTopicHormonal: "हार्मोनल स्वास्थ्य",
    learnTopicHormonalDetail: "परिवर्तनों के बारे में जानें",
    learnMenstrualIntro: "अपने मासिक चक्र को समझना आपको अपनी पैटर्न पहचानने और बदलाव नोटिस करने में मदद कर सकता है।",
    learnMenstrualPoint1: "हर पीरियड का पहला दिन और रक्तस्राव कितने समय तक रहता है, यह दर्ज करें।",
    learnMenstrualPoint2: "ऐंठन, मूड में बदलाव, या प्रवाह में बदलाव जैसे लक्षणों पर ध्यान दें।",
    learnMenstrualPoint3: "चक्र अलग-अलग हो सकते हैं। तेज दर्द, असामान्य रूप से भारी रक्तस्राव, या लगातार बदलाव के लिए चिकित्सा सलाह लें।",
    learnMenstrualTakeaway: "आपका चक्र व्यक्तिगत है। इसे ट्रैक करने से स्वास्थ्य पेशेवर से अधिक सूचित बातचीत करने में मदद मिल सकती है।",
    learnNutritionIntro: "रोज़मर्रा का पोषण ऊर्जा, वृद्धि, एकाग्रता और समग्र स्वास्थ्य का समर्थन करता है।",
    learnNutritionPoint1: "सब्जियों, फलों, साबुत अनाज, प्रोटीन खाद्य पदार्थों और स्वस्थ वसा की विविधता रखें।",
    learnNutritionPoint2: "दिन भर नियमित रूप से पानी पिएँ।",
    learnNutritionPoint3: "आयरन युक्त खाद्य पदार्थ, जैसे सेम, दालें और पत्तेदार साग, संतुलित आहार का हिस्सा हो सकते हैं।",
    learnNutritionTakeaway: "कोई एक पूर्ण आहार नहीं है। आपकी ज़रूरतें आपकी उम्र, स्वास्थ्य, संस्कृति और परिस्थितियों पर निर्भर करती हैं।",
    learnBoneIntro: "हड्डियाँ आपके शरीर को सहारा देती हैं और अंगों की रक्षा करती हैं। हड्डी स्वास्थ्य जीवन भर मायने रखता है।",
    learnBonePoint1: "कैल्शियम वाले खाद्य पदार्थ शामिल करें, जैसे डेयरी उत्पाद या उपयुक्त फोर्टिफाइड विकल्प।",
    learnBonePoint2: "विटामिन D आपके शरीर को कैल्शियम अवशोषित करने में मदद करता है।",
    learnBonePoint3: "नियमित भार-वहन गतिविधि, जैसे चलना या नाचना, हड्डी स्वास्थ्य का समर्थन कर सकती है।",
    learnBoneTakeaway: "हड्डी स्वास्थ्य संबंधी चिंताओं के बारे में स्वास्थ्य पेशेवर से पूछें, या क्या आपको विटामिन D जाँच या पूरक की आवश्यकता है।",
    learnHormonalIntro: "हार्मोन मासिक चक्र, नींद, मूड और चयापचय जैसी प्रक्रियाओं को नियंत्रित करने में मदद करते हैं।",
    learnHormonalPoint1: "हार्मोनल बदलाव यौवन, मासिक चक्र, गर्भावस्था और रजोनिवृत्ति के दौरान हो सकते हैं।",
    learnHormonalPoint2: "नींद, संतुलित पोषण और नियमित गतिविधि सामान्य स्वास्थ्य का समर्थन करते हैं।",
    learnHormonalPoint3: "लगातार या चिंताजनक लक्षणों पर योग्य स्वास्थ्य पेशेवर से बात करनी चाहिए।",
    learnHormonalTakeaway: "केवल लक्षणों से हार्मोनल स्थिति की पुष्टि नहीं होती। स्वास्थ्य पेशेवर यह समझने में मदद कर सकते हैं कि क्या हो रहा है।",
    notFoundKicker: "पेज नहीं मिला",
    notFoundTitle: "कुछ खोज रहे हैं?",
    notFoundText: "आप जिस पेज की तलाश कर रहे हैं वह मौजूद नहीं है या हटाया जा चुका है।",
    notFoundButton: "होम पर लौटें",
    assistantPageKicker: "पूछने के लिए एक सहायक स्थान",
    assistantPageHeading: "सखी से बात करें",
    assistantPageIntro: "एक शांत और स्वागत भरे माहौल में सामान्य स्वास्थ्य जानकारी जानें।",
    assistantCardTitle: "आपके स्वास्थ्य के सवाल महत्वपूर्ण हैं।",
    assistantCardSubtitle: "सुझाए गए सवाल से शुरू करें या नीचे अपना सवाल लिखें।",
    assistantSuggestionLabel: "आप इनके बारे में पूछ सकती हैं",
    assistantSuggestedQ1: "पीरियड्स के बारे में मुझे क्या जानना चाहिए?",
    assistantSuggestedQ2: "संतुलित पोषण का क्या अर्थ है?",
    assistantSuggestedQ3: "मैं हड्डियों के स्वास्थ्य का समर्थन कैसे कर सकती हूँ?",
    assistantSuggestedQ4: "हार्मोनल स्वास्थ्य क्या है?",
    assistantPanelTitle: "सखी स्वास्थ्य सहायक",
    assistantPanelSubtitle: "शैक्षणिक डेमो",
    assistantStatusDemo: "● डेमो",
    assistantClearChat: "चैट साफ़ करें",
    assistantClearChatAria: "चैट बातचीत साफ़ करें",
    assistantInputAria: "आपका स्वास्थ्य संबंधी सवाल",
    assistantInputPlaceholder: "सामान्य स्वास्थ्य संबंधी सवाल पूछें...",
    assistantSend: "भेजें",
    assistantDisclaimer: "केवल डेमो प्रतिक्रियाएँ — यह कोई निदान या पेशेवर चिकित्सा सलाह का विकल्प नहीं है। व्यक्तिगत या संवेदनशील चिकित्सा जानकारी दर्ज करने से बचें।",
    homeAssistantKicker: "जब आपको एक शुरुआत की ज़रूरत हो",
    homeAssistantHeading: "स्वास्थ्य के बारे में सवाल?",
    homeAssistantIntro: "सरल और स्वागत भरे माहौल में स्वास्थ्य जानकारी प्राप्त करें। व्यक्तिगत लक्षणों या स्वास्थ्य चिंताओं के लिए, एक योग्य स्वास्थ्य पेशेवर अगला कदम तय करने में मदद कर सकते हैं।",
    homeAssistantInputLabel: "आप किस बारे में जानना चाहती हैं?",
    homeAssistantPrivacy: "यह डेमो आपके सवाल को भेजता या सहेजता नहीं है।",
    chatInitialGreeting: "नमस्ते! मैं सखी हूँ। मैं महिलाओं के सामान्य स्वास्थ्य की जानकारी समझने में आपकी मदद कर सकती हूँ। आप किस बारे में जानना चाहेंगी?",
    chatReplyGreeting: "नमस्ते! 🌸 सखी में आपका स्वागत है। आप मुझसे मासिक धर्म, पोषण, हड्डियों के स्वास्थ्य या हार्मोनल स्वास्थ्य के बारे में सामान्य प्रश्न पूछ सकती हैं। आप किस बारे में जानना चाहेंगी?",
    chatReplyMenstrual: "🌷 मासिक धर्म स्वास्थ्य: चक्र और लक्षण हर व्यक्ति में अलग हो सकते हैं। पीरियड की तारीखें और लक्षण ट्रैक करने से आपको अपना पैटर्न समझने में मदद मिल सकती है। गंभीर दर्द, अत्यधिक रक्तस्राव या लगातार बदलाव होने पर स्वास्थ्य पेशेवर से सलाह लेना उचित है।",
    chatReplyNutrition: "🥗 पोषण: सब्जियाँ, फल, साबुत अनाज, प्रोटीन और स्वस्थ वसा से भरपूर विविध आहार सामान्य स्वास्थ्य को बढ़ावा देता है। दालें, फलियाँ और हरी पत्तेदार सब्जियाँ आयरन युक्त खाद्य पदार्थों के उदाहरण हैं। व्यक्तिगत पोषण संबंधी ज़रूरतें अलग-अलग हो सकती हैं।",
    chatReplyBone: "🦴 हड्डियों का स्वास्थ्य: मजबूत हड्डियों के लिए कैल्शियम और विटामिन D महत्वपूर्ण हैं। संतुलित आहार और नियमित शारीरिक गतिविधि हड्डियों के स्वास्थ्य को सहारा दे सकती है। सप्लीमेंट्स या हड्डियों से जुड़ी किसी चिंता के लिए डॉक्टर से परामर्श लें।",
    chatReplyHormonal: "🌼 हार्मोनल स्वास्थ्य: हार्मोन मासिक धर्म, यौवन और शारीरिक विकास सहित शरीर की कई प्रक्रियाओं को नियंत्रित करते हैं। PCOS या PMS जैसी स्थितियाँ जटिल हार्मोनल पैटर्न से जुड़ी होती हैं। केवल लक्षणों से किसी स्थिति की पुष्टि नहीं हो सकती; लगातार लक्षणों के लिए स्वास्थ्य पेशेवर से परामर्श करें।",
    chatReplyThanks: "आपका स्वागत है! 🌸 सामान्य स्वास्थ्य शिक्षा के लिए सखी के सीखें अनुभाग को देखना जारी रखें।",
    chatReplyFallback: "मैं एक डेमो सहायक हूँ, इसलिए हो सकता है कि मैं हर सवाल न समझ सकूँ। कृपया पीरियड्स, पोषण, हड्डियों के स्वास्थ्य या हार्मोन के बारे में पूछें। व्यक्तिगत चिकित्सा चिंताओं के लिए योग्य स्वास्थ्य पेशेवर से बात करें।",
  },
  ಕನ್ನಡ: {
    home: "ಮುಖಪುಟ",
    tracker: "ಆರೋಗ್ಯ ಟ್ರ್ಯಾಕರ್",
    learn: "ತಿಳಿಯಿರಿ",
    assistant: "AI ಸಹಾಯಕ",
    heroTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ, ನಿಮ್ಮ ಆಯ್ಕೆ",
    heroSubtitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರತಿ ದಿನ ಮುಖ್ಯ. ನಂಬಲರ್ಹ ಆರೋಗ್ಯ ಶಿಕ್ಷಣವನ್ನು ಪಡೆಯಿರಿ, ನಿಮ್ಮ ಯೋಗಕ್ಷೇಮವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮುಂದಿನ ಹೆಜ್ಜೆ ಇಡಿ.",
    heroPrimaryButton: "ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ಅನ್ವೇಷಿಸಿ",
    heroSecondaryButton: "ಅನ್ವೇಷಿಸಿ ಮತ್ತು ತಿಳಿಯಿರಿ",
    trackerKicker: "ನಿಮ್ಮೊಂದಿಗೆ ಒಂದು ಸಣ್ಣ ಚೆಕ್-ಇನ್",
    trackerHeading: "ನಿಮ್ಮ ಆರೋಗ್ಯ, ನಿಮ್ಮ ಆಯ್ಕೆ",
    trackerIntro: "ನೀವು ಹೇಗೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬುದರ ಖಾಸಗಿ ದಾಖಲೆಯನ್ನು, ಒಂದು ದಿನದಿಂದ ಒಂದು ದಿನಕ್ಕೆ ಇರಿಸಿಕೊಳ್ಳಿ.",
    trackerPeriodKicker: "01 · ಪೀರಿಯಡ್ ಟ್ರ್ಯಾಕರ್",
    trackerPeriodTitle: "ನಿಮ್ಮ ಪೀರಿಯಡ್ ದಿನಗಳನ್ನು ಗುರುತಿಸಿ",
    trackerPeriodDescription: "ಪೀರಿಯಡ್ ದಿನವಾಗಿ ಗುರುತಿಸಲು ಅಥವಾ ತೆಗೆದುಹಾಕಲು ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    trackerChooseDate: "ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    trackerMarkPeriodDay: "ಪೀರಿಯಡ್ ದಿನವನ್ನು ಗುರುತಿಸಿ",
    trackerRemovePeriodDay: "ಪೀರಿಯಡ್ ದಿನವನ್ನು ತೆಗೆದುಹಾಕಿ",
    trackerDateRecorded: "ದಿನಾಂಕ ಈ ಸೆಷನ್‌ನಲ್ಲಿ ದಾಖಲಾಗಿದೆ",
    trackerDatesRecorded: "ದಿನಾಂಕಗಳು ಈ ಸೆಷನ್‌ನಲ್ಲಿ ದಾಖಲಾಗಿವೆ",
    trackerWellnessKicker: "02 · ದೈನಂದಿನ ಯೋಗಕ್ಷೇಮ",
    trackerWellnessTitle: "ನೀವು ಹೇಗೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?",
    trackerWellnessDescription: "ಇಂದು ನಿಮ್ಮ ಭಾವನೆಯನ್ನು ಉತ್ತಮವಾಗಿ ವಿವರಿಸುವ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ.",
    trackerMood: "ಮನಸ್ಥಿತಿ",
    trackerMoodGreat: "ಅತ್ಯುತ್ತಮ",
    trackerMoodGood: "ಒಳ್ಳೆಯದು",
    trackerMoodOkay: "ಸರಿ",
    trackerMoodLow: "ಕಡಿಮೆ",
    trackerMoodStressed: "ಒತ್ತಡ",
    trackerSymptomsLabel: "ಲಕ್ಷಣಗಳು ಅಥವಾ ಗಮನಾರ್ಹ ವಿಷಯಗಳು",
    trackerSymptomCramps: "ಸೆಳೆತ",
    trackerSymptomHeadache: "ತಲೆನೋವು",
    trackerSymptomTiredness: "ಆಯಾಸ",
    trackerSymptomBloating: "ಉಬ್ಬರ",
    trackerNotesLabel: "ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)",
    trackerNotesPlaceholder: "ನೀವು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಲು ಬಯಸುವುದು...",
    trackerPrivacy: "ಪ್ರೋಟೋಟೈಪ್ ಮಾತ್ರ: ಈ ನಮೂದುಗಳು ಪುಟದ ಮೆಮೊರಿಯಲ್ಲಿವೆ ಮತ್ತು ವೈದ್ಯಕೀಯ ದಾಖಲೆಗೆ ಉಳಿಸಲಾಗುವುದಿಲ್ಲ.",
    trackerDisclaimer: "ಈ ಟ್ರ್ಯಾಕರ್ ವೈಯಕ್ತಿಕ ಜಾಗೃತಿಗಾಗಿ, ರೋಗನಿರ್ಣಯ ಅಥವಾ ಭವಿಷ್ಯವಾಣಿಗಾಗಿ ಅಲ್ಲ. ಆರೋಗ್ಯ ಕಾಳಜಿಗಳಿಗೆ ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    learnKicker: "ಜ್ಞಾನದಿಂದ ಆರಂಭವಾಗುವ ಆರೋಗ್ಯಕರ ನೀವು",
    learnHeading: "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ",
    learnIntro: "ನಂಬಲರ್ಹ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ನಿಮ್ಮ ದೇಹವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದರಿಂದ ಆರಂಭವಾಗುತ್ತದೆ. ವಿಷಯಗಳನ್ನು ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಅನ್ವೇಷಿಸಿ.",
    learnBadge: "ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ತಿಳಿಯಿರಿ",
    learnAllTopics: "ಎಲ್ಲಾ ವಿಷಯಗಳು",
    learnFiltersAria: "ಆರೋಗ್ಯ ವಿಷಯಗಳನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ",
    learnQuickGuide: "✦ ತ್ವರಿತ ಮಾರ್ಗದರ್ಶಿ",
    learnVideoComingSoon: "▷ ವೀಡಿಯೊ ಶೀಘ್ರದಲ್ಲೇ",
    learnShowLess: "ಕಡಿಮೆ ತೋರಿಸಿ ↑",
    learnExploreTopic: "ವಿಷಯವನ್ನು ಅನ್ವೇಷಿಸಿ ↗",
    learnBackToTopics: "ವಿಷಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    learnWhatToKnow: "ತಿಳಿಯಬೇಕಾದುದು",
    learnRemember: "ನೆನಪಿಡಿ",
    learnConsult: "ವೈಯಕ್ತಿಕ ವೈದ್ಯಕೀಯ ಕಾಳಜಿಗಳಿಗೆ ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    learnVideoNoteTitle: "ವೈದ್ಯರು ಪರಿಶೀಲಿಸಿದ ವೀಡಿಯೊಗಳು, ಶೀಘ್ರದಲ್ಲೇ",
    learnVideoNoteBody: "ನಾವು ಸುಲಭವಾಗಿ ತಲುಪುವ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದೇವೆ. ಸೂಕ್ತ ಪರಿಶೀಲನೆಯ ನಂತರ ವೀಡಿಯೊ ವಿಷಯ ಸೇರಿಸಲಾಗುತ್ತದೆ.",
    learnDisclaimer: "ಈ ಪರಿಚಯಾತ್ಮಕ ಸಂಪನ್ಮೂಲಗಳು ಸಾಮಾನ್ಯ ಜಾಗೃತಿಗಾಗಿ ಮತ್ತು ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರ ಸಲಹೆಯನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ.",
    learnTopicMenstrual: "ಋತುಚಕ್ರದ ಆರೋಗ್ಯ",
    learnTopicMenstrualDetail: "ನಿಮ್ಮ ಚಕ್ರವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    learnTopicNutrition: "ಪೋಷಣೆ",
    learnTopicNutritionDetail: "ದೈನಂದಿನ ಪೋಷಣೆ",
    learnTopicBone: "ಎಲುಬಿನ ಆರೋಗ್ಯ",
    learnTopicBoneDetail: "ಆರೋಗ್ಯಕರ ಅಭ್ಯಾಸಗಳನ್ನು ಬೆಳೆಸಿ",
    learnTopicHormonal: "ಹಾರ್ಮೋನ್ ಆರೋಗ್ಯ",
    learnTopicHormonalDetail: "ಬದಲಾವಣೆಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ",
    learnMenstrualIntro: "ನಿಮ್ಮ ಋತುಚಕ್ರವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಮಾದರಿಗಳನ್ನು ಗುರುತಿಸಲು ಮತ್ತು ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಲು ಸಹಾಯ ಮಾಡಬಹುದು.",
    learnMenstrualPoint1: "ಪ್ರತಿ ಪೀರಿಯಡ್‌ನ ಮೊದಲ ದಿನ ಮತ್ತು ರಕ್ತಸ್ರಾವ ಎಷ್ಟು ಕಾಲ ಉಳಿಯುತ್ತದೆ ಎಂಬುದನ್ನು ದಾಖಲಿಸಿ.",
    learnMenstrualPoint2: "ಸೆಳೆತ, ಮನಸ್ಥಿತಿ ಬದಲಾವಣೆ ಅಥವಾ ಹರಿವಿನ ಬದಲಾವಣೆಯಂತಹ ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ.",
    learnMenstrualPoint3: "ಚಕ್ರಗಳು ಬದಲಾಗಬಹುದು. ತೀವ್ರ ನೋವು, ಅಸಾಮಾನ್ಯವಾಗಿ ಹೆಚ್ಚು ರಕ್ತಸ್ರಾವ ಅಥವಾ ನಿರಂತರ ಬದಲಾವಣೆಗಳಿಗೆ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    learnMenstrualTakeaway: "ನಿಮ್ಮ ಚಕ್ರ ವೈಯಕ್ತಿಕ. ಅದನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಹೆಚ್ಚು ಮಾಹಿತಿಯುಕ್ತ ಸಂಭಾಷಣೆಗೆ ಸಹಾಯ ಮಾಡಬಹುದು.",
    learnNutritionIntro: "ದೈನಂದಿನ ಪೋಷಣೆ ಶಕ್ತಿ, ಬೆಳವಣಿಗೆ, ಏಕಾಗ್ರತೆ ಮತ್ತು ಒಟ್ಟಾರೆ ಯೋಗಕ್ಷೇಮವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.",
    learnNutritionPoint1: "ತರಕಾರಿಗಳು, ಹಣ್ಣುಗಳು, ಧಾನ್ಯಗಳು, ಪ್ರೋಟೀನ್ ಆಹಾರಗಳು ಮತ್ತು ಆರೋಗ್ಯಕರ ಕೊಬ್ಬುಗಳ ವೈವಿಧ್ಯವನ್ನು ಗುರಿಯಾಗಿರಿಸಿ.",
    learnNutritionPoint2: "ದಿನದುದ್ದಕ್ಕೂ ನಿಯಮಿತವಾಗಿ ನೀರು ಕುಡಿಯಿರಿ.",
    learnNutritionPoint3: "ಕಬ್ಬಿಣ ಸಮೃದ್ಧ ಆಹಾರಗಳು, ಉದಾಹರಣೆಗೆ ಬೀನ್ಸ್, ಬೇಳೆಕಾಳುಗಳು ಮತ್ತು ಎಲೆಕೋಸು ತರಕಾರಿಗಳು, ಸಮತೋಲಿತ ಆಹಾರದ ಭಾಗವಾಗಬಹುದು.",
    learnNutritionTakeaway: "ಒಂದೇ ಪರಿಪೂರ್ಣ ಆಹಾರವಿಲ್ಲ. ನಿಮ್ಮ ಅಗತ್ಯಗಳು ನಿಮ್ಮ ವಯಸ್ಸು, ಆರೋಗ್ಯ, ಸಂಸ್ಕೃತಿ ಮತ್ತು ಸಂದರ್ಭಗಳ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿವೆ.",
    learnBoneIntro: "ಎಲುಬುಗಳು ನಿಮ್ಮ ದೇಹವನ್ನು ಆಧರಿಸುತ್ತವೆ ಮತ್ತು ಅಂಗಗಳನ್ನು ರಕ್ಷಿಸುತ್ತವೆ. ಎಲುಬಿನ ಆರೋಗ್ಯ ಜೀವನಪೂರ್ತಿ ಮುಖ್ಯ.",
    learnBonePoint1: "ಡೈರಿ ಉತ್ಪನ್ನಗಳು ಅಥವಾ ಸೂಕ್ತ ಫೋರ್ಟಿಫೈಡ್ ಪರ್ಯಾಯಗಳಂತಹ ಕ್ಯಾಲ್ಸಿಯಂ ಇರುವ ಆಹಾರಗಳನ್ನು ಸೇರಿಸಿ.",
    learnBonePoint2: "ವಿಟಮಿನ್ D ನಿಮ್ಮ ದೇಹಕ್ಕೆ ಕ್ಯಾಲ್ಸಿಯಂ ಹೀರಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    learnBonePoint3: "ನಡಿಗೆ ಅಥವಾ ನೃತ್ಯದಂತಹ ನಿಯಮಿತ ತೂಕ ಹೊರುವ ಚಲನೆ ಎಲುಬಿನ ಆರೋಗ್ಯವನ್ನು ಬೆಂಬಲಿಸಬಹುದು.",
    learnBoneTakeaway: "ಎಲುಬಿನ ಆರೋಗ್ಯ ಕಾಳಜಿಗಳ ಬಗ್ಗೆ ಅಥವಾ ನಿಮಗೆ ವಿಟಮಿನ್ D ಮೌಲ್ಯಮಾಪನ ಅಥವಾ ಪೂರಕಗಳ ಅಗತ್ಯವಿದೆಯೇ ಎಂದು ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಕೇಳಿ.",
    learnHormonalIntro: "ಹಾರ್ಮೋನ್‌ಗಳು ಋತುಚಕ್ರ, ನಿದ್ರೆ, ಮನಸ್ಥಿತಿ ಮತ್ತು ಚಯಾಪಚಯದಂತಹ ಪ್ರಕ್ರಿಯೆಗಳನ್ನು ನಿಯಂತ್ರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ.",
    learnHormonalPoint1: "ಹಾರ್ಮೋನ್ ಬದಲಾವಣೆಗಳು ಯೌವನಾರಂಭ, ಋತುಚಕ್ರ, ಗರ್ಭಧಾರಣೆ ಮತ್ತು ಋತುಬಂಧದ ಸಮಯದಲ್ಲಿ ಆಗಬಹುದು.",
    learnHormonalPoint2: "ನಿದ್ರೆ, ಸಮತೋಲಿತ ಪೋಷಣೆ ಮತ್ತು ನಿಯಮಿತ ಚಟುವಟಿಕೆ ಸಾಮಾನ್ಯ ಯೋಗಕ್ಷೇಮವನ್ನು ಬೆಂಬಲಿಸುತ್ತವೆ.",
    learnHormonalPoint3: "ನಿರಂತರ ಅಥವಾ ಚಿಂತೆಗೀಡುಮಾಡುವ ಲಕ್ಷಣಗಳಿಗೆ ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಮಾತನಾಡುವುದು ಸೂಕ್ತ.",
    learnHormonalTakeaway: "ಲಕ್ಷಣಗಳು ಮಾತ್ರ ಹಾರ್ಮೋನ್ ಸಂಬಂಧಿತ ಸ್ಥಿತಿಯನ್ನು ದೃಢಪಡಿಸುವುದಿಲ್ಲ. ಆರೋಗ್ಯ ವೃತ್ತಿಪರರು ಏನಾಗುತ್ತಿದೆ ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಬಹುದು.",
    notFoundKicker: "ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ",
    notFoundTitle: "ಏನನ್ನಾದರೂ ಹುಡುಕುತ್ತಿದ್ದೀರಾ?",
    notFoundText: "ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟವು ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ ಅಥವಾ ಸ್ಥಳಾಂತರಿಸಿರಬಹುದು.",
    notFoundButton: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    assistantPageKicker: "ಕೇಳಲು ಒಂದು ಸಹಾಯಕ ಸ್ಥಳ",
    assistantPageHeading: "ಸಖಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ",
    assistantPageIntro: "ಶಾಂತ, ಆಹ್ಲಾದಕರ ಜಾಗದಲ್ಲಿ ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಅನ್ವೇಷಿಸಿ.",
    assistantCardTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಪ್ರಶ್ನೆಗಳು ಮುಖ್ಯವಾಗಿವೆ.",
    assistantCardSubtitle: "ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ ಅಥವಾ ಕೆಳಗೆ ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ.",
    assistantSuggestionLabel: "ನೀವು ಇವುಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು",
    assistantSuggestedQ1: "ಪೀರಿಯಡ್ಸ್ ಬಗ್ಗೆ ನಾನು ಏನು ತಿಳಿದುಕೊಳ್ಳಬೇಕು?",
    assistantSuggestedQ2: "ಸಮತೋಲಿತ ಪೋಷಣೆ ಎಂದರೆ ಏನು?",
    assistantSuggestedQ3: "ಮೂಳೆಗಳ ಆರೋಗ್ಯವನ್ನು ನಾನು ಹೇಗೆ ಬೆಂಬಲಿಸಬಹುದು?",
    assistantSuggestedQ4: "ಹಾರ್ಮೋನ್ ಆರೋಗ್ಯ ಎಂದರೇನು?",
    assistantPanelTitle: "ಸಖಿ ಆರೋಗ್ಯ ಸಹಾಯಕ",
    assistantPanelSubtitle: "ಶೈಕ್ಷಣಿಕ ಡೆಮೊ",
    assistantStatusDemo: "● ಡೆಮೊ",
    assistantClearChat: "ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ",
    assistantClearChatAria: "ಚಾಟ್ ಸಂಭಾಷಣೆಯನ್ನು ತೆರವುಗೊಳಿಸಿ",
    assistantInputAria: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆ",
    assistantInputPlaceholder: "ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...",
    assistantSend: "ಕಳುಹಿಸಿ",
    assistantDisclaimer: "ಡೆಮೊ ಪ್ರತಿಕ್ರಿಯೆಗಳು ಮಾತ್ರ — ರೋಗನಿರ್ಣಯ ಅಥವಾ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಸಲಹೆಗೆ ಬದಲಿಯಾಗಿಲ್ಲ. ವೈಯಕ್ತಿಕ ಅಥವಾ ಸೂಕ್ಷ್ಮ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ.",
    homeAssistantKicker: "ನಿಮಗೆ ಒಂದು ಆರಂಭ ಬೇಕಾದಾಗ",
    homeAssistantHeading: "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?",
    homeAssistantIntro: "ಸರಳ, ಆಹ್ಲಾದಕರ ಜಾಗದಲ್ಲಿ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಅನ್ವೇಷಿಸಿ. ರೋಗಲಕ್ಷಣಗಳು ಅಥವಾ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಕಾಳಜಿಗಳಿಗಾಗಿ, ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರು ಮುಂದಿನ ಕ್ರಮವನ್ನು ನಿರ್ಧರಿಸಲು ಸಹಾಯ ಮಾಡಬಹುದು.",
    homeAssistantInputLabel: "ನೀವು ಯಾವುದರ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?",
    homeAssistantPrivacy: "ಈ ಡೆಮೊ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕಳುಹಿಸುವುದಿಲ್ಲ ಅಥವಾ ಉಳಿಸುವುದಿಲ್ಲ.",
    chatInitialGreeting: "ನಮಸ್ಕಾರ! ನಾನು ಸಖಿ. ಮಹಿಳೆಯರ ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಅನ್ವೇಷಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಯಾವುದರ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?",
    chatReplyGreeting: "ನಮಸ್ಕಾರ! 🌸 ಸಖಿಗೆ ಸ್ವಾಗತ. ಮುಟ್ಟು, ಪೋಷಣೆ, ಮೂಳೆಗಳ ಆರೋಗ್ಯ ಅಥವಾ ಹಾರ್ಮೋನ್ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನೀವು ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು. ನೀವು ಯಾವುದರ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?",
    chatReplyMenstrual: "🌷 ಮುಟ್ಟಿನ ಆರೋಗ್ಯ: ಮುಟ್ಟಿನ ಚಕ್ರ ಮತ್ತು ಲಕ್ಷಣಗಳು ವ್ಯಕ್ತಿಯಿಂದ ವ್ಯಕ್ತಿಗೆ ಬದಲಾಗಬಹುದು. ದಿನಾಂಕ ಮತ್ತು ಲಕ್ಷಣಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ನಿಮ್ಮ ಮಾದರಿಯನ್ನು ಗಮನಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ತೀವ್ರ ನೋವು, ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ ಅಥವಾ ನಿರಂತರ ಬದಲಾವಣೆಗಳಿದ್ದಲ್ಲಿ ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯುವುದು ಸೂಕ್ತ.",
    chatReplyNutrition: "🥗 ಪೋಷಣೆ: ತರಕಾರಿಗಳು, ಹಣ್ಣುಗಳು, ಧಾನ್ಯಗಳು, ಪ್ರೋಟೀನ್ ಮತ್ತು ಆರೋಗ್ಯಕರ ಕೊಬ್ಬುಗಳನ್ನು ಒಳಗೊಂಡ ವೈವಿಧ್ಯಮಯ ಆಹಾರವು ಒಟ್ಟಾರೆ ಯೋಗಕ್ಷೇಮವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ. ಬೇಳೆಕಾಳುಗಳು ಮತ್ತು ಹಸಿರು ತರಕಾರಿಗಳು ಕಬ್ಬಿಣಾಂಶವಿರುವ ಆಹಾರಗಳಾಗಿವೆ. ಪ್ರತಿಯೊಬ್ಬರ ಪೋಷಣೆಯ ಅಗತ್ಯಗಳು ಭಿನ್ನವಾಗಿರುತ್ತವೆ.",
    chatReplyBone: "🦴 ಮೂಳೆಗಳ ಆರೋಗ್ಯ: ಬಲವಾದ ಮೂಳೆಗಳಿಗೆ ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ವಿಟಮಿನ್ D ಮುಖ್ಯ. ಸಮತೋಲಿತ ಆಹಾರ ಮತ್ತು ನಿಯಮಿತ ದೈಹಿಕ ಚಟುವಟಿಕೆ ಮೂಳೆಗಳ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಪೂರಕಗಳು ಅಥವಾ ಮೂಳೆಗಳ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ಇದ್ದರೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    chatReplyHormonal: "🌼 ಹಾರ್ಮೋನ್ ಆರೋಗ್ಯ: ಮುಟ್ಟಿನ ಚಕ್ರ, ಪ್ರೌಢಾವಸ್ಥೆ ಮತ್ತು ಬೆಳವಣಿಗೆಯಂತಹ ಪ್ರಕ್ರಿಯೆಗಳನ್ನು ನಿಯಂತ್ರಿಸಲು ಹಾರ್ಮೋನುಗಳು ಸಹಾಯ ಮಾಡುತ್ತವೆ. PCOS ಅಥವಾ PMS ನಂತಹ ಸ್ಥಿತಿಗಳು ಹಾರ್ಮೋನ್ ಬದಲಾವಣೆಗಳೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿವೆ. ಕೇವಲ ಲಕ್ಷಣಗಳು ಸ್ಥಿತಿಯನ್ನು ದೃಢಪಡಿಸುವುದಿಲ್ಲ; ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯುವುದು ಉತ್ತಮ.",
    chatReplyThanks: "ನಿಮಗೆ ಸ್ವಾಗತ! 🌸 ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಶಿಕ್ಷಣಕ್ಕಾಗಿ ಸಖಿ ಕಲಿಯಿರಿ ವಿಭಾಗವನ್ನು ಅನ್ವೇಷಿಸುವುದನ್ನು ಮುಂದುವರಿಸಿ.",
    chatReplyFallback: "ನಾನು ಡೆಮೊ ಸಹಾಯಕಿ, ಆದ್ದರಿಂದ ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗದಿರಬಹುದು. ದಯವಿಟ್ಟು ಮುಟ್ಟು, ಪೋಷಣೆ, ಮೂಳೆಗಳ ಆರೋಗ್ಯ ಅಥವಾ ಹಾರ್ಮೋನ್‌ಗಳ ಬಗ್ಗೆ ಕೇಳಿ ನೋಡಿ. ವೈದ್ಯಕೀಯ ಕಾಳಜಿಗಳಿಗಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  },
  தமிழ்: {
    home: "முகப்பு",
    tracker: "ஆரோக்கிய கண்காணிப்பு",
    learn: "கற்றுக்கொள்ளுங்கள்",
    assistant: "AI உதவியாளர்",
    heroTitle: "உங்கள் ஆரோக்கியம், உங்கள் விருப்பம்",
    heroSubtitle: "உங்கள் ஆரோக்கியம் ஒவ்வொரு நாளும் முக்கியம். நம்பகமான ஆரோக்கியக் கல்வியைப் பெறுங்கள், உங்கள் நல்வாழ்வைப் புரிந்துகொண்டு நம்பிக்கையுடன் அடுத்த அடியை எடுங்கள்.",
    heroPrimaryButton: "உங்கள் ஆரோக்கியத்தை ஆராயுங்கள்",
    heroSecondaryButton: "கண்டறிந்து கற்றுக்கொள்ளுங்கள்",
    trackerKicker: "உங்களுடன் ஒரு சிறிய சரிபார்ப்பு",
    trackerHeading: "உங்கள் ஆரோக்கியம், உங்கள் விருப்பம்",
    trackerIntro: "நீங்கள் எப்படி உணர்கிறீர்கள் என்பதன் தனிப்பட்ட பதிவை, ஒரு நாள் ஒரு நாளாக வைத்திருங்கள்.",
    trackerPeriodKicker: "01 · மாதவிடாய் கண்காணிப்பு",
    trackerPeriodTitle: "உங்கள் மாதவிடாய் நாட்களை குறியிடுங்கள்",
    trackerPeriodDescription: "ஒரு தேதியை மாதவிடாய் நாளாக குறியிட அல்லது நீக்க தேர்ந்தெடுக்கவும்.",
    trackerChooseDate: "ஒரு தேதியைத் தேர்ந்தெடுக்கவும்",
    trackerMarkPeriodDay: "மாதவிடாய் நாளை குறியிடுங்கள்",
    trackerRemovePeriodDay: "மாதவிடாய் நாளை நீக்குங்கள்",
    trackerDateRecorded: "தேதி இந்த அமர்வில் பதிவு செய்யப்பட்டது",
    trackerDatesRecorded: "தேதிகள் இந்த அமர்வில் பதிவு செய்யப்பட்டன",
    trackerWellnessKicker: "02 · தினசரி நல்வாழ்வு",
    trackerWellnessTitle: "நீங்கள் எப்படி உணர்கிறீர்கள்?",
    trackerWellnessDescription: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள் என்பதை சிறப்பாக விவரிக்கும் விருப்பத்தைத் தேர்ந்தெடுக்கவும்.",
    trackerMood: "மனநிலை",
    trackerMoodGreat: "மிக நன்று",
    trackerMoodGood: "நன்று",
    trackerMoodOkay: "சரி",
    trackerMoodLow: "குறைவு",
    trackerMoodStressed: "மன அழுத்தம்",
    trackerSymptomsLabel: "அறிகுறிகள் அல்லது கவனிப்புகள்",
    trackerSymptomCramps: "வலிப்பிடிப்பு",
    trackerSymptomHeadache: "தலைவலி",
    trackerSymptomTiredness: "சோர்வு",
    trackerSymptomBloating: "உப்பல்",
    trackerNotesLabel: "தனிப்பட்ட குறிப்புகள் (விருப்பம்)",
    trackerNotesPlaceholder: "நீங்கள் நினைவில் வைக்க விரும்பும் எதையும்...",
    trackerPrivacy: "மாதிரி மட்டும்: இந்த பதிவுகள் பக்க நினைவகத்தில் உள்ளன, மருத்துவ பதிவில் சேமிக்கப்படவில்லை.",
    trackerDisclaimer: "இந்த கண்காணிப்பு தனிப்பட்ட விழிப்புணர்வுக்கானது, நோயறிதல் அல்லது முன்கணிப்பு அல்ல. உடல்நலக் கவலைகளுக்கு தகுதியான சுகாதார நிபுணரிடம் ஆலோசனை பெறுங்கள்.",
    learnKicker: "அறிவுடன் தொடங்கும் ஆரோக்கியமான நீங்கள்",
    learnHeading: "உங்கள் ஆரோக்கியத்தைப் பற்றி அறியுங்கள்",
    learnIntro: "நம்பகமான ஆரோக்கியக் கல்வி உங்கள் உடலைப் புரிந்துகொள்வதிலிருந்து தொடங்குகிறது. தலைப்புகளை உங்கள் வேகத்தில் ஆராயுங்கள்.",
    learnBadge: "உங்கள் வேகத்தில் கற்றுக்கொள்ளுங்கள்",
    learnAllTopics: "அனைத்து தலைப்புகள்",
    learnFiltersAria: "ஆரோக்கியத் தலைப்புகளை வடிகட்டவும்",
    learnQuickGuide: "✦ சுருக்க வழிகாட்டி",
    learnVideoComingSoon: "▷ வீடியோ விரைவில்",
    learnShowLess: "குறைவாக காட்டு ↑",
    learnExploreTopic: "தலைப்பை ஆராயுங்கள் ↗",
    learnBackToTopics: "தலைப்புகளுக்குத் திரும்பு",
    learnWhatToKnow: "தெரிந்துகொள்ள வேண்டியவை",
    learnRemember: "நினைவில் கொள்ளுங்கள்",
    learnConsult: "தனிப்பட்ட மருத்துவக் கவலைகளுக்கு தகுதியான சுகாதார நிபுணரை அணுகுங்கள்.",
    learnVideoNoteTitle: "மருத்துவர் சரிபார்த்த வீடியோக்கள், விரைவில்",
    learnVideoNoteBody: "நாங்கள் அணுகக்கூடிய ஆரோக்கியக் கல்வி வளங்களை தயாரிக்கிறோம். பொருத்தமான மதிப்பாய்வுக்குப் பிறகு வீடியோ உள்ளடக்கம் சேர்க்கப்படும்.",
    learnDisclaimer: "இந்த அறிமுக வளங்கள் பொதுவான விழிப்புணர்வுக்கானவை, தகுதியான சுகாதார நிபுணரின் ஆலோசனைக்கு மாற்றாகாது.",
    learnTopicMenstrual: "மாதவிடாய் ஆரோக்கியம்",
    learnTopicMenstrualDetail: "உங்கள் சுழற்சியைப் புரிந்துகொள்ளுங்கள்",
    learnTopicNutrition: "ஊட்டச்சத்து",
    learnTopicNutritionDetail: "அன்றாட ஊட்டம்",
    learnTopicBone: "எலும்பு ஆரோக்கியம்",
    learnTopicBoneDetail: "ஆரோக்கியமான பழக்கங்களை உருவாக்குங்கள்",
    learnTopicHormonal: "ஹார்மோன் ஆரோக்கியம்",
    learnTopicHormonalDetail: "மாற்றங்களைப் பற்றி அறியுங்கள்",
    learnMenstrualIntro: "உங்கள் மாதவிடாய் சுழற்சியைப் புரிந்துகொள்வது உங்கள் முறைகளை அடையாளம் காணவும் மாற்றங்களை கவனிக்கவும் உதவும்.",
    learnMenstrualPoint1: "ஒவ்வொரு மாதவிடாயின் முதல் நாளையும் இரத்தப்போக்கு எவ்வளவு நேரம் நீடிக்கிறது என்பதையும் பதிவு செய்யுங்கள்.",
    learnMenstrualPoint2: "வலிப்பிடிப்பு, மனநிலை மாற்றங்கள் அல்லது ஓட்டத்தில் மாற்றங்கள் போன்ற அறிகுறிகளை கவனியுங்கள்.",
    learnMenstrualPoint3: "சுழற்சிகள் மாறுபடலாம். கடுமையான வலி, அசாதாரணமாக அதிக இரத்தப்போக்கு அல்லது தொடர்ச்சியான மாற்றங்களுக்கு மருத்துவ ஆலோசனை பெறுங்கள்.",
    learnMenstrualTakeaway: "உங்கள் சுழற்சி தனிப்பட்டது. அதைக் கண்காணிப்பது சுகாதார நிபுணருடன் அதிக தகவலுடன் பேச உதவும்.",
    learnNutritionIntro: "அன்றாட ஊட்டம் ஆற்றல், வளர்ச்சி, கவனம் மற்றும் ஒட்டுமொத்த நல்வாழ்வை ஆதரிக்கிறது.",
    learnNutritionPoint1: "காய்கறிகள், பழங்கள், முழு தானியங்கள், புரத உணவுகள் மற்றும் ஆரோக்கியமான கொழுப்புகளின் பல்வேறு வகைகளை நோக்கமாகக் கொள்ளுங்கள்.",
    learnNutritionPoint2: "நாள் முழுவதும் தவறாமல் தண்ணீர் குடியுங்கள்.",
    learnNutritionPoint3: "பீன்ஸ், பருப்புகள் மற்றும் இலைக் காய்கறிகள் போன்ற இரும்புச்சத்துள்ள உணவுகள் சமநிலையான உணவின் பகுதியாக இருக்கலாம்.",
    learnNutritionTakeaway: "ஒரே சரியான உணவுமுறை இல்லை. உங்கள் தேவைகள் வயது, ஆரோக்கியம், பண்பாடு மற்றும் சூழலைப் பொறுத்தவை.",
    learnBoneIntro: "எலும்புகள் உங்கள் உடலைத் தாங்கி உறுப்புகளைப் பாதுகாக்கின்றன. எலும்பு ஆரோக்கியம் வாழ்நாள் முழுவதும் முக்கியம்.",
    learnBonePoint1: "பால் பொருட்கள் அல்லது பொருத்தமான வலுவூட்டப்பட்ட மாற்றுகள் போன்ற கால்சியம் உள்ள உணவுகளை சேர்த்துக்கொள்ளுங்கள்.",
    learnBonePoint2: "வைட்டமின் D உங்கள் உடல் கால்சியத்தை உறிஞ்ச உதவுகிறது.",
    learnBonePoint3: "நடைபயிற்சி அல்லது நடனம் போன்ற வழக்கமான எடை தாங்கும் இயக்கம் எலும்பு ஆரோக்கியத்தை ஆதரிக்கலாம்.",
    learnBoneTakeaway: "எலும்பு ஆரோக்கியக் கவலைகள் அல்லது உங்களுக்கு வைட்டமின் D மதிப்பீடு அல்லது சத்துகள் தேவையா என்று சுகாதார நிபுணரிடம் கேளுங்கள்.",
    learnHormonalIntro: "ஹார்மோன்கள் மாதவிடாய் சுழற்சிகள், உறக்கம், மனநிலை மற்றும் வளர்சிதை மாற்றம் போன்ற செயல்முறைகளை ஒழுங்குபடுத்த உதவுகின்றன.",
    learnHormonalPoint1: "பருவம், மாதவிடாய் சுழற்சிகள், கர்ப்பம் மற்றும் மாதவிடாய் நிறுத்தத்தின் போது ஹார்மோன் மாற்றங்கள் ஏற்படலாம்.",
    learnHormonalPoint2: "உறக்கம், சமநிலையான ஊட்டச்சத்து மற்றும் வழக்கமான செயல்பாடு பொதுவான நல்வாழ்வை ஆதரிக்கின்றன.",
    learnHormonalPoint3: "தொடர்ச்சியான அல்லது கவலை தரும் அறிகுறிகளுக்கு தகுதியான சுகாதார நிபுணரிடம் பேசுவது தேவை.",
    learnHormonalTakeaway: "அறிகுறிகள் மட்டும் ஹார்மோன் நிலையை உறுதிப்படுத்தாது. சுகாதார நிபுணர் என்ன நடக்கிறது என்பதை மதிப்பிட உதவலாம்.",
    notFoundKicker: "பக்கம் கிடைக்கவில்லை",
    notFoundTitle: "எதையாவது தேடுகிறீர்களா?",
    notFoundText: "நீங்கள் தேடும் பக்கம் இல்லை அல்லது மாற்றப்பட்டிருக்கலாம்.",
    notFoundButton: "முகப்புக்குத் திரும்பு",
    assistantPageKicker: "கேட்பதற்கான ஒரு ஆதரவான இடம்",
    assistantPageHeading: "சகியுடன் பேசுங்கள்",
    assistantPageIntro: "அமைதியான, வரவேற்கும் இடத்தில் பொதுவான சுகாதார தகவல்களை ஆராயுங்கள்.",
    assistantCardTitle: "உங்கள் ஆரோக்கியக் கேள்விகள் முக்கியமானவை.",
    assistantCardSubtitle: "பரிந்துரைக்கப்பட்ட கேள்வியுடன் தொடங்குங்கள் அல்லது கீழே உங்களுடையதைத் தட்டச்சு செய்யுங்கள்.",
    assistantSuggestionLabel: "நீங்கள் இவற்றைப் பற்றி கேட்கலாம்",
    assistantSuggestedQ1: "மாதவிடாய் பற்றி நான் என்ன தெரிந்து கொள்ள வேண்டும்?",
    assistantSuggestedQ2: "சமநிலையான ஊட்டச்சத்து என்றால் என்ன?",
    assistantSuggestedQ3: "எலும்பு ஆரோக்கியத்தை நான் எவ்வாறு ஆதரிக்கலாம்?",
    assistantSuggestedQ4: "ஹார்மோன் ஆரோக்கியம் என்றால் என்ன?",
    assistantPanelTitle: "சகி சுகாதார உதவியாளர்",
    assistantPanelSubtitle: "கல்வி டெமோ",
    assistantStatusDemo: "● டெமோ",
    assistantClearChat: "அரட்டையை அழிக்கவும்",
    assistantClearChatAria: "அரட்டை உரையாடலை அழிக்கவும்",
    assistantInputAria: "உங்கள் ஆரோக்கியக் கேள்வி",
    assistantInputPlaceholder: "பொதுவான சுகாதாரக் கேள்வியைக் கேளுங்கள்...",
    assistantSend: "அனுப்பு",
    assistantDisclaimer: "டெமோ பதில்கள் மட்டுமே — இது நோய் கண்டறிதல் அல்லது தொழில்முறை மருத்துவ ஆலோசனைக்கு மாற்றாகாது. தனிப்பட்ட அல்லது முக்கியமான மருத்துவத் தகவல்களை உள்ளிடுவதைத் தவிர்க்கவும்.",
    homeAssistantKicker: "உங்களுக்கு ஒரு தொடக்கப் புள்ளி தேவைப்படும்போது",
    homeAssistantHeading: "உங்கள் ஆரோக்கியம் பற்றிய கேள்விகளா?",
    homeAssistantIntro: "எளிமையான, வரவேற்கும் இடத்தில் சுகாதார தகவல்களை ஆராயுங்கள். அறிகுறிகள் அல்லது தனிப்பட்ட மருத்துவக் கவலைகளுக்கு, தகுதியான சுகாதார நிபுணர் அடுத்த கட்டத்தைத் தீர்மானிக்க உதவலாம்.",
    homeAssistantInputLabel: "நீங்கள் எதைப் பற்றி அறிய விரும்புகிறீர்கள்?",
    homeAssistantPrivacy: "இந்த டெமோ உங்கள் கேள்வியை அனுப்பவோ சேமிக்கவோ இல்லை.",
    chatInitialGreeting: "வணக்கம்! நான் சகி. பெண்களுக்கான பொதுவான சுகாதாரத் தகவல்களை ஆராய நான் உங்களுக்கு உதவ முடியும். நீங்கள் எதைப் பற்றி அறிய விரும்புகிறீர்கள்?",
    chatReplyGreeting: "வணக்கம்! 🌸 சகிக்கு வரவேற்கிறோம். மாதவிடாய் சுகாதாரம், ஊட்டச்சத்து, எலும்பு நலம் அல்லது ஹார்மோன் ஆரோக்கியம் பற்றிய பொதுவான கேள்விகளை நீங்கள் கேட்கலாம். எதைப் பற்றி அறிய விரும்புகிறீர்கள்?",
    chatReplyMenstrual: "🌷 மாதவிடாய் ஆரோக்கியம்: சுழற்சிகளும் அறிகுறிகளும் நபருக்கு நபர் மாறுபடலாம். மாதவிடாய் தேதிகளையும் அறிகுறிகளையும் கண்காணிப்பது உங்கள் சுழற்சியைப் புரிந்துகொள்ள உதவும். கடுமையான வலி, வழக்கத்திற்கு மாறான அதிக இரத்தப்போக்கு அல்லது நீடித்த மாற்றங்கள் இருந்தால் மருத்துவரிடம் ஆலோசனை பெறுவது நல்லது.",
    chatReplyNutrition: "🥗 ஊட்டச்சத்து: காய்கறிகள், பழங்கள், முழு தானியங்கள், புரத உணவுகள் மற்றும் ஆரோக்கியமான கொழுப்புகள் கொண்ட சீரான உணவு நல்வாழ்வை ஆதரிக்கிறது. பருப்பு வகைகள் மற்றும் கீரைகள் இரும்புச்சத்து நிறைந்த உணவுகளுக்கு சில உதாரணங்கள். தனிப்பட்ட ஊட்டச்சத்து தேவைகள் மாறுபடலாம்.",
    chatReplyBone: "🦴 எலும்பு ஆரோக்கியம்: ஆரோக்கியமான எலும்புகளுக்கு கால்சியம் மற்றும் வைட்டமின் D மிகவும் முக்கியம். சமச்சீர் உணவும் வழக்கமான உடல் செயல்பாடும் எலும்பு ஆரோக்கியத்தை பராமரிக்க உதவும். சப்ளிமென்ட்கள் அல்லது எலும்பு நலம் பற்றிய சந்தேகங்களுக்கு மருத்துவரை அணுகவும்.",
    chatReplyHormonal: "🌼 ஹார்மோன் ஆரோக்கியம்: மாதவிடாய் சுழற்சி, பருவமடைதல் மற்றும் வளர்ச்சி உள்ளிட்ட பல உடல் செயல்பாடுகளை ஹார்மோன்கள் சீராக்குகின்றன. PCOS அல்லது PMS போன்ற நிலைகள் ஹார்மோன் மாற்றங்களுடன் தொடர்புடையவை. அறிகுறிகள் மட்டுமே ஒரு நிலையை உறுதிப்படுத்தாது; மருத்துவரிடம் ஆலோசனை பெறுவது நல்லது.",
    chatReplyThanks: "வரவேற்கிறோம்! 🌸 பொதுவான சுகாதாரக் கல்விக்காக சகியின் கற்றுக்கொள்ளுங்கள் பகுதியைத் தொடர்ந்து ஆராயுங்கள்.",
    chatReplyFallback: "நான் ஒரு டெமோ உதவியாளர், எனவே எல்லா கேள்விகளையும் என்னால் புரிந்துகொள்ள முடியாமல் போகலாம். மாதவிடாய், ஊட்டச்சத்து, எலும்பு நலம் அல்லது ஹார்மோன்கள் பற்றி கேட்டுப் பாருங்கள். தனிப்பட்ட மருத்துவக் கவலைகளுக்கு தகுதியான மருத்துவரிடம் ஆலோசிக்கவும்.",
  },
  తెలుగు: {
    home: "హోమ్",
    tracker: "ఆరోగ్య ట్రాకర్",
    learn: "నేర్చుకోండి",
    assistant: "AI సహాయకుడు",
    heroTitle: "మీ ఆరోగ్యం, మీ ఇష్టం",
    heroSubtitle: "మీ ఆరోగ్యం ప్రతి రోజు ముఖ్యం. నమ్మదగిన ఆరోగ్య విద్యను పొందండి, మీ శ్రేయస్సును అర్థం చేసుకుని నమ్మకంతో తదుపరి అడుగు వేయండి.",
    heroPrimaryButton: "మీ ఆరోగ్యాన్ని అన్వేషించండి",
    heroSecondaryButton: "కనుగొనండి మరియు నేర్చుకోండి",
    trackerKicker: "మీతో ఒక చిన్న చెక్-ఇన్",
    trackerHeading: "మీ ఆరోగ్యం, మీ ఇష్టం",
    trackerIntro: "మీరు ఎలా అనుభవిస్తున్నారో దాని ప్రైవేట్ రికార్డును, ఒక రోజు ఒకసారి ఉంచుకోండి.",
    trackerPeriodKicker: "01 · పీరియడ్ ట్రాకర్",
    trackerPeriodTitle: "మీ పీరియడ్ రోజులను గుర్తించండి",
    trackerPeriodDescription: "పీరియడ్ రోజుగా గుర్తించడానికి లేదా తొలగించడానికి తేదీని ఎంచుకోండి.",
    trackerChooseDate: "తేదీని ఎంచుకోండి",
    trackerMarkPeriodDay: "పీరియడ్ రోజును గుర్తించండి",
    trackerRemovePeriodDay: "పీరియడ్ రోజును తొలగించండి",
    trackerDateRecorded: "తేదీ ఈ సెషన్‌లో నమోదు చేయబడింది",
    trackerDatesRecorded: "తేదీలు ఈ సెషన్‌లో నమోదు చేయబడ్డాయి",
    trackerWellnessKicker: "02 · రోజువారీ వెల్నెస్",
    trackerWellnessTitle: "మీరు ఎలా అనుభవిస్తున్నారు?",
    trackerWellnessDescription: "ఈరోజు మీ అనుభూతిని ఉత్తమంగా వివరించే ఎంపికను ఎంచుకోండి.",
    trackerMood: "మూడ్",
    trackerMoodGreat: "చాలా బాగుంది",
    trackerMoodGood: "బాగుంది",
    trackerMoodOkay: "సరే",
    trackerMoodLow: "తక్కువ",
    trackerMoodStressed: "ఒత్తిడి",
    trackerSymptomsLabel: "లక్షణాలు లేదా పరిశీలనలు",
    trackerSymptomCramps: "క్రాంప్స్",
    trackerSymptomHeadache: "తలనొప్పి",
    trackerSymptomTiredness: "అలసట",
    trackerSymptomBloating: "ఉబ్బరం",
    trackerNotesLabel: "వ్యక్తిగత నోట్స్ (ఐచ్ఛికం)",
    trackerNotesPlaceholder: "మీరు గుర్తుంచుకోవాలనుకునేది ఏదైనా...",
    trackerPrivacy: "ప్రోటోటైప్ మాత్రమే: ఈ ఎంట్రీలు పేజీ మెమరీలో ఉంటాయి మరియు వైద్య రికార్డులో సేవ్ చేయబడవు.",
    trackerDisclaimer: "ఈ ట్రాకర్ వ్యక్తిగత అవగాహన కోసం, రోగ నిర్ధారణ లేదా అంచనా కోసం కాదు. ఆరోగ్య సమస్యల కోసం అర్హత కలిగిన ఆరోగ్య నిపుణుడి సలహా తీసుకోండి.",
    learnKicker: "జ్ఞానంతో మొదలయ్యే ఆరోగ్యవంతమైన మీరు",
    learnHeading: "మీ ఆరోగ్యం గురించి తెలుసుకోండి",
    learnIntro: "నమ్మదగిన ఆరోగ్య విద్య మీ శరీరాన్ని అర్థం చేసుకోవడంతో మొదలవుతుంది. అంశాలను మీ వేగంతో అన్వేషించండి.",
    learnBadge: "మీ వేగంతో నేర్చుకోండి",
    learnAllTopics: "అన్ని అంశాలు",
    learnFiltersAria: "ఆరోగ్య అంశాలను ఫిల్టర్ చేయండి",
    learnQuickGuide: "✦ త్వరిత గైడ్",
    learnVideoComingSoon: "▷ వీడియో త్వరలో",
    learnShowLess: "తక్కువ చూపించు ↑",
    learnExploreTopic: "అంశాన్ని అన్వేషించండి ↗",
    learnBackToTopics: "అంశాలకు తిరిగి వెళ్లండి",
    learnWhatToKnow: "తెలుసుకోవాల్సినవి",
    learnRemember: "గుర్తుంచుకోండి",
    learnConsult: "వ్యక్తిగత వైద్య సమస్యలకు అర్హత కలిగిన ఆరోగ్య నిపుణుడిని సంప్రదించండి.",
    learnVideoNoteTitle: "వైద్యులు సమీక్షించిన వీడియోలు, త్వరలో",
    learnVideoNoteBody: "మేము సులభంగా అందుబాటులో ఉండే ఆరోగ్య విద్య వనరులను సిద్ధం చేస్తున్నాము. తగిన సమీక్ష తర్వాత వీడియో కంటెంట్ జోడించబడుతుంది.",
    learnDisclaimer: "ఈ పరిచయ వనరులు సాధారణ అవగాహన కోసం మాత్రమే, అర్హత కలిగిన ఆరోగ్య నిపుణుడి సలహాకు ప్రత్యామ్నాయం కావు.",
    learnTopicMenstrual: "ఋతుచక్ర ఆరోగ్యం",
    learnTopicMenstrualDetail: "మీ చక్రాన్ని అర్థం చేసుకోండి",
    learnTopicNutrition: "పోషకాహారం",
    learnTopicNutritionDetail: "రోజువారీ పోషణ",
    learnTopicBone: "ఎముకల ఆరోగ్యం",
    learnTopicBoneDetail: "ఆరోగ్యకరమైన అలవాట్లు పెంచుకోండి",
    learnTopicHormonal: "హార్మోన్ ఆరోగ్యం",
    learnTopicHormonalDetail: "మార్పుల గురించి తెలుసుకోండి",
    learnMenstrualIntro: "మీ ఋతుచక్రాన్ని అర్థం చేసుకోవడం మీ స్వంత నమూనాలను గుర్తించడానికి మరియు మార్పులను గమనించడానికి సహాయపడవచ్చు.",
    learnMenstrualPoint1: "ప్రతి పీరియడ్ మొదటి రోజు మరియు రక్తస్రావం ఎంతకాలం ఉంటుందో నమోదు చేయండి.",
    learnMenstrualPoint2: "క్రాంప్స్, మూడ్ మార్పులు లేదా ప్రవాహంలో మార్పులు వంటి లక్షణాలను గమనించండి.",
    learnMenstrualPoint3: "చక్రాలు మారవచ్చు. తీవ్రమైన నొప్పి, అసాధారణంగా ఎక్కువ రక్తస్రావం లేదా నిరంతర మార్పులకు వైద్య సలహా తీసుకోండి.",
    learnMenstrualTakeaway: "మీ చక్రం వ్యక్తిగతం. దాన్ని ట్రాక్ చేయడం ఆరోగ్య నిపుణుడితో మరింత సమాచారంతో మాట్లాడటానికి సహాయపడవచ్చు.",
    learnNutritionIntro: "రోజువారీ పోషణ శక్తి, పెరుగుదల, ఏకాగ్రత మరియు మొత్తం శ్రేయస్సుకు మద్దతు ఇస్తుంది.",
    learnNutritionPoint1: "కూరగాయలు, పండ్లు, తృణధాన్యాలు, ప్రోటీన్ ఆహారాలు మరియు ఆరోగ్యకరమైన కొవ్వుల వైవిధ్యాన్ని లక్ష్యంగా పెట్టుకోండి.",
    learnNutritionPoint2: "రోజంతా క్రమం తప్పకుండా నీరు తాగండి.",
    learnNutritionPoint3: "బీన్స్, పప్పుధాన్యాలు మరియు ఆకుకూరలు వంటి ఇనుము అధికంగా ఉన్న ఆహారాలు సమతుల్య ఆహారంలో భాగం కావచ్చు.",
    learnNutritionTakeaway: "ఒకే పరిపూర్ణ ఆహారం లేదు. మీ అవసరాలు మీ వయస్సు, ఆరోగ్యం, సంస్కృతి మరియు పరిస్థితులపై ఆధారపడి ఉంటాయి.",
    learnBoneIntro: "ఎముకలు మీ శరీరానికి ఆధారం ఇస్తాయి మరియు అవయవాలను రక్షిస్తాయి. ఎముకల ఆరోగ్యం జీవితాంతం ముఖ్యం.",
    learnBonePoint1: "డైరీ ఉత్పత్తులు లేదా తగిన ఫోర్టిఫైడ్ ప్రత్యామ్నాయాలు వంటి క్యాల్షియం ఉన్న ఆహారాలను చేర్చండి.",
    learnBonePoint2: "విటమిన్ D మీ శరీరం క్యాల్షియం గ్రహించడానికి సహాయపడుతుంది.",
    learnBonePoint3: "నడక లేదా నృత్యం వంటి క్రమమైన బరువు మోసే కదలిక ఎముకల ఆరోగ్యానికి మద్దతు ఇవ్వవచ్చు.",
    learnBoneTakeaway: "ఎముకల ఆరోగ్య ఆందోళనల గురించి లేదా మీకు విటమిన్ D అంచనా లేదా సప్లిమెంట్లు అవసరమా అని ఆరోగ్య నిపుణుడిని అడగండి.",
    learnHormonalIntro: "హార్మోన్లు ఋతుచక్రాలు, నిద్ర, మూడ్ మరియు జీవక్రియ వంటి ప్రక్రియలను నియంత్రించడంలో సహాయపడతాయి.",
    learnHormonalPoint1: "యుక్తవయస్సు, ఋతుచక్రాలు, గర్భం మరియు రుతువిరమణ సమయంలో హార్మోన్ మార్పులు జరగవచ్చు.",
    learnHormonalPoint2: "నిద్ర, సమతుల్య పోషణ మరియు క్రమమైన కదలిక సాధారణ శ్రేయస్సుకు మద్దతు ఇస్తాయి.",
    learnHormonalPoint3: "నిరంతర లేదా ఆందోళన కలిగించే లక్షణాలకు అర్హత కలిగిన ఆరోగ్య నిపుణుడితో సంభాషణ అవసరం.",
    learnHormonalTakeaway: "లక్షణాలు మాత్రమే హార్మోన్ సంబంధిత పరిస్థితిని నిర్ధారించవు. ఆరోగ్య నిపుణుడు ఏమి జరుగుతుందో అంచనా వేయడంలో సహాయపడగలరు.",
    notFoundKicker: "పేజీ కనుగొనబడలేదు",
    notFoundTitle: "ఏదైనా వెతుకుతున్నారా?",
    notFoundText: "మీరు వెతుకుతున్న పేజీ ఉనికిలో లేదు లేదా తరలించబడి ఉండవచ్చు.",
    notFoundButton: "హోమ్‌కు తిరిగి వెళ్లండి",
    assistantPageKicker: "అడగడానికి ఒక సహాయక స్థలం",
    assistantPageHeading: "సఖితో మాట్లాడండి",
    assistantPageIntro: "ప్రశాంతమైన, ఆహ్లాదకరమైన వాతావరణంలో సాధారణ ఆరోగ్య సమాచారాన్ని అన్వేషించండి.",
    assistantCardTitle: "మీ ఆరోగ్య ప్రశ్నలు ముఖ్యమైనవి.",
    assistantCardSubtitle: "సూచించిన ప్రశ్నతో ప్రారంభించండి లేదా క్రింద మీ స్వంత ప్రశ్నను టైప్ చేయండి.",
    assistantSuggestionLabel: "మీరు వీటి గురించి అడగవచ్చు",
    assistantSuggestedQ1: "పీరియడ్స్ గురించి నేను ఏమి తెలుసుకోవాలి?",
    assistantSuggestedQ2: "సమతుల్య పోషకాహారం అంటే ఏమిటి?",
    assistantSuggestedQ3: "ఎముకల ఆరోగ్యాన్ని నేను ఎలా కాపాడుకోవచ్చు?",
    assistantSuggestedQ4: "హార్మోన్ల ఆరోగ్యం అంటే ఏమిటి?",
    assistantPanelTitle: "సఖి ఆరోగ్య సహాయకుడు",
    assistantPanelSubtitle: "విద్యా డెమో",
    assistantStatusDemo: "● డెమో",
    assistantClearChat: "చాట్ క్లియర్ చేయండి",
    assistantClearChatAria: "చాట్ సంభాషణను క్లియర్ చేయండి",
    assistantInputAria: "మీ ఆరోగ్య ప్రశ్న",
    assistantInputPlaceholder: "సాధారణ ఆరోగ్య ప్రశ్నను అడగండి...",
    assistantSend: "పంపండి",
    assistantDisclaimer: "డెమో ప్రతిస్పందనలు మాత్రమే — రోగ నిర్ధారణ లేదా వృత్తిపరమైన వైద్య సలహాకు ప్రత్యామ్నాయం కాదు. వ్యక్తిగత లేదా సున్నితమైన వైద్య సమాచారాన్ని నమోదు చేయడాన్ని నివారించండి.",
    homeAssistantKicker: "మీకు ఒక ప్రారంభ స్థానం అవసరమైనప్పుడు",
    homeAssistantHeading: "మీ ఆరోగ్యం గురించి ప్రశ్నలు ఉన్నాయా?",
    homeAssistantIntro: "సరళమైన, ఆహ్లాదకరమైన వాతావరణంలో ఆరోగ్య సమాచారాన్ని అన్వేషించండి. లక్షణాలు లేదా వ్యక్తిగత ఆరోగ్య సమస్యల కోసం, అర్హత కలిగిన ఆరోగ్య నిపుణుడు తదుపరి ఏమి చేయాలో నిర్ణయించడంలో సహాయపడగలరు.",
    homeAssistantInputLabel: "మీరు దేని గురించి తెలుసుకోవాలనుకుంటున్నారు?",
    homeAssistantPrivacy: "ఈ డెమో మీ ప్రశ్నను పంపదు లేదా సేవ్ చేయదు.",
    chatInitialGreeting: "నమస్కారం! నేను సఖిని. స్త్రీల సాధారణ ఆరోగ్య సమాచారాన్ని అన్వేషించడంలో నేను మీకు సహాయపడగలను. మీరు దేని గురించి తెలుసుకోవాలనుకుంటున్నారు?",
    chatReplyGreeting: "నమస్కారం! 🌸 సఖికి స్వాగతం. రుతుస్రావం, పోషకాహారం, ఎముకల ఆరోగ్యం లేదా హార్మోన్ల ఆరోగ్యం గురించి మీరు సాధారణ ప్రశ్నలను అడగవచ్చు. మీరు దేని గురించి తెలుసుకోవాలనుకుంటున్నారు?",
    chatReplyMenstrual: "🌷 రుతుస్రావ ఆరోగ్యం: సైకిల్స్ మరియు లక్షణాలు వ్యక్తిని బట్టి మారవచ్చు. పీరియడ్ తేదీలు మరియు లక్షణాలను ట్రాక్ చేయడం మీ విధానాన్ని గమనించడానికి సహాయపడుతుంది. తీవ్రమైన నొప్పి, అధిక రక్తస్రావం లేదా నిరంతర మార్పులు ఉంటే వైద్య నిపుణులను సంప్రదించడం మంచిది.",
    chatReplyNutrition: "🥗 పోషకాహారం: కూరగాయలు, పండ్లు, తృణధాన్యాలు, ప్రొటీన్ ఆహారాలు మరియు ఆరోగ్యకరమైన కొవ్వులతో కూడిన సమతుల్య ఆహారం ఆరోగ్యాన్ని కాపాడుతుంది. పప్పుధాన్యాలు మరియు ఆకుకూరలు ఐరన్ లభించే ఆహారాలు. ప్రతి ఒక్కరి పోషకాహార అవసరాలు వేర్వేరుగా ఉంటాయి.",
    chatReplyBone: "🦴 ఎముకల ఆరోగ్యం: బలమైన ఎముకల కోసం కాల్షియం మరియు విటమిన్ D అవసరం. సమతుల్య ఆహారం మరియు క్రమం తప్పని వ్యాయామం ఎముకల ఆరోగ్యానికి తోడ్పడతాయి. సప్లిమెంట్లు లేదా ఎముకల సమస్యలపై సందేహాలుంటే వైద్యులను సంప్రదించండి.",
    chatReplyHormonal: "🌼 హార్మోన్ల ఆరోగ్యం: రుతుచక్రం, యవ్వనం మరియు పెరుగుదల వంటి ప్రక్రియలను నియంత్రించడంలో హార్మోన్లు సహాయపడతాయి. PCOS లేదా PMS వంటి సమస్యలు హార్మోన్ల హెచ్చుతగ్గులతో ముడిపడి ఉంటాయి. కేవలం లక్షణాలతో నిర్ధారణ సాధ్యం కాదు; నిరంతర సమస్యలకు వైద్యుడిని సంప్రదించండి.",
    chatReplyThanks: "ధన్యవాదాలు! 🌸 సాధారణ ఆరోగ్య విద్య కోసం సఖి నేర్చుకోండి విభాగాన్ని అన్వేషిస్తూ ఉండండి.",
    chatReplyFallback: "నేను డెమో సహాయకుడిని, కాబట్టి ప్రతి ప్రశ్ననూ అర్థం చేసుకోలేకపోవచ్చు. దయచేసి పీరియడ్స్, పోషకాహారం, ఎముకల ఆరోగ్యం లేదా హార్మోన్ల గురించి అడగండి. వ్యక్తిగత వైద్య సమస్యల కోసం అర్హత కలిగిన వైద్యులను సంప్రదించండి.",
  },
  বাংলা: {
    home: "হোম",
    tracker: "স্বাস্থ্য ট্র্যাকার",
    learn: "শিখুন",
    assistant: "AI সহকারী",
    heroTitle: "আপনার স্বাস্থ্য, আপনার পছন্দ",
    heroSubtitle: "আপনার স্বাস্থ্য প্রতিদিনই গুরুত্বপূর্ণ। বিশ্বস্ত স্বাস্থ্য শিক্ষা পান, আপনার সুস্থতা বুঝুন এবং আত্মবিশ্বাসের সাথে পরবর্তী পদক্ষেপ নিন।",
    heroPrimaryButton: "আপনার স্বাস্থ্য অন্বেষণ করুন",
    heroSecondaryButton: "আবিষ্কার করুন ও শিখুন",
    trackerKicker: "নিজের সঙ্গে একটি ছোট চেক-ইন",
    trackerHeading: "আপনার স্বাস্থ্য, আপনার পছন্দ",
    trackerIntro: "আপনি কেমন অনুভব করছেন তার একটি ব্যক্তিগত রেকর্ড রাখুন, একদিন একদিন করে।",
    trackerPeriodKicker: "01 · পিরিয়ড ট্র্যাকার",
    trackerPeriodTitle: "আপনার পিরিয়ডের দিনগুলো চিহ্নিত করুন",
    trackerPeriodDescription: "পিরিয়ডের দিন হিসেবে চিহ্নিত করতে বা সরাতে একটি তারিখ বেছে নিন।",
    trackerChooseDate: "একটি তারিখ বেছে নিন",
    trackerMarkPeriodDay: "পিরিয়ডের দিন চিহ্নিত করুন",
    trackerRemovePeriodDay: "পিরিয়ডের দিন সরান",
    trackerDateRecorded: "তারিখ এই সেশনে রেকর্ড হয়েছে",
    trackerDatesRecorded: "তারিখগুলো এই সেশনে রেকর্ড হয়েছে",
    trackerWellnessKicker: "02 · দৈনিক সুস্থতা",
    trackerWellnessTitle: "আপনি কেমন অনুভব করছেন?",
    trackerWellnessDescription: "আজ আপনি কেমন অনুভব করছেন তা সবচেয়ে ভালোভাবে বোঝায় এমন বিকল্পটি বেছে নিন।",
    trackerMood: "মেজাজ",
    trackerMoodGreat: "খুব ভালো",
    trackerMoodGood: "ভালো",
    trackerMoodOkay: "ঠিক আছে",
    trackerMoodLow: "কম",
    trackerMoodStressed: "চাপে",
    trackerSymptomsLabel: "লক্ষণ বা পর্যবেক্ষণ",
    trackerSymptomCramps: "ক্র্যাম্পস",
    trackerSymptomHeadache: "মাথাব্যথা",
    trackerSymptomTiredness: "ক্লান্তি",
    trackerSymptomBloating: "পেট ফাঁপা",
    trackerNotesLabel: "ব্যক্তিগত নোট (ঐচ্ছিক)",
    trackerNotesPlaceholder: "যা মনে রাখতে চান...",
    trackerPrivacy: "শুধু প্রোটোটাইপ: এই এন্ট্রিগুলো পেজের মেমোরিতে থাকে এবং কোনো মেডিকেল রেকর্ডে সংরক্ষণ করা হয় না।",
    trackerDisclaimer: "এই ট্র্যাকার ব্যক্তিগত সচেতনতার জন্য, রোগ নির্ণয় বা পূর্বাভাসের জন্য নয়। স্বাস্থ্য সংক্রান্ত উদ্বেগে যোগ্য স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।",
    learnKicker: "জ্ঞান দিয়ে শুরু হয় সুস্থ আপনি",
    learnHeading: "আপনার স্বাস্থ্য সম্পর্কে জানুন",
    learnIntro: "বিশ্বস্ত স্বাস্থ্য শিক্ষা শুরু হয় আপনার শরীরকে বোঝার মধ্য দিয়ে। বিষয়গুলো নিজের গতিতে অন্বেষণ করুন।",
    learnBadge: "নিজের গতিতে শিখুন",
    learnAllTopics: "সব বিষয়",
    learnFiltersAria: "স্বাস্থ্য বিষয় ফিল্টার করুন",
    learnQuickGuide: "✦ সংক্ষিপ্ত গাইড",
    learnVideoComingSoon: "▷ ভিডিও শিগগিরই আসছে",
    learnShowLess: "কম দেখান ↑",
    learnExploreTopic: "বিষয় দেখুন ↗",
    learnBackToTopics: "বিষয়ে ফিরে যান",
    learnWhatToKnow: "যা জানা দরকার",
    learnRemember: "মনে রাখুন",
    learnConsult: "ব্যক্তিগত চিকিৎসা সংক্রান্ত উদ্বেগে যোগ্য স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।",
    learnVideoNoteTitle: "ডাক্তার-যাচাইকৃত ভিডিও, শিগগিরই আসছে",
    learnVideoNoteBody: "আমরা সহজলভ্য স্বাস্থ্য শিক্ষা সম্পদ প্রস্তুত করছি। উপযুক্ত পর্যালোচনার পর ভিডিও কনটেন্ট যোগ করা হবে।",
    learnDisclaimer: "এই পরিচিতিমূলক সম্পদ সাধারণ সচেতনতার জন্য এবং যোগ্য স্বাস্থ্যসেবা পেশাদারের পরামর্শের বিকল্প নয়।",
    learnTopicMenstrual: "মাসিক স্বাস্থ্য",
    learnTopicMenstrualDetail: "আপনার চক্র বুঝুন",
    learnTopicNutrition: "পুষ্টি",
    learnTopicNutritionDetail: "প্রতিদিনের পুষ্টি",
    learnTopicBone: "হাড়ের স্বাস্থ্য",
    learnTopicBoneDetail: "সুস্থ অভ্যাস গড়ুন",
    learnTopicHormonal: "হরমোনজনিত স্বাস্থ্য",
    learnTopicHormonalDetail: "পরিবর্তন সম্পর্কে জানুন",
    learnMenstrualIntro: "আপনার মাসিক চক্র বোঝা নিজের ধরন চেনা এবং পরিবর্তন লক্ষ্য করতে সাহায্য করতে পারে।",
    learnMenstrualPoint1: "প্রতিটি পিরিয়ডের প্রথম দিন এবং রক্তপাত কতক্ষণ থাকে তা লিখে রাখুন।",
    learnMenstrualPoint2: "ক্র্যাম্পস, মেজাজের পরিবর্তন বা প্রবাহের পরিবর্তনের মতো লক্ষণ খেয়াল করুন।",
    learnMenstrualPoint3: "চক্র ভিন্ন হতে পারে। তীব্র ব্যথা, অস্বাভাবিকভাবে বেশি রক্তপাত বা স্থায়ী পরিবর্তনের জন্য চিকিৎসা পরামর্শ নিন।",
    learnMenstrualTakeaway: "আপনার চক্র ব্যক্তিগত। এটি ট্র্যাক করলে স্বাস্থ্যসেবা পেশাদারের সঙ্গে আরও তথ্যসমৃদ্ধ আলোচনায় সাহায্য হতে পারে।",
    learnNutritionIntro: "প্রতিদিনের পুষ্টি শক্তি, বৃদ্ধি, মনোযোগ এবং সামগ্রিক সুস্থতাকে সহায়তা করে।",
    learnNutritionPoint1: "সবজি, ফল, পুরো শস্য, প্রোটিন খাবার এবং স্বাস্থ্যকর চর্বির বৈচিত্র্য রাখার চেষ্টা করুন।",
    learnNutritionPoint2: "দিনভর নিয়মিত পানি পান করুন।",
    learnNutritionPoint3: "শিম, ডাল এবং পাতাযুক্ত শাকের মতো আয়রনসমৃদ্ধ খাবার সুষম খাদ্যের অংশ হতে পারে।",
    learnNutritionTakeaway: "একটিই নিখুঁত খাদ্য নেই। আপনার প্রয়োজন বয়স, স্বাস্থ্য, সংস্কৃতি এবং পরিস্থিতির উপর নির্ভর করে।",
    learnBoneIntro: "হাড় আপনার শরীরকে সাহায্য করে এবং অঙ্গ রক্ষা করে। হাড়ের স্বাস্থ্য সারা জীবন গুরুত্বপূর্ণ।",
    learnBonePoint1: "দুগ্ধজাত খাবার বা উপযুক্ত ফোর্টিফায়েড বিকল্পের মতো ক্যালসিয়ামযুক্ত খাবার রাখুন।",
    learnBonePoint2: "ভিটামিন D শরীরকে ক্যালসিয়াম শোষণে সাহায্য করে।",
    learnBonePoint3: "হাঁটা বা নাচের মতো নিয়মিত ওজন-বহনকারী নড়াচড়া হাড়ের স্বাস্থ্যকে সহায়তা করতে পারে।",
    learnBoneTakeaway: "হাড়ের স্বাস্থ্য নিয়ে উদ্বেগ বা আপনার ভিটামিন D মূল্যায়ন বা সাপ্লিমেন্ট দরকার কি না, স্বাস্থ্যসেবা পেশাদারকে জিজ্ঞাসা করুন।",
    learnHormonalIntro: "হরমোন মাসিক চক্র, ঘুম, মেজাজ এবং বিপাকের মতো প্রক্রিয়া নিয়ন্ত্রণে সাহায্য করে।",
    learnHormonalPoint1: "বয়ঃসন্ধি, মাসিক চক্র, গর্ভাবস্থা এবং মেনোপজের সময় হরমোনের পরিবর্তন হতে পারে।",
    learnHormonalPoint2: "ঘুম, সুষম পুষ্টি এবং নিয়মিত কার্যকলাপ সাধারণ সুস্থতাকে সহায়তা করে।",
    learnHormonalPoint3: "স্থায়ী বা উদ্বেগজনক লক্ষণের জন্য যোগ্য স্বাস্থ্যসেবা পেশাদারের সঙ্গে কথা বলা উচিত।",
    learnHormonalTakeaway: "শুধু লক্ষণ দিয়ে হরমোনজনিত অবস্থা নিশ্চিত করা যায় না। স্বাস্থ্যসেবা পেশাদার কী ঘটছে তা মূল্যায়ন করতে সাহায্য করতে পারেন।",
    notFoundKicker: "পৃষ্ঠা পাওয়া যায়নি",
    notFoundTitle: "কিছু খুঁজছেন?",
    notFoundText: "আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়ে থাকতে পারে।",
    notFoundButton: "হোমে ফিরে যান",
    assistantPageKicker: "জিজ্ঞাসা করার জন্য একটি সহায়ক স্থান",
    assistantPageHeading: "সখীর সাথে কথা বলুন",
    assistantPageIntro: "একটি শান্ত ও স্বাগত পরিবেশে সাধারণ স্বাস্থ্য তথ্য জানুন।",
    assistantCardTitle: "আপনার স্বাস্থ্য সম্পর্কিত প্রশ্ন গুরুত্বপূর্ণ।",
    assistantCardSubtitle: "প্রস্তাবিত প্রশ্ন দিয়ে শুরু করুন বা নিচে আপনার নিজের প্রশ্ন টাইপ করুন।",
    assistantSuggestionLabel: "আপনি এগুলি সম্পর্কে জিজ্ঞাসা করতে পারেন",
    assistantSuggestedQ1: "পিরিয়ড সম্পর্কে আমার কী জানা উচিত?",
    assistantSuggestedQ2: "সুষম পুষ্টি বলতে কী বোঝায়?",
    assistantSuggestedQ3: "আমি কীভাবে হাড়ের স্বাস্থ্য বজায় রাখতে পারি?",
    assistantSuggestedQ4: "হরমোনজনিত স্বাস্থ্য কী?",
    assistantPanelTitle: "সখী স্বাস্থ্য সহকারী",
    assistantPanelSubtitle: "শিক্ষামূলক ডেমো",
    assistantStatusDemo: "● ডেমো",
    assistantClearChat: "চ্যাট মুছুন",
    assistantClearChatAria: "চ্যাট কথোপকথন মুছুন",
    assistantInputAria: "আপনার স্বাস্থ্য সম্পর্কিত প্রশ্ন",
    assistantInputPlaceholder: "একটি সাধারণ স্বাস্থ্য প্রশ্ন জিজ্ঞাসা করুন...",
    assistantSend: "পাঠান",
    assistantDisclaimer: "শুধুমাত্র ডেমো প্রতিক্রিয়া — এটি রোগ নির্ণয় বা পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়। ব্যক্তিগত বা সংবেদনশীল চিকিৎসা তথ্য প্রবেশ করা এড়িয়ে চলুন।",
    homeAssistantKicker: "যখন আপনার একটি সূচনার প্রয়োজন",
    homeAssistantHeading: "আপনার স্বাস্থ্য সম্পর্কে প্রশ্ন?",
    homeAssistantIntro: "সহজ ও স্বাগত পরিবেশে স্বাস্থ্য তথ্য জানুন। লক্ষণ বা ব্যক্তিগত চিকিৎসা উদ্বেগের জন্য, একজন যোগ্য স্বাস্থ্যসেবা পেশাদার পরবর্তী পদক্ষেপ ঠিক করতে সাহায্য করতে পারেন।",
    homeAssistantInputLabel: "আপনি কী সম্পর্কে জানতে চান?",
    homeAssistantPrivacy: "এই ডেমো আপনার প্রশ্ন পাঠায় না বা সংরক্ষণ করে না।",
    chatInitialGreeting: "নমস্কার! আমি সখী। নারীদের সাধারণ স্বাস্থ্য তথ্য অন্বেষণে আমি আপনাকে সাহায্য করতে পারি। আপনি কী সম্পর্কে জানতে চান?",
    chatReplyGreeting: "নমস্কার! 🌸 সখীতে স্বাগতম। আপনি আমাকে মাসিক স্বাস্থ্য, পুষ্টি, হাড়ের স্বাস্থ্য বা হরমোনজনিত স্বাস্থ্য সম্পর্কে সাধারণ প্রশ্ন জিজ্ঞাসা করতে পারেন। আপনি কী সম্পর্কে জানতে চান?",
    chatReplyMenstrual: "🌷 মাসিক স্বাস্থ্য: পিরিয়ড চক্র এবং লক্ষণ ব্যক্তিভেদে ভিন্ন হতে পারে। পিরিয়ডের তারিখ এবং লক্ষণ ট্র্যাক করা নিজস্ব ধরন বুঝতে সাহায্য করে। তীব্র ব্যথা, অতিরিক্ত রক্তপাত বা দীর্ঘস্থায়ী পরিবর্তন দেখা দিলে স্বাস্থ্যসেবা পেশাদারের পরামর্শ নেওয়া উচিত।",
    chatReplyNutrition: "🥗 পুষ্টি: শাকসবজি, ফলমূল, গোটা শস্য, প্রোটিন সমৃদ্ধ খাবার এবং স্বাস্থ্যকর ফ্যাটযুক্ত বৈচিত্র্যময় খাবার সামগ্রিক সুস্থতা বজায় রাখে। ডাল ও সবুজ শাকসবজি আয়রনযুক্ত খাবারের উদাহরণ। ব্যক্তিগত পুষ্টির চাহিদা ভিন্ন হতে পারে।",
    chatReplyBone: "🦴 হাড়ের স্বাস্থ্য: সুস্থ হাড়ের জন্য ক্যালসিয়াম ও ভিটামিন D গুরুত্বপূর্ণ। সুষম খাদ্য এবং নিয়মিত শারীরিক পরিশ্রম হাড়ের স্বাস্থ্য ভালো রাখতে সহায়তা করে। সাপ্লিমেন্ট বা হাড়ের সমস্যা সম্পর্কে জানতে স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।",
    chatReplyHormonal: "🌼 হরমোনজনিত স্বাস্থ্য: হরমোন মাসিক চক্র, বয়ঃসন্ধি এবং শারীরিক বৃদ্ধিসহ শরীরের বহু প্রক্রিয়া নিয়ন্ত্রণে সাহায্য করে। PCOS বা PMS-এর মতো অবস্থা হরমোনের পরিবর্তনের সাথে যুক্ত। শুধু লক্ষণ দেখে কোনো রোগ নিশ্চিত করা যায় না; দীর্ঘস্থায়ী উপসর্গের জন্য স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।",
    chatReplyThanks: "আপনাকে স্বাগতম! 🌸 সাধারণ স্বাস্থ্য শিক্ষার জন্য সখীর শিখুন অংশটি অন্বেষণ করতে থাকুন।",
    chatReplyFallback: "আমি একটি ডেমো সহকারী, তাই সব প্রশ্ন হয়তো বুঝতে পারব না। অনুগ্রহ করে পিরিয়ড, পুষ্টি, হাড়ের স্বাস্থ্য বা হরমোন সম্পর্কে জিজ্ঞাসা করার চেষ্টা করুন। ব্যক্তিগত চিকিৎসা সংক্রান্ত উদ্বেগের জন্য যোগ্য স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।",
  },
}

const features = [
  {
    icon: '♡',
    title: 'Health tracker',
    description: 'Keep track of your cycle, symptoms and daily wellbeing.',
    color: 'rose',
    action: 'tracker',
  },
  {
    icon: '✳',
    title: 'AI health assistant',
    description: 'Explore health questions in simple, accessible language.',
    color: 'lavender',
    action: 'assistant',
  },
  {
    icon: '▷',
    title: 'Learn from experts',
    description: 'Explore educational resources on women’s health.',
    color: 'peach',
    action: 'learn',
  },
  {
    icon: '⌖',
    title: 'Find healthcare',
    description: 'Discover clinics, hospitals and healthcare services.',
    color: 'sage',
    action: 'care',
  },
]

const topics = [
  { emoji: '🌷', name: 'Menstrual health', accent: 'rose' },
  { emoji: '🥗', name: 'Nutrition', accent: 'peach' },
  { emoji: '🦴', name: 'Bone health', accent: 'sage' },
  { emoji: '🌼', name: 'Hormonal health', accent: 'lavender' },
]

function getReplyText(replyKey, lang = 'English', trDict = translations) {
  const currentT = trDict[lang] || trDict.English;
  const replyMap = {
    initialGreeting: currentT.chatInitialGreeting,
    greeting: currentT.chatReplyGreeting,
    menstrual: currentT.chatReplyMenstrual,
    nutrition: currentT.chatReplyNutrition,
    bone: currentT.chatReplyBone,
    hormonal: currentT.chatReplyHormonal,
    thanks: currentT.chatReplyThanks,
    fallback: currentT.chatReplyFallback,
  };
  return replyMap[replyKey] || currentT.chatReplyFallback;
}

function determineReplyKey(text, trDict = translations) {
  const lower = text.toLowerCase().trim();

  // Match against suggested questions across all translations
  for (const lang of Object.keys(trDict)) {
    const tr = trDict[lang];
    if (tr) {
      if (text === tr.assistantSuggestedQ1) return 'menstrual';
      if (text === tr.assistantSuggestedQ2) return 'nutrition';
      if (text === tr.assistantSuggestedQ3) return 'bone';
      if (text === tr.assistantSuggestedQ4) return 'hormonal';
    }
  }

  // Greetings
  if (
    /\b(hi|hii|hello|hey|hiya|greetings|namaste)\b/i.test(lower) ||
    /(नमस्ते|नमस्कार|हेलो|ನಮಸ್ಕಾರ|ಹಲೋ|வணக்கம்|ஹலோ|నమస్కారం|హలో|নমস্কার|হ্যালো)/i.test(text)
  ) {
    return 'greeting';
  }

  // Thanks
  if (
    /\b(thanks|thank you|thx|appreciate)\b/i.test(lower) ||
    /(धन्यवाद|शुक्रिया|ಧನ್ಯವಾದಗಳು|ಧನ್ಯವಾದ|நன்றி|ధన్యవాదాలు|ধন্যবাদ)/i.test(text)
  ) {
    return 'thanks';
  }

  // Menstrual Health
  if (
    /\b(period|periods|menstrual|menstruation|cycle|cramps|bleeding|flow|pad|tampon)\b/i.test(lower) ||
    /(मासिक|पीरियड|पीरियड्स|ऐंठन|रक्तस्राव|माहवारी|ಮುಟ್ಟು|ಪೀರಿಯಡ್|ಪೀರಿಯಡ್ಸ್|ಋತುಚಕ್ರ|ರಕ್ತಸ್ರಾವ|மாதவிடாய்|பீரியட்ஸ்|சுழற்சி|இரத்தப்போக்கு|పీరియడ్|పీరియడ్స్|రుతుస్రావం|రక్తస్రావం|মাসিক|পিরিয়ড|পিরিয়ডস|রক্তপাত)/i.test(text)
  ) {
    return 'menstrual';
  }

  // Nutrition
  if (
    /\b(nutrition|food|foods|diet|eating|eat|iron|protein|hydration|water|nutrient|vitamins)\b/i.test(lower) ||
    /(पोषण|आहार|भोजन|पानी|डाइट|आयरन|प्रोटीन|पोषक|ಪೋಷಣೆ|ಆಹಾರ|ನೀರು|ಕಬ್ಬಿಣಾಂಶ|ಪ್ರೋಟೀನ್|ஊட்டச்சத்து|உணவு|நீர்|இரும்புச்சத்து|புரதம்|పోషకాహారం|ఆహారం|నీరు|ఐరన్|ప్రొటీన్|পুষ্টি|খাবার|পানি|আয়রন|প্রোটিন)/i.test(text)
  ) {
    return 'nutrition';
  }

  // Bone Health
  if (
    /\b(bone|bones|calcium|vitamin d|osteoporosis|skeletal|joints)\b/i.test(lower) ||
    /(हड्डी|हड्डियां|हड्डियों|कैल्शियम|विटामिन\s*d|विटामिन\s*डी|ಮೂಳೆ|ಮೂಳೆಗಳು|ಕ್ಯಾಲ್ಸಿಯಂ|ವಿಟಮಿನ್\s*d|ವಿಟಮಿನ್\s*ಡಿ|ಎಲುಬು|ಎಲುಬಿನ|எலும்பு|எலும்புகள்|கால்சியம்|வைட்டமின்\s*d|வைட்டமின்\s*டி|ఎముక|ఎముకలు|కాల్షియం|విటమిన్\s*d|విటమిన్\s*డి|হাড়|হাড়|ক্যালসিয়াম|ভিটামিন\s*d|ভিটামিন\s*ডি)/i.test(text)
  ) {
    return 'bone';
  }

  // Hormones / Puberty / PCOS / PMS
  if (
    /\b(hormone|hormones|hormonal|pcos|pms|puberty|acne|endocrine)\b/i.test(lower) ||
    /(हार्मोन|हार्मोनल|पीसीओएस|पीएमएस|यौवन|वयःसंधि|ಹಾರ್ಮೋನ್|ಹಾರ್ಮೋನುಗಳು|ಪ್ರೌಢಾವಸ್ಥೆ|ಯೌವನಾರಂಭ|ஹார்மோன்|ஹார்மோன்கள்|பருவமடைதல்|பருவம்|హార్మోన్|హార్మోన్లు|యుక్తవయస్సు|యవ్వనం|হরমোন|বয়ঃসন্ধি)/i.test(text)
  ) {
    return 'hormonal';
  }

  return 'fallback';
}

function App() {
  const [language, setLanguage] = useState('English')
  const t = translations[language] || translations.English
  const learnCopy = {
    "Menstrual health": {
      title: t.learnTopicMenstrual,
      detail: t.learnTopicMenstrualDetail,
      intro: t.learnMenstrualIntro,
      points: [t.learnMenstrualPoint1, t.learnMenstrualPoint2, t.learnMenstrualPoint3],
      takeaway: t.learnMenstrualTakeaway,
    },
    Nutrition: {
      title: t.learnTopicNutrition,
      detail: t.learnTopicNutritionDetail,
      intro: t.learnNutritionIntro,
      points: [t.learnNutritionPoint1, t.learnNutritionPoint2, t.learnNutritionPoint3],
      takeaway: t.learnNutritionTakeaway,
    },
    "Bone health": {
      title: t.learnTopicBone,
      detail: t.learnTopicBoneDetail,
      intro: t.learnBoneIntro,
      points: [t.learnBonePoint1, t.learnBonePoint2, t.learnBonePoint3],
      takeaway: t.learnBoneTakeaway,
    },
    "Hormonal health": {
      title: t.learnTopicHormonal,
      detail: t.learnTopicHormonalDetail,
      intro: t.learnHormonalIntro,
      points: [t.learnHormonalPoint1, t.learnHormonalPoint2, t.learnHormonalPoint3],
      takeaway: t.learnHormonalTakeaway,
    },
  }
  const [question, setQuestion] = useState('')
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [expandedTopic, setExpandedTopic] = useState("");
  const activeLearnTopic = topics.find((topic) => topic.name === expandedTopic)

  // Authentication state
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('sakhi_token'))
  const [authPage, setAuthPage] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const handleLogin = (data) => {
    setUser({ email: data.email })
    setToken(data.token)
    setAuthPage(null)
  }

  const handleRegister = (data) => {
    setUser({ email: data.email })
    setToken(data.token)
    setAuthPage(null)
  }

  const handleLogout = () => {
    clearAuthToken()
    localStorage.removeItem('sakhi_token')
    localStorage.removeItem('sakhi_user_email')
    setUser(null)
    setToken(null)
    setAuthPage('login')
  }

  const loadUser = async () => {
    const savedToken = localStorage.getItem('sakhi_token')
    if (savedToken) {
      setAuthToken(savedToken)
      setToken(savedToken)
      try {
        const userData = await fetchMe()
        setUser(userData)
      } catch {
        clearAuthToken()
        localStorage.removeItem('sakhi_token')
        setToken(null)
      }
    }
    setAuthLoading(false)
  }

  useEffect(() => {
    loadUser()
    setOnUnauthenticated(() => {
      handleLogout()
    })
  }, [])

  const isAuthenticated = !!token && !!user
const navigate = useNavigate()
const location = useLocation()
  message.replyKey ? getReplyText(message.replyKey, language) || message.text : message.text

  const routes = {
    home: '/',
    tracker: '/tracker',
    learn: '/learn',
    assistant: '/assistant',
    finder: '/finder',
  }
  const knownPaths = Object.values(routes)
  const isNotFound = !knownPaths.includes(location.pathname)

  const goTo = (section) => {
    navigate(routes[section] || '/')
  }
  const askAssistant = (event) => {
    event.preventDefault()
    const userQuestion = question.trim()
    if (userQuestion) {
      sendChatMessage(userQuestion)
      setQuestion('')
    }
    goTo('assistant')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            goTo('home')
          }}
        >
          <span className="brand-mark">s</span>
          <span>sakhi<span className="brand-accent">.</span></span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          {[
            { label: t.home, route: 'home' },
            { label: t.tracker, route: 'tracker' },
            { label: t.learn, route: 'learn' },
            { label: t.assistant, route: 'assistant' },
            { label: finderNavLabel[language] || finderNavLabel.English, route: 'finder' },
          ].map(({ label, route }) => {
            const isActive = location.pathname === (routes[route] || '/')
            return (
              <button
                key={route}
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => goTo(route)}
              >
                {label}
              </button>
            )
          })}
        </nav>

        <label className="language-picker">
          <span aria-hidden="true">◎</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label="Choose language"
          >
            <option>English</option>
            <option>हिन्दी</option>
            <option>ಕನ್ನಡ</option>
            <option>தமிழ்</option>
            <option>తెలుగు</option>
            <option>বাংলা</option>
          </select>
        </label>
      </header>

      <main>
      {location.pathname === '/' && (
  <>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR HEALTH, YOUR PRIORITY
            </div>

            <h1>
              {t.heroTitle}
            </h1>

            <p className="hero-description">
              {t.heroSubtitle}
            </p>

            <div className="hero-actions">
              <button className="button-primary" onClick={() => goTo('tracker')}>
                {t.heroPrimaryButton} <span>↗</span>
              </button>
              <button className="button-secondary" onClick={() => goTo('learn')}>
                {t.heroSecondaryButton}
              </button>
            </div>

            <div className="trust-note">
              <span className="trust-icon">♡</span>
              A supportive space, made with women in mind.
            </div>
          </div>

          <div className="hero-art" aria-label="Illustration of a woman surrounded by flowers">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="sun-shape" />
            <div className="flower flower-one">✿</div>
            <div className="flower flower-two">✿</div>
            <div className="flower flower-three">✽</div>
            <div className="hero-illustration">
              <div className="hair" />
              <div className="face">
                <span className="eye eye-left" />
                <span className="eye eye-right" />
                <span className="nose" />
                <span className="mouth" />
                <span className="cheek cheek-left" />
                <span className="cheek cheek-right" />
              </div>
              <div className="neck" />
              <div className="body-shape">
                <span className="dress-fold" />
              </div>
              <div className="arm arm-left" />
              <div className="arm arm-right" />
            </div>
            <div className="art-caption">
              <span>✦</span>
              Make time for you
            </div>
          </div>
        </section>

        <section className="welcome-strip" aria-label="Our promise">
          <div><span>♡</span><p>Care that puts <strong>you first</strong></p></div>
          <div><span>✿</span><p>Knowledge for <strong>every stage</strong></p></div>
          <div><span>⌁</span><p>Health information in <strong>your language</strong></p></div>
        </section>
        </>
      )}

  {location.pathname === '/tracker' && (
  <>
    <section className="section tracker-dashboard" >
      <div className="section-heading">
        <div>
          <span className="section-kicker">{t.trackerKicker}</span>
          <h2>{t.trackerHeading}</h2>
      <p>
        {t.trackerIntro}
      </p>
    </div>
    <span className="heading-flower">✿</span>
  </div>

  <div className="tracker-grid">
    <article className="tracker-panel">
      <span className="tracker-kicker">{t.trackerPeriodKicker}</span>
      <h3>{t.trackerPeriodTitle}</h3>
      <p>{t.trackerPeriodDescription}</p>

      <label className="tracker-label" htmlFor="period-date">
        {t.trackerChooseDate}
      </label>
      <input
        id="period-date"
        className="tracker-input"
        type="date"
        value={wellnessDate}
        onChange={(event) => setWellnessDate(event.target.value)}
      />

      <button
        className="tracker-button"
        onClick={() =>
          setPeriodDays((days) =>
            days.includes(wellnessDate)
              ? days.filter((day) => day !== wellnessDate)
              : [...days, wellnessDate].sort()
          )
        }
        disabled={!wellnessDate}
      >
        {periodDays.includes(wellnessDate)
          ? t.trackerRemovePeriodDay
          : t.trackerMarkPeriodDay}
      </button>

      <div className="tracker-summary">
        <strong>{periodDays.length}</strong>
        <span>{periodDays.length === 1 ? t.trackerDateRecorded : t.trackerDatesRecorded}</span>
      </div>

      {periodDays.length > 0 && (
        <ul className="tracker-date-list">
          {periodDays.map((day) => (
            <li key={day}>{day}</li>
          ))}
        </ul>
      )}
    </article>

    <article className="tracker-panel">
      <span className="tracker-kicker">{t.trackerWellnessKicker}</span>
      <h3>{t.trackerWellnessTitle}</h3>
      <p>{t.trackerWellnessDescription}</p>

      <label className="tracker-label" htmlFor="wellness-mood">
        {t.trackerMood}
      </label>
      <select
        id="wellness-mood"
        className="tracker-input"
        value={wellnessMood}
        onChange={(event) => setWellnessMood(event.target.value)}
      >
        <option value="Great">{t.trackerMoodGreat}</option>
        <option value="Good">{t.trackerMoodGood}</option>
        <option value="Okay">{t.trackerMoodOkay}</option>
        <option value="Low">{t.trackerMoodLow}</option>
        <option value="Stressed">{t.trackerMoodStressed}</option>
      </select>

      <span className="tracker-label">{t.trackerSymptomsLabel}</span>
      <div className="symptom-options">
        {[
          { id: "Cramps", label: t.trackerSymptomCramps },
          { id: "Headache", label: t.trackerSymptomHeadache },
          { id: "Tiredness", label: t.trackerSymptomTiredness },
          { id: "Bloating", label: t.trackerSymptomBloating },
        ].map((symptom) => (
          <label className="symptom-option" key={symptom.id}>
            <input
              type="checkbox"
              checked={wellnessSymptoms.includes(symptom.id)}
              onChange={() =>
                setWellnessSymptoms((items) =>
                  items.includes(symptom.id)
                    ? items.filter((item) => item !== symptom.id)
                    : [...items, symptom.id]
                )
              }
            />
            {symptom.label}
          </label>
        ))}
      </div>

      <label className="tracker-label" htmlFor="wellness-notes">
        {t.trackerNotesLabel}
      </label>
      <textarea
        id="wellness-notes"
        className="tracker-input tracker-textarea"
        rows={3}
        placeholder={t.trackerNotesPlaceholder}
        value={wellnessNotes}
        onChange={(event) => setWellnessNotes(event.target.value)}
      />

      <p className="tracker-privacy">
        {t.trackerPrivacy}
      </p>
    </article>
  </div>

  <p className="content-note">
    {t.trackerDisclaimer}
  </p>
</section>
</>
  )}

{location.pathname === '/learn' && (
  <>
<section className="section learn-section" id="learn">
  <div className="section-heading">
    <div>
      <span className="section-kicker">
        {t.learnKicker}
      </span>
      <h2>{t.learnHeading}</h2>
      <p>
        {t.learnIntro}
      </p>
    </div>
    <span className="learn-badge">✿ {t.learnBadge}</span>
  </div>

  {/* Topic filters */}
  <div className="learn-filters" aria-label={t.learnFiltersAria}>
    <button
      className={`learn-filter ${selectedTopic === "All" ? "active" : ""}`}
      onClick={() => {
        setSelectedTopic("All")
        setExpandedTopic("")
      }}
    >
      {t.learnAllTopics}
    </button>

    {topics.map((topic) => (
      <button
        key={topic.name}
        className={`learn-filter ${
          selectedTopic === topic.name ? "active" : ""
        }`}
        onClick={() => {
          setSelectedTopic(
            selectedTopic === topic.name ? "All" : topic.name
          )
          setExpandedTopic("")
        }}
      >
        {topic.emoji} {learnCopy[topic.name].title}
      </button>
    ))}
  </div>

  {expandedTopic && learnCopy[expandedTopic] ? (
    <article className="learn-detail" aria-live="polite">
      <button
        type="button"
        className="learn-back"
        onClick={() => setExpandedTopic("")}
      >
        ← {t.learnBackToTopics}
      </button>

      <div className="learn-detail-header">
        <span className={`learn-topic-icon ${activeLearnTopic?.accent || "rose"}`}>
          {activeLearnTopic?.emoji}
        </span>
        <div>
          <h3 className="topic-name">{learnCopy[expandedTopic].title}</h3>
          <p className="topic-detail">{learnCopy[expandedTopic].detail}</p>
        </div>
      </div>

      <p className="learn-detail-intro">{learnCopy[expandedTopic].intro}</p>

      <strong>{t.learnWhatToKnow}</strong>

      <ul className="resource-points">
        {learnCopy[expandedTopic].points.map((point, pointIndex) => (
          <li key={`${expandedTopic}-${pointIndex}`}>{point}</li>
        ))}
      </ul>

      <div className="resource-takeaway">
        <strong>{t.learnRemember}</strong>
        <p>{learnCopy[expandedTopic].takeaway}</p>
      </div>

      <p className="resource-placeholder">
        {t.learnConsult}
      </p>
    </article>
  ) : (
    <>
      <div className="topic-grid">
        {topics
          .filter(
            (topic) =>
              selectedTopic === "All" || topic.name === selectedTopic
          )
          .map((topic) => (
            <article className="topic-card learn-resource" key={topic.name}>
              <span className={`learn-topic-icon ${topic.accent}`}>
                {topic.emoji}
              </span>
              <span className="topic-name">{learnCopy[topic.name].title}</span>
              <span className="topic-detail">{learnCopy[topic.name].detail}</span>
              <button
                type="button"
                className="resource-link"
                onClick={() => setExpandedTopic(topic.name)}
              >
                {t.learnExploreTopic}
              </button>
            </article>
          ))}
      </div>

      <div className="learn-video-note">
        <span className="video-note-icon">▷</span>
        <div>
          <strong>{t.learnVideoNoteTitle}</strong>
          <p>
            {t.learnVideoNoteBody}
          </p>
        </div>
      </div>
    </>
  )}

  <p className="content-note">
    {t.learnDisclaimer}
  </p>
</section>
  </>
)}
{location.pathname === '/assistant' && (
  <>
<section className="section sakhi-chat-section" id="assistant">
  <div className="section-heading">
    <div>
      <span className="section-kicker">{t.assistantPageKicker}</span>
      <h2>{t.assistantPageHeading}</h2>
      <p>
        {t.assistantPageIntro}
      </p>
    </div>
    <span className="heading-flower">✿</span>
  </div>

  <div className="chat-layout">
    <div className="chat-welcome">
      <div className="chat-avatar">S</div>
      <h3>{t.assistantCardTitle}</h3>
      <p>
        {t.assistantCardSubtitle}
      </p>

      <span className="chat-suggestion-label">{t.assistantSuggestionLabel}</span>

      <div className="chat-suggestions">
        {[
          t.assistantSuggestedQ1,
          t.assistantSuggestedQ2,
          t.assistantSuggestedQ3,
          t.assistantSuggestedQ4
        ].map((suggestedQ) => (
          <button
            key={suggestedQ}
            className="chat-suggestion"
            onClick={() => sendChatMessage(suggestedQ)}
          >
            {suggestedQ} <span>↗</span>
          </button>
        ))}
      </div>
    </div>

    <ChatPanel chat={chat} t={t} language={language} renderText={renderChatText} />
  </div>
</section>
  </>
)}

{location.pathname === '/' && (
  <>
       <section className="assistant-section" id="assistant-cta">
          <div className="assistant-decoration">✳</div>
          <div className="assistant-copy">
            <span className="section-kicker">{t.homeAssistantKicker}</span>
            <h2>{t.homeAssistantHeading}</h2>
            <p>
              {t.homeAssistantIntro}
            </p>
          </div>
          <form className="assistant-form" onSubmit={askAssistant}>
            <label htmlFor="health-question">{t.homeAssistantInputLabel}</label>
            <div className="question-input">
              <input
                id="health-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={t.assistantInputPlaceholder}
              />
              <button type="submit" aria-label={t.assistantSend}>→</button>
            </div>
            <span className="privacy-note">{t.homeAssistantPrivacy}</span>
          </form>
        </section>
        </>
)}

        {location.pathname === '/finder' && <HealthcareFinder language={language} />}

        {isNotFound && (
          <section className="section not-found-section" aria-label="Page not found">
            <div className="section-heading">
              <div>
                <span className="section-kicker">{t.notFoundKicker}</span>
                <h2>{t.notFoundTitle}</h2>
                <p>
                  {t.notFoundText}
                </p>
              </div>
              <span className="heading-flower">✿</span>
            </div>
            <button
              type="button"
              className="button-primary"
              onClick={() => goTo('home')}
            >
              {t.notFoundButton} <span>→</span>
            </button>
          </section>
        )}
      </main>

      <footer className="footer" id="care">
        <a
          className="brand footer-brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            goTo('home')
          }}
        >
          <span className="brand-mark">s</span>
          <span>sakhi<span className="brand-accent">.</span></span>
        </a>
        <p>A companion for your health journey.</p>
        <span className="footer-disclaimer">
          For education and support only. Not a substitute for professional medical care.
        </span>
      </footer>
    </div>
  )
}

export default App
