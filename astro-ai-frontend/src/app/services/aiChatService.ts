/**
 * AstroAI — AI Astrologer Service Layer
 * Connects directly to high-speed Vercel serverless AI route and Render backend fallback.
 */

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  remedy?: string;
  mantra?: string;
  timestamp: string;
}

export interface UserAstrologicalContext {
  name?: string;
  dob?: string;
  tob?: string;
  pob?: string;
  rashi?: string;
  lagna?: string;
  astrologerName?: string;
  specialty?: string;
  title?: string;
}

export const USE_REAL_BACKEND = true;

/**
 * Intelligent In-house Vedic Astrologer Engine (Warm, Empathetic Human Guidance)
 */
export function simulateVedicAstrologerEngine(
  userQuery: string,
  context?: UserAstrologicalContext
): { text: string; remedy?: string; mantra?: string } {
  const q = userQuery.toLowerCase().trim();
  const userName = context?.name || "Seeker";
  const astroName = context?.astrologerName || "Maa Gayatri Devi";
  const isMaa = astroName.toLowerCase().includes("gayatri") || astroName.toLowerCase().includes("maa");
  const isAcharya = astroName.toLowerCase().includes("vidyadhar") || astroName.toLowerCase().includes("acharya");
  const isAnanya = astroName.toLowerCase().includes("ananya");

  const address = isMaa ? "Beta" : (userName !== "Seeker" ? userName : "Bhakta");
  const blessing = isMaa ? "Kalyan ho mere bacche, sada khush raho! Maa Gayatri ka aashirwad hamesha tumhare sath hai." 
    : isAcharya ? `Pranam ${userName}! Bhagwan Ganesh aur Devguru Brihaspati ka aashirwad aap par bana rahe.`
    : isAnanya ? `Namaste ${userName}! Prem aur vishwas hi jeevan ki sabse badi shakti hai.`
    : `Hari Om ${userName}! Surya Dev ki kripa se aapka jeevan tejomay ho.`;

  // 0. Academic, Math Formulas, Equations, Science
  if (
    q.includes("a+b") || q.includes("(a+b)") || q.includes("square") || q.includes("squre") ||
    q.includes("formula") || q.includes("math") || q.includes("ganit") || q.includes("2+2") ||
    q.includes("plus") || q.includes("minus") || q.includes("multiply") || q.includes("divide")
  ) {
    let mathAnswer = "(a + b)² = a² + 2ab + b² (a square plus 2ab plus b square)";
    if (q.includes("a-b")) mathAnswer = "(a - b)² = a² - 2ab + b²";
    if (q.includes("a2-b2") || q.includes("a^2-b^2")) mathAnswer = "a² - b² = (a - b)(a + b)";
    return {
      text: `${blessing} \n\nBeta, ${mathAnswer} hota hai! Chahe ganit ke sutra hon ya jeevan ke niyam, jab tak aadhar aur calculation satik hain, parinam sadaiv safal hota hai. Khoob dhyan lagakar padhai karo aur aage badho!`,
      remedy: "",
      mantra: "",
    };
  }

  // 1. Greetings (Ram Ram, Pranam, Namaste, Jai Mata Di, etc.)
  if (
    q.includes("ram ram") || q.includes("pranam") || q.includes("namaste") ||
    q.includes("jai mata di") || q.includes("radhe radhe") || q.includes("hari om") ||
    q.includes("jai shree ram") || q.includes("har har mahadev") || q.includes("hello") ||
    q.includes("hi") || q === "mata ji" || q === "pandit ji" || q === "guruji"
  ) {
    return {
      text: `${blessing} \n\nKahiye ${address}, aaj aapke man me kya prashna ya chinta hai? Chahe shaadi, career, dhan, parivar ya kisi grah dosha se judi baat ho—aap bina kisi sankoch ke mujhse khul kar pooch sakte hain.`,
      remedy: "",
      mantra: "",
    };
  }

  // 2. Love & Marriage (Vivah Yog)
  if (
    q.includes("shaadi") || q.includes("marriage") || q.includes("vivah") ||
    q.includes("love") || q.includes("pyaar") || q.includes("rishta") ||
    q.includes("breakup") || q.includes("patni") || q.includes("pati") || q.includes("partner")
  ) {
    return {
      text: `${address}, vivah aur rishton ke maamle me chinta mat kijiye. Janam Kundli ke Saptam Bhaav (7th House) par Brihaspati aur Shukra ke transit ke kaaran thoda vilamb ya man-mutaav dikh raha hai, parantu aane wale 3 se 6 mahino me anukool yog prabal ho rahe hain. Dhyan rakhein ki baat-cheet me krodh aur jaldbaazi se bachein.`,
      remedy: "Guruwaar (Thursday) ke din peele vastra dharan karein, Vishnu Sahasranama ka paath karein aur kesar ka tilak lagayein.",
      mantra: "ॐ नमो भगवते वासुदेवाय नमः • ॐ क्लीं कृष्णाय नमः"
    };
  }

  // 3. Career, Job & Promotion
  if (
    q.includes("job") || q.includes("career") || q.includes("naukri") ||
    q.includes("promotion") || q.includes("business") || q.includes("vyapar") ||
    q.includes("boss") || q.includes("work") || q.includes("interview")
  ) {
    return {
      text: `${address}, karyakshetra me mehnat ka fal thoda ruk kar milne se pareshan na hon. Dasham Bhaav (10th House) me Surya aur Budh ke yog se aane wale samay me sthirta aayegi. Karobaar aur naukri me naye avsar khulenge, bas apne niyam aur imaandari par dridh rahein.`,
      remedy: "Pratidin suryoday ke samay taambe ke lote se Surya Dev ko arghya dein aur laal chandan ka prayog karein.",
      mantra: "ॐ घृणिः सूर्याय नमः"
    };
  }

  // 4. Wealth, Money & Finance
  if (
    q.includes("dhan") || q.includes("money") || q.includes("paisa") ||
    q.includes("karz") || q.includes("finance") || q.includes("debt") || q.includes("loss")
  ) {
    return {
      text: `${address}, aarthik sthiti ko lekar ghabraane ki zaroorat nahi hai. Dwitiya (Dhan) aur Ekadash (Labh) bhaav me Kuber aur Maa Lakshmi ki kripa banne ke sanket hain. Ruka hua paisa nikalne ke yog hain, parantu kisi bhi anjaan risk ya speculation se bachein.`,
      remedy: "Shukrawaar ke din safed mithai ya kheer ka daan kisi zarooratmand ko karein aur diya jalayein.",
      mantra: "ॐ श्रीं ह्रीं क्लीं श्रीं सिद्ध लक्ष्म्यै नमः"
    };
  }

  // 5. Shani, Sade Sati, Rahu-Ketu, Nazar, Fear, Dosha
  if (
    q.includes("shani") || q.includes("dosh") || q.includes("manglik") ||
    q.includes("sade sati") || q.includes("problem") || q.includes("rahu") || q.includes("ketu")
  ) {
    return {
      text: `${address}, Shani Dev anyay nahi karte, wo karm ke anusaar jeevan ko tarashte hain. Agar Sade Sati ya Rahu ka prabhav hai toh niyamit sadhana se sabhi kasht door ho jate hain. Kisi ka dil na dukhayein aur sewa bhaav rakhein.`,
      remedy: "Shanivaar ki shaam ko peepal ke vriksh ke neeche sarson ke tel ka deepak jalayein aur Hanuman Chalisa ka paath karein.",
      mantra: "ॐ शं शनैश्चराय नमः • ॐ हं हनुमते नमः"
    };
  }

  // 6. Health, Anxiety, Tension, Sleep
  if (
    q.includes("health") || q.includes("sehat") || q.includes("tension") ||
    q.includes("neend") || q.includes("depression") || q.includes("bimaari") || q.includes("dard")
  ) {
    return {
      text: `${address}, sharirik aur mansik ashanti Chandrama (Moon) ke utaar-chadhaav se hoti hai. Bholenath ki upasana se Chandrama balwaan hota hai aur man me shanti aati hai. Doctor ki salah ke sath-sath adhyatmik urja ko banaye rakhein.`,
      remedy: "Somvaar ko Shivling par kachha doodh aur jal arpit karein, aur raat ko sone se pehle thoda dhyan lagayein.",
      mantra: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्"
    };
  }

  // 7. General Inquiry / Casual Conversation
  return {
    text: `${blessing} \n\nBeta, aapne jo poocha: "${userQuery}" — mera yahi prem aur aashirwad hai ki aap sadaiv gyan, sadbuddhi aur dhairya se aage badhein. Agar aapko apni Kundli, vivah, career, parivar ya kisi grah-dasha se juda koi prashna poochna ho, toh bina sankoch ke bataiye!`,
    remedy: "",
    mantra: "",
  };
}

