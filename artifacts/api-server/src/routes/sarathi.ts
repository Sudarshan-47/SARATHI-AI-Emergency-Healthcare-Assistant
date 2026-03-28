import { Router, type IRouter } from "express";

const router: IRouter = Router();

type Language = "english" | "hindi" | "telugu";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const SYMPTOM_KEYWORDS = {
  critical: {
    en: ["chest pain", "heart attack", "cardiac arrest", "stroke", "not breathing", "unconscious", "unresponsive", "severe bleeding", "choking", "poisoning", "overdose", "seizure", "anaphylaxis", "allergic reaction", "stopped breathing", "no pulse", "coughing blood", "vomiting blood"],
    hi: ["सीने में दर्द", "दिल का दौरा", "हार्ट अटैक", "स्ट्रोक", "सांस नहीं", "बेहोश", "गंभीर रक्तस्राव", "दम घुटना", "जहर", "दौरे", "एलर्जी"],
    te: ["ఛాతీ నొప్పి", "గుండె పోటు", "స్ట్రోక్", "శ్వాస తీసుకోలేదు", "స్పృహ తప్పింది", "తీవ్రమైన రక్తస్రావం", "విషం"]
  },
  high: {
    en: ["severe pain", "high fever", "difficulty breathing", "shortness of breath", "severe headache", "vision loss", "paralysis", "broken bone", "deep cut", "head injury", "confusion", "severe vomiting", "abdominal pain", "appendix", "kidney stone"],
    hi: ["तेज दर्द", "तेज बुखार", "सांस लेने में तकलीफ", "गंभीर सिरदर्द", "दृष्टि हानि", "लकवा", "हड्डी टूटी", "गहरा घाव", "सिर में चोट"],
    te: ["తీవ్రమైన నొప్పి", "అధిక జ్వరం", "శ్వాస తీసుకోవడం కష్టం", "తీవ్రమైన తలనొప్పి", "దృష్టి కోల్పోవడం", "పక్షవాతం", "ఎముక విరిగింది"]
  },
  medium: {
    en: ["fever", "vomiting", "diarrhea", "moderate pain", "sprain", "burn", "cut", "bruise", "headache", "dizziness", "nausea", "back pain", "stomach ache", "rash", "swelling"],
    hi: ["बुखार", "उल्टी", "दस्त", "दर्द", "मोच", "जलन", "कट", "सिरदर्द", "चक्कर", "मतली", "पेट दर्द", "चकत्ते", "सूजन"],
    te: ["జ్వరం", "వాంతులు", "విరేచనాలు", "నొప్పి", "మంటలు", "కట్", "తలనొప్పి", "తిరుగుళ్ళు", "వికారం", "కడుపు నొప్పి", "దద్దుర్లు", "వాపు"]
  },
  low: {
    en: ["cold", "cough", "sneezing", "mild pain", "fatigue", "tired", "sore throat", "runny nose", "minor cut", "bruise", "itching"],
    hi: ["जुकाम", "खांसी", "छींक", "हल्का दर्द", "थकान", "गले में खराश", "नाक बहना", "खुजली"],
    te: ["జలుబు", "దగ్గు", "తుమ్ము", "తేలికపాటి నొప్పి", "అలసట", "గొంతు నొప్పి", "ముక్కు కారడం", "దురద"]
  }
};

const RED_FLAGS = [
  "chest pain", "difficulty breathing", "unconscious", "severe bleeding",
  "stroke symptoms", "severe allergic reaction", "poisoning", "seizure",
  "सीने में दर्द", "सांस नहीं", "बेहोश", "ఛాతీ నొప్పి", "స్పృహ తప్పింది"
];

