// Extra UI strings for the chat feature. Keys match the language labels in App.jsx.
// Have a native speaker on the team proofread these before the demo.
export const chatStrings = {
  English: {
    ready: '● Ready', offline: '● Offline', listening: 'Listening…',
    micStart: 'Ask by speaking', micStop: 'Stop listening',
    micDenied: 'Microphone is blocked. Allow it in your browser settings.',
    micError: "Couldn't hear you. Please try again.",
    speak: 'Listen', stopSpeak: 'Stop', thinking: 'Sakhi is typing', urgent: '⚠ URGENT',
    offlineNote: 'Offline mode — basic answers only. In an emergency call 108 or 112.',
  },
  'हिन्दी': {
    ready: '● तैयार', offline: '● ऑफ़लाइन', listening: 'सुन रही हूँ…',
    micStart: 'बोलकर पूछें', micStop: 'सुनना बंद करें',
    micDenied: 'माइक्रोफ़ोन की अनुमति बंद है। ब्राउज़र सेटिंग में अनुमति दें।',
    micError: 'आपकी आवाज़ सुनाई नहीं दी। कृपया फिर कोशिश करें।',
    speak: 'सुनें', stopSpeak: 'रोकें', thinking: 'सखी लिख रही है', urgent: '⚠ ज़रूरी',
    offlineNote: 'ऑफ़लाइन मोड — केवल बुनियादी जवाब। आपातकाल में 108 या 112 पर कॉल करें।',
  },
  'ಕನ್ನಡ': {
    ready: '● ಸಿದ್ಧ', offline: '● ಆಫ್‌ಲೈನ್', listening: 'ಕೇಳುತ್ತಿದ್ದೇನೆ…',
    micStart: 'ಮಾತನಾಡಿ ಕೇಳಿ', micStop: 'ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    micDenied: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿಸಿ.',
    micError: 'ನಿಮ್ಮ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    speak: 'ಕೇಳಿ', stopSpeak: 'ನಿಲ್ಲಿಸಿ', thinking: 'ಸಖಿ ಬರೆಯುತ್ತಿದ್ದಾಳೆ', urgent: '⚠ ತುರ್ತು',
    offlineNote: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ — ಮೂಲ ಉತ್ತರಗಳು ಮಾತ್ರ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 108 ಅಥವಾ 112ಕ್ಕೆ ಕರೆ ಮಾಡಿ.',
  },
  'தமிழ்': {
    ready: '● தயார்', offline: '● ஆஃப்லைன்', listening: 'கேட்கிறேன்…',
    micStart: 'பேசிக் கேளுங்கள்', micStop: 'கேட்பதை நிறுத்து',
    micDenied: 'மைக்ரோஃபோன் அனுமதி தடுக்கப்பட்டுள்ளது. உலாவி அமைப்புகளில் அனுமதியுங்கள்.',
    micError: 'உங்கள் குரல் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
    speak: 'கேளுங்கள்', stopSpeak: 'நிறுத்து', thinking: 'சகி தட்டச்சு செய்கிறாள்', urgent: '⚠ அவசரம்',
    offlineNote: 'ஆஃப்லைன் முறை — அடிப்படை பதில்கள் மட்டும். அவசரநிலையில் 108 அல்லது 112-ஐ அழைக்கவும்.',
  },
  'తెలుగు': {
    ready: '● సిద్ధం', offline: '● ఆఫ్‌లైన్', listening: 'వింటున్నాను…',
    micStart: 'మాట్లాడి అడగండి', micStop: 'వినడం ఆపండి',
    micDenied: 'మైక్రోఫోన్ అనుమతి నిరోధించబడింది. బ్రౌజర్ సెట్టింగ్స్‌లో అనుమతించండి.',
    micError: 'మీ స్వరం వినిపించలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
    speak: 'వినండి', stopSpeak: 'ఆపండి', thinking: 'సఖి టైప్ చేస్తోంది', urgent: '⚠ అత్యవసరం',
    offlineNote: 'ఆఫ్‌లైన్ మోడ్ — ప్రాథమిక సమాధానాలు మాత్రమే. అత్యవసరంలో 108 లేదా 112కు కాల్ చేయండి.',
  },
  'বাংলা': {
    ready: '● প্রস্তুত', offline: '● অফলাইন', listening: 'শুনছি…',
    micStart: 'বলে প্রশ্ন করুন', micStop: 'শোনা বন্ধ করুন',
    micDenied: 'মাইক্রোফোনের অনুমতি বন্ধ আছে। ব্রাউজার সেটিংসে অনুমতি দিন।',
    micError: 'আপনার কথা শোনা যায়নি। আবার চেষ্টা করুন।',
    speak: 'শুনুন', stopSpeak: 'থামান', thinking: 'সখী লিখছে', urgent: '⚠ জরুরি',
    offlineNote: 'অফলাইন মোড — শুধু প্রাথমিক উত্তর। জরুরি অবস্থায় 108 বা 112 নম্বরে কল করুন।',
  },
}
