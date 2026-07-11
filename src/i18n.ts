import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

const i18n = new I18n({
  en: {
    // HOME
    appName: "GetMyHelp",
    tagline: "Trusted help for your home",
    getStarted: "Get Started",
    heroLine1: "Your assistant for",
    heroLine2: "Daily Help",
    heroTaglineA: "The simplest way to",
    heroTaglineB: "manage your household help",
    heroCardBubble: "Sunita marked present today",
    heroCardGreat: "Great!",
    heroCardTotal: "Total",
    heroCardMid: "days worked this",
    heroCardMonth: "month",
    heroCardValue: "26",
    termsNote: "By continuing, you agree to our",
    terms: "Terms",

    // PHONE
    phoneTitle: "Enter your phone number",
    phoneSubtitle: "We’ll send you an OTP to continue",
    phonePlaceholder: "Enter phone number",
    getOtp: "Get OTP",
    phoneError: "Please enter a valid 10-digit phone number",

    // OTP
    otpTitle: "Enter OTP",
    otpSubtitle: "We've sent a 6-digit code to your phone.",
    otpError: "Please enter the 6-digit OTP",
    verifyContinue: "Verify & Continue",
    didntReceive: "Didn’t receive the code?",
    resend: "Resend",

    // LOCATION
    step1: "Step 1 of 3",
    whereDoYouLive: "Where do you live?",
    locationSubtitle: "Search and choose your residential community.",
    areaDetected: "detected",
    selectSociety: "Select your society",
    useCurrentLocation: "Use my current location",
    fetchingLocation: "Fetching location...",
    locationPermissionError:
      "Location access is required to detect nearby societies.",
    locationFetchError: "Unable to fetch current location",
    continue: "Continue",
    enterLocationManually: "Enter location manually",


    // TOWER
    step2: "Step 2 of 3",
    selectTower: "What's your flat or house number?",
    towerSubtitle: "Enter your exact flat or house number.",
    seeMore: "See more",
    showLess: "Show less",

    step3: "Step 3 of 3",
    houseTitle: "What’s your house number?",
    houseSubtitle: "Enter your exact house number",
    houseError: "Please enter your house number",
    housePlaceholder: "e.g. 116C",

    selectPlan: "Select your plan",
    planSubtitle: "Choose a membership that fits your home",
    mostPopular: "Most Popular",
    perMonth: "/ month",
    getPlan: "Get Plan",

    // DASHBOARD
    greeting: "Good Morning",
    homeOverview: "Here's your home help overview.",
    activeMaids: "Active Maids",
    quickActions: "Quick Actions",
    emergencyHelp: "Emergency Help",

    // LANGUAGE
    chooseLanguage: "Choose Language",
  },

  hi: {
    // HOME
    appName: "GetMyHelp",
    tagline: "आपके घर के लिए भरोसेमंद मदद",
    getStarted: "शुरू करें",
    heroLine1: "आपका सहायक",
    heroLine2: "रोज़ की मदद",
    heroTaglineA: "घर की मदद संभालने का",
    heroTaglineB: "सबसे आसान तरीका",
    heroCardBubble: "सुनीता आज उपस्थित हैं",
    heroCardGreat: "बढ़िया!",
    heroCardTotal: "कुल",
    heroCardMid: "दिन काम इस",
    heroCardMonth: "महीने",
    heroCardValue: "26",
    termsNote: "जारी रखने पर आप हमारी",
    terms: "शर्तों",

    // PHONE
    phoneTitle: "मोबाइल नंबर दर्ज करें",
    phoneSubtitle: "आगे बढ़ने के लिए हम आपको OTP भेजेंगे",
    phonePlaceholder: "मोबाइल नंबर दर्ज करें",
    getOtp: "OTP प्राप्त करें",
    phoneError: "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें",

    otpSubtitle: "हमने आपके फोन पर 6 अंकों का कोड भेजा है।",
    otpError: "कृपया 6 अंकों का OTP दर्ज करें",
    verifyContinue: "सत्यापित करें और आगे बढ़ें",
    didntReceive: "कोड नहीं मिला?",
    resend: "दोबारा भेजें",
    otpTitle: "OTP दर्ज करें",

    step1: "चरण 1 / 3",
    whereDoYouLive: "आप कहाँ रहते हैं?",
    locationSubtitle: "अपनी रेसिडेंशियल सोसाइटी चुनें।",
    areaDetected: "पता चला",
    selectSociety: "अपनी सोसाइटी चुनें",
    useCurrentLocation: "मेरी वर्तमान लोकेशन का उपयोग करें",
    fetchingLocation: "लोकेशन प्राप्त की जा रही है...",
    locationPermissionError: "पास की सोसाइटी खोजने के लिए लोकेशन की अनुमति आवश्यक है।",
    locationFetchError: "लोकेशन प्राप्त नहीं हो सकी",
    continue: "आगे बढ़ें",

    step2: "चरण 2 / 3",
    selectTower: "आपका फ्लैट या मकान नंबर क्या है?",
    towerSubtitle: "अपना सटीक फ्लैट या मकान नंबर दर्ज करें।",
    seeMore: "और देखें",
    showLess: "कम दिखाएं",

    step3: "चरण 3 / 3",
    houseTitle: "आपका घर नंबर क्या है?",
    houseSubtitle: "अपना सटीक घर नंबर दर्ज करें",
    houseError: "कृपया घर नंबर दर्ज करें",
    housePlaceholder: "जैसे 116C",

    selectPlan: "अपनी योजना चुनें",
    planSubtitle: "अपने घर के लिए उपयुक्त सदस्यता चुनें",
    mostPopular: "सबसे लोकप्रिय",
    perMonth: "/ माह",
    getPlan: "योजना लें",

    greeting: "शुभ प्रभात",
    homeOverview: "यह आपकी होम हेल्प जानकारी है।",
    activeMaids: "सक्रिय मेड",
    quickActions: "त्वरित क्रियाएँ",
    emergencyHelp: "आपातकालीन सहायता",


    // LANGUAGE
    chooseLanguage: "भाषा चुनें",
  },
});

// SAFE locale detection for modern expo-localization
const locales = Localization.getLocales();
const deviceLocale = locales && locales.length > 0 ? locales[0].languageCode : "en";

i18n.locale = deviceLocale ? deviceLocale.split("-")[0] : "en";
i18n.enableFallback = true;

export default i18n;