function detectSeverity(symptoms: string, lang: Language): { severity: Severity; score: number; detectedSymptoms: string[]; redFlags: string[] } {
  const lowerSymptoms = symptoms.toLowerCase();
  const detected: string[] = [];
  const foundRedFlags: string[] = [];
  let score = 0;

  const checkKeywords = (words: string[], level: number) => {
    words.forEach(word => {
      if (lowerSymptoms.includes(word.toLowerCase())) {
        detected.push(word);
        score += level;
      }
    });
  };

  checkKeywords(SYMPTOM_KEYWORDS.critical.en, 40);
  checkKeywords(SYMPTOM_KEYWORDS.critical.hi, 40);
  checkKeywords(SYMPTOM_KEYWORDS.critical.te, 40);
  checkKeywords(SYMPTOM_KEYWORDS.high.en, 25);
  checkKeywords(SYMPTOM_KEYWORDS.high.hi, 25);
  checkKeywords(SYMPTOM_KEYWORDS.high.te, 25);
  checkKeywords(SYMPTOM_KEYWORDS.medium.en, 15);
  checkKeywords(SYMPTOM_KEYWORDS.medium.hi, 15);
  checkKeywords(SYMPTOM_KEYWORDS.medium.te, 15);
  checkKeywords(SYMPTOM_KEYWORDS.low.en, 5);
  checkKeywords(SYMPTOM_KEYWORDS.low.hi, 5);
  checkKeywords(SYMPTOM_KEYWORDS.low.te, 5);

  RED_FLAGS.forEach(flag => {
    if (lowerSymptoms.includes(flag.toLowerCase())) {
      foundRedFlags.push(flag);
    }
  });

  if (score === 0 && symptoms.length > 5) score = 5;

  let severity: Severity;
  if (score >= 40 || foundRedFlags.length > 0) severity = "CRITICAL";
  else if (score >= 25) severity = "HIGH";
  else if (score >= 15) severity = "MEDIUM";
  else severity = "LOW";

  return { severity, score: Math.min(score, 100), detectedSymptoms: [...new Set(detected)], redFlags: foundRedFlags };
}