/**
 * Sends a question to the AI Astrologer.
 * 1. Tries high-speed Vercel serverless route (/api/ai/chat)
 * 2. Falls back to Render backend (https://astro-ai-x5c6.onrender.com/api/v1/ai/chat)
 * 3. Falls back to in-house intelligent Vedic human simulation
 */
export async function sendAIAstrologerMessage(
  userQuery: string,
  context?: UserAstrologicalContext,
  conversationHistory?: ChatMessage[]
): Promise<{ text: string; remedy?: string; mantra?: string }> {
  const payload = {
    message: userQuery,
    context: context || {},
    conversationHistory: conversationHistory || [],
  };

  // 1. Try local high-speed Vercel serverless API first (< 1.5s latency, zero cold starts)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return {
          text: data.reply,
          remedy: data.remedy,
          mantra: data.mantra,
        };
      }
    }
  } catch (localErr) {
    console.warn("Local Vercel AI route error/timeout, falling back:", localErr);
  }

  // 2. Try Render live backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/ai/chat` 
      : "https://astro-ai-x5c6.onrender.com/api/v1/ai/chat";

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.reply || data.text)) {
        return {
          text: data.reply || data.text,
          remedy: data.remedy,
          mantra: data.mantra,
        };
      }
    }
  } catch (backendErr) {
    console.warn("Render backend AI route error/timeout:", backendErr);
  }

  // 3. Guaranteed intelligent warm human fallback
  return simulateVedicAstrologerEngine(userQuery, context);
}