const MESSAGES = {
  english: {
    greeting: (name: string) => `Hello ${name}, I am SARATHI AI, your emergency health assistant. I'm analyzing your symptoms now.`,
    critical: (name: string) => `${name}, this is a CRITICAL emergency! Call 108 immediately! While waiting for help, I'll guide you through first aid steps.`,
    high: (name: string) => `${name}, your symptoms indicate a HIGH severity condition. You need immediate medical attention. Please go to the nearest hospital or call 108.`,
    medium: (name: string) => `${name}, your symptoms indicate a MEDIUM severity condition. Please visit a doctor soon. I'll provide first aid guidance.`,
    low: (name: string) => `${name}, your symptoms appear to be LOW severity. I'll provide some home care guidance. However, consult a doctor if symptoms worsen.`,
    followup: ["How long have you been experiencing these symptoms?", "Are you alone right now or is someone with you?", "Do you have any known medical conditions or allergies?", "On a scale of 1-10, how severe is your pain?", "Have you taken any medication recently?"]
  },
  hindi: {
    greeting: (name: string) => `नमस्ते ${name}, मैं SARATHI AI हूं, आपका आपातकालीन स्वास्थ्य सहायक। मैं अभी आपके लक्षणों का विश्लेषण कर रहा हूं।`,
    critical: (name: string) => `${name}, यह एक CRITICAL आपातकाल है! तुरंत 108 पर कॉल करें! मदद आने तक मैं आपको प्राथमिक चिकित्सा के कदम बताऊंगा।`,
    high: (name: string) => `${name}, आपके लक्षण HIGH गंभीरता दर्शाते हैं। तुरंत चिकित्सा सहायता लें। कृपया नजदीकी अस्पताल जाएं या 108 पर कॉल करें।`,
    medium: (name: string) => `${name}, आपके लक्षण MEDIUM गंभीरता के हैं। जल्द डॉक्टर से मिलें। मैं प्राथमिक चिकित्सा मार्गदर्शन दूंगा।`,
    low: (name: string) => `${name}, आपके लक्षण LOW गंभीरता के लगते हैं। मैं घरेलू देखभाल के सुझाव दूंगा। लक्षण बिगड़ने पर डॉक्टर से मिलें।`,
    followup: ["आप इन लक्षणों का कितने समय से अनुभव कर रहे हैं?", "क्या आप अभी अकेले हैं या कोई आपके साथ है?", "क्या आपको कोई ज्ञात बीमारी या एलर्जी है?", "1-10 के पैमाने पर, आपका दर्द कितना गंभीर है?", "क्या आपने हाल ही में कोई दवा ली है?"]
  },
  telugu: {
    greeting: (name: string) => `నమస్కారం ${name}, నేను SARATHI AI, మీ అత్యవసర ఆరోగ్య సహాయకుడు. నేను ఇప్పుడు మీ లక్షణాలను విశ్లేషిస్తున్నాను.`,
    critical: (name: string) => `${name}, ఇది CRITICAL అత్యవసర పరిస్థితి! వెంటనే 108కి కాల్ చేయండి! సహాయం వచ్చే వరకు నేను మీకు ప్రాథమిక చికిత్స దశలు చెప్తాను.`,
    high: (name: string) => `${name}, మీ లక్షణాలు HIGH తీవ్రతను సూచిస్తున్నాయి. వెంటనే వైద్య సహాయం తీసుకోండి. దయచేసి సమీప ఆసుపత్రికి వెళ్ళండి లేదా 108కి కాల్ చేయండి.`,
    medium: (name: string) => `${name}, మీ లక్షణాలు MEDIUM తీవ్రతను కలిగి ఉన్నాయి. త్వరలో వైద్యుడిని చూడండి. నేను ప్రాథమిక చికిత్స మార్గదర్శకత్వం ఇస్తాను.`,
    low: (name: string) => `${name}, మీ లక్షణాలు LOW తీవ్రతగా కనిపిస్తున్నాయి. నేను ఇంటి సంరక్షణ సూచనలు ఇస్తాను. లక్షణాలు తీవ్రమైతే వైద్యుడిని సంప్రదించండి.`,
    followup: ["మీరు ఈ లక్షణాలను ఎంత కాలంగా అనుభవిస్తున్నారు?", "మీరు ఇప్పుడు ఒంటరిగా ఉన్నారా లేదా ఎవరైనా మీతో ఉన్నారా?", "మీకు ఏదైనా తెలిసిన వైద్య పరిస్థితి లేదా అలెర్జీ ఉందా?", "1-10 స్కేల్‌లో, మీ నొప్పి ఎంత తీవ్రంగా ఉంది?", "మీరు ఇటీవల ఏదైనా మందులు తీసుకున్నారా?"]
  }
};

const FIRST_AID = {
  CRITICAL: {
    english: ["Call 108 (Emergency) immediately", "Keep the person calm and still", "Do not give food or water", "If unconscious, check for breathing and pulse", "Start CPR if person is not breathing and you are trained", "Keep airways clear", "Do not move if spinal injury suspected", "Stay on line with emergency services"],
    hindi: ["तुरंत 108 (आपातकाल) पर कॉल करें", "व्यक्ति को शांत और स्थिर रखें", "खाना या पानी न दें", "यदि बेहोश है, सांस और नाड़ी जांचें", "यदि सांस नहीं है और आप प्रशिक्षित हैं तो CPR शुरू करें", "वायुमार्ग साफ रखें", "रीढ़ की चोट की आशंका हो तो न हिलाएं", "आपातकालीन सेवाओं के साथ लाइन पर रहें"],
    telugu: ["వెంటనే 108 (అత్యవసర) కాల్ చేయండి", "వ్యక్తిని శాంతంగా మరియు స్థిరంగా ఉంచండి", "ఆహారం లేదా నీళ్ళు ఇవ్వకండి", "స్పృహ తప్పినట్లుంటే, శ్వాస మరియు నాడి తనిఖీ చేయండి", "శ్వాస తీసుకోకపోతే మరియు మీకు శిక్షణ ఉంటే CPR ప్రారంభించండి", "శ్వాసమార్గాలు శుభ్రంగా ఉంచండి", "వెన్నెముక గాయం అనుమానం ఉంటే కదిలించకండి"]
  },
  HIGH: {
    english: ["Seek immediate medical attention", "Call 108 or go to emergency room", "Monitor vital signs continuously", "Keep person comfortable and still", "Do not give pain medication without medical advice", "Document symptoms and time of onset", "Keep person warm but not overheated"],
    hindi: ["तुरंत चिकित्सा सहायता लें", "108 पर कॉल करें या आपातकालीन कक्ष में जाएं", "महत्वपूर्ण संकेतों की निगरानी करें", "व्यक्ति को आरामदायक रखें", "बिना चिकित्सीय सलाह के दर्द की दवा न दें", "लक्षणों और शुरुआत का समय दर्ज करें"],
    telugu: ["వెంటనే వైద్య సహాయం తీసుకోండి", "108 కాల్ చేయండి లేదా అత్యవసర గదికి వెళ్ళండి", "ముఖ్యమైన సంకేతాలు నిరంతరం పర్యవేక్షించండి", "వ్యక్తిని సౌకర్యంగా ఉంచండి", "వైద్య సలహా లేకుండా నొప్పి మందు ఇవ్వకండి"]
  },
  MEDIUM: {
    english: ["Visit a doctor or clinic today", "Rest and avoid strenuous activity", "Stay hydrated - drink plenty of water", "Take prescribed medications if any", "Monitor symptoms and note any changes", "Apply ice pack for swelling/pain (20 min on, 20 min off)", "If fever: tepid sponging, light clothing"],
    hindi: ["आज डॉक्टर या क्लीनिक जाएं", "आराम करें और कठिन गतिविधि से बचें", "हाइड्रेटेड रहें - खूब पानी पिएं", "निर्धारित दवाएं लें", "लक्षणों की निगरानी करें", "सूजन/दर्द के लिए आइस पैक लगाएं"],
    telugu: ["ఈరోజు వైద్యుడిని లేదా క్లినిక్‌ను సందర్శించండి", "విశ్రాంతి తీసుకోండి మరియు శ్రమతో కూడిన కార్యకలాపాలు మానుకోండి", "హైడ్రేటెడ్‌గా ఉండండి - పుష్కలంగా నీళ్ళు తాగండి", "సూచించిన మందులు తీసుకోండి"]
  },
  LOW: {
    english: ["Rest at home and monitor symptoms", "Drink plenty of fluids", "Take OTC medications as needed (paracetamol for fever/pain)", "Gargle with warm salt water for sore throat", "Use steam inhalation for cold/congestion", "Get adequate sleep (7-8 hours)", "Consult a doctor if no improvement in 2-3 days"],
    hindi: ["घर पर आराम करें और लक्षणों की निगरानी करें", "खूब पानी पिएं", "आवश्यकतानुसार OTC दवाएं लें", "गले में खराश के लिए गर्म नमक के पानी से गरारे करें", "भाप लें", "पर्याप्त नींद लें", "2-3 दिनों में सुधार न हो तो डॉक्टर से मिलें"],
    telugu: ["ఇంట్లో విశ్రాంతి తీసుకోండి మరియు లక్షణాలు పర్యవేక్షించండి", "పుష్కలంగా ద్రవాలు తాగండి", "అవసరమైన OTC మందులు తీసుకోండి", "ఆవిరి పీల్చుకోండి", "తగినంత నిద్ర తీసుకోండి"]
  }
};

const POSSIBLE_CONDITIONS: Record<string, string[]> = {
  "chest pain": ["Angina", "Heart Attack (MI)", "Costochondritis", "GERD", "Anxiety"],
  "fever": ["Viral Fever", "Bacterial Infection", "Dengue", "Malaria", "Typhoid"],
  "headache": ["Tension Headache", "Migraine", "Hypertension", "Sinusitis", "Dehydration"],
  "breathing": ["Asthma", "Bronchitis", "Pneumonia", "COVID-19", "Pulmonary Embolism"],
  "stomach": ["Gastritis", "Appendicitis", "IBS", "Food Poisoning", "Kidney Stone"],
  "default": ["Assessment in progress", "Further evaluation needed", "Symptom-based diagnosis"]
};

function getPossibleConditions(symptoms: string): string[] {
  const lower = symptoms.toLowerCase();
  for (const [key, conditions] of Object.entries(POSSIBLE_CONDITIONS)) {
    if (lower.includes(key)) return conditions;
  }
  return POSSIBLE_CONDITIONS.default;
}

router.post("/sarathi/triage", (req, res) => {
  const { symptoms, language = "english", userName = "Patient" } = req.body as {
    symptoms: string;
    language: Language;
    userName: string;
    age?: string;
    conversationHistory?: ConversationMessage[];
  };

  const { severity, score, detectedSymptoms, redFlags } = detectSeverity(symptoms, language);
  const confidence = Math.min(85 + Math.random() * 10, 98);

  const lang = language as Language;
  const msgs = MESSAGES[lang] || MESSAGES.english;
  const firstAidKey = severity as keyof typeof FIRST_AID;
  const firstAidLang = (lang === "hindi" ? "hindi" : lang === "telugu" ? "telugu" : "english") as "english" | "hindi" | "telugu";
  const firstAid = FIRST_AID[firstAidKey][firstAidLang] || FIRST_AID[firstAidKey].english;

  const severityMsg = severity === "CRITICAL" ? msgs.critical(userName)
    : severity === "HIGH" ? msgs.high(userName)
    : severity === "MEDIUM" ? msgs.medium(userName)
    : msgs.low(userName);

  const greeting = msgs.greeting(userName);
  const aiMessage = `${greeting} ${severityMsg}`;

  const followupIdx = Math.floor(Math.random() * msgs.followup.length);
  const followUpQuestion = msgs.followup[followupIdx];

  res.json({
    severity,
    severityScore: score,
    confidence: Math.round(confidence),
    immediateAction: firstAid[0],
    firstAid,
    followUpQuestion,
    aiMessage,
    possibleConditions: getPossibleConditions(symptoms),
    callEmergency: severity === "CRITICAL" || severity === "HIGH",
    triageDetails: {
      symptoms: detectedSymptoms,
      redFlags
    }
  });
});

router.post("/sarathi/followup", (req, res) => {
  const { answer, language = "english", severity = "MEDIUM", userName = "Patient", conversationHistory = [] } = req.body as {
    answer: string;
    language: Language;
    severity: Severity;
    conversationHistory: ConversationMessage[];
    userName: string;
  };

  const lang = language as Language;
  const msgs = MESSAGES[lang] || MESSAGES.english;
  const questionCount = conversationHistory.filter(m => m.role === "assistant").length;
  const isComplete = questionCount >= 3;

  let updatedSeverity = severity;
  const lowerAnswer = answer.toLowerCase();

  if (lowerAnswer.includes("yes") || lowerAnswer.includes("alone") || lowerAnswer.includes("worse") ||
      lowerAnswer.includes("हां") || lowerAnswer.includes("अकेला") || lowerAnswer.includes("అవును")) {
    if (severity === "LOW") updatedSeverity = "MEDIUM";
    else if (severity === "MEDIUM") updatedSeverity = "HIGH";
  }

  const followupMessages: Record<Language, string[]> = {
    english: [
      `Thank you for that information, ${userName}. I understand. Let me ask you one more important question.`,
      `I see, ${userName}. That helps me better assess your condition. Please answer this:`,
      `${userName}, I have enough information now. Based on everything you've told me, here is my assessment.`
    ],
    hindi: [
      `${userName}, उस जानकारी के लिए धन्यवाद। मुझे समझ आया। एक और महत्वपूर्ण प्रश्न पूछना चाहता हूं।`,
      `${userName}, यह जानकारी आपकी स्थिति का बेहतर आकलन करने में मदद करती है।`,
      `${userName}, मुझे अब पर्याप्त जानकारी है। आपने जो बताया उसके आधार पर मेरा आकलन है।`
    ],
    telugu: [
      `${userName}, ఆ సమాచారానికి ధన్యవాదాలు. నాకు అర్థమైంది. మరొక ముఖ్యమైన ప్రశ్న అడగాలనుకుంటున్నాను.`,
      `${userName}, ఇది మీ పరిస్థితిని బాగా అంచనా వేయడానికి సహాయపడుతుంది.`,
      `${userName}, నాకు ఇప్పుడు తగినంత సమాచారం ఉంది. మీరు చెప్పిన దాని ఆధారంగా నా అంచనా ఇది.`
    ]
  };

  const msgIdx = Math.min(questionCount, 2);
  const message = followupMessages[lang]?.[msgIdx] || followupMessages.english[msgIdx];

  const nextQuestionIdx = (questionCount + 1) % msgs.followup.length;
  const nextQuestion = isComplete ? "" : msgs.followup[nextQuestionIdx];

  const additionalFirstAid = isComplete ? (FIRST_AID[updatedSeverity as keyof typeof FIRST_AID]?.english?.slice(0, 3) || []) : [];

  res.json({
    message,
    updatedSeverity,
    nextQuestion,
    additionalFirstAid,
    isConversationComplete: isComplete
  });
});

router.get("/sarathi/hospitals", (_req, res) => {
  const hospitals = [
    {
      id: "1",
      name: "Yashoda Hospitals",
      distance: "1.2 km",
      phone: "+91-40-4567-4567",
      address: "Somajiguda, Hyderabad, Telangana 500082",
      speciality: "Multi-specialty Emergency",
      emergencyAvailable: true,
      rating: 4.7,
      mapsUrl: "https://maps.google.com/?q=Yashoda+Hospitals+Somajiguda+Hyderabad"
    },
    {
      id: "2",
      name: "KIMS Hospital",
      distance: "2.4 km",
      phone: "+91-40-4488-5000",
      address: "Minister Road, Secunderabad, Hyderabad 500003",
      speciality: "Cardiac & Emergency Care",
      emergencyAvailable: true,
      rating: 4.6,
      mapsUrl: "https://maps.google.com/?q=KIMS+Hospital+Secunderabad+Hyderabad"
    },
    {
      id: "3",
      name: "Nizam's Institute of Medical Sciences (NIMS)",
      distance: "3.8 km",
      phone: "+91-40-2345-6789",
      address: "Punjagutta, Hyderabad, Telangana 500082",
      speciality: "Government Super Specialty",
      emergencyAvailable: true,
      rating: 4.3,
      mapsUrl: "https://maps.google.com/?q=NIMS+Punjagutta+Hyderabad"
    },
    {
      id: "4",
      name: "Apollo Hospitals",
      distance: "4.1 km",
      phone: "+91-40-2360-7777",
      address: "Jubilee Hills, Hyderabad, Telangana 500033",
      speciality: "Multi-specialty & Trauma",
      emergencyAvailable: true,
      rating: 4.8,
      mapsUrl: "https://maps.google.com/?q=Apollo+Hospitals+Jubilee+Hills+Hyderabad"
    },
    {
      id: "5",
      name: "Care Hospitals",
      distance: "5.2 km",
      phone: "+91-40-3041-8888",
      address: "Banjara Hills, Hyderabad, Telangana 500034",
      speciality: "Neurology & Emergency",
      emergencyAvailable: true,
      rating: 4.5,
      mapsUrl: "https://maps.google.com/?q=Care+Hospitals+Banjara+Hills+Hyderabad"
    },
    {
      id: "6",
      name: "Government General Hospital (Osmania)",
      distance: "6.5 km",
      phone: "+91-40-2460-2460",
      address: "Afzalgunj, Hyderabad, Telangana 500012",
      speciality: "General & Emergency (Govt.)",
      emergencyAvailable: true,
      rating: 3.9,
      mapsUrl: "https://maps.google.com/?q=Osmania+General+Hospital+Hyderabad"
    }
  ];

  res.json({ hospitals });
});

export default router;
