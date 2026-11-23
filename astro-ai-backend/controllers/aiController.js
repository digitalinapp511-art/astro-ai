// AI Astrologer Vedic Analysis & Live Google Gemini AI Controller
import dns from "dns";

// Ensure reliable DNS resolution for Google API
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

// Intelligent Authentic Vedic Astrologer Engine (Warm, Human Fallback)
export const getVedicAnalysisFallback = (query, context = {}) => {
  const q = (query || "").toLowerCase().trim();
  const userName = context?.name || "Seeker";
  const astroName = context?.astrologerName || "Maa Gayatri Devi";
  const isMaa = astroName.toLowerCase().includes("gayatri") || astroName.toLowerCase().includes("maa");
  const isAcharya = astroName.toLowerCase().includes("vidyadhar") || astroName.toLowerCase().includes("acharya");
  const isAnanya = astroName.toLowerCase().includes("ananya");

  const address = isMaa ? "Beta" : (userName !== "Seeker" ? userName : "Bhakta");
  const blessing = isMaa ? "Kalyan ho beta, sada khush raho! Maa Gayatri ka aashirwad hamesha tumhare sath hai." 
    : isAcharya ? `Pranam ${userName}! Bhagwan Ganesh aur Devguru Brihaspati ka aashirwad aap par bana rahe.`
    : isAnanya ? `Namaste ${userName}! Prem aur vishwas hi jeevan ki sabse badi shakti hai.`
    : `Hari Om ${userName}! Surya Dev ki kripa se aapka jeevan tejomay ho.`;

  // 1. Greetings (Ram Ram, Pranam, Namaste, Jai Mata Di, etc.)
  if (
    q.includes("ram ram") || q.includes("pranam") || q.includes("namaste") ||
    q.includes("jai mata di") || q.includes("radhe radhe") || q.includes("hari om") ||
    q.includes("jai shree ram") || q.includes("har har mahadev") || q.includes("hello") ||
    q.includes("hi") || q === "mata ji" || q === "pandit ji" || q === "guruji"
  ) {
    return {
      reply: `${blessing} \n\nKahiye ${address}, aaj aapke man me kya prashna ya chinta hai? Chahe shaadi, career, dhan, parivar ya kisi grah dosha se judi baat ho—aap bina kisi sankoch ke mujhse khul kar pooch sakte hain.`,
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
      reply: `${address}, vivah aur rishton ke maamle me chinta mat kijiye. Janam Kundli ke Saptam Bhaav (7th House) par Brihaspati aur Shukra ke transit ke kaaran thoda vilamb ya man-mutaav dikh raha hai, parantu aane wale 3 se 6 mahino me anukool yog prabal ho rahe hain. Dhyan rakhein ki baat-cheet me krodh aur jaldbaazi se bachein.`,
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
      reply: `${address}, karyakshetra me mehnat ka fal thoda ruk kar milne se pareshan na hon. Dasham Bhaav (10th House) me Surya aur Budh ke yog se aane wale samay me sthirta aayegi. Karobaar aur naukri me naye avsar khulenge, bas apne niyam aur imaandari par dridh rahein.`,
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
      reply: `${address}, aarthik sthiti ko lekar ghabraane ki zaroorat nahi hai. Dwitiya (Dhan) aur Ekadash (Labh) bhaav me Kuber aur Maa Lakshmi ki kripa banne ke sanket hain. Ruka hua paisa nikalne ke yog hain, parantu kisi bhi anjaan risk ya speculation se bachein.`,
      remedy: "Shukrawaar ke din safed mithai ya kheer ka daan kisi zarooratmand ko karein aur diya jalayein.",
      mantra: "ॐ श्रीं ह्रीं क्लीं श्रीं सिद्ध लक्ष्म्यै नमः"
    };
  }

  // 5. Shani, Sade Sati & Dosha
  if (
    q.includes("shani") || q.includes("dosh") || q.includes("manglik") ||
    q.includes("sade sati") || q.includes("problem") || q.includes("rahu") || q.includes("ketu")
  ) {
    return {
      reply: `${address}, Shani Dev anyay nahi karte, wo karm ke anusaar jeevan ko tarashte hain. Agar Sade Sati ya Rahu ka prabhav hai toh niyamit sadhana se sabhi kasht door ho jate hain. Kisi ka dil na dukhayein aur sewa bhaav rakhein.`,
      remedy: "Shanivaar ki shaam ko peepal ke vriksh ke neeche sarson ke tel ka deepak jalayein aur Hanuman Chalisa ka paath karein.",
      mantra: "ॐ शं शनैश्चराय नमः • ॐ हं हनुमते नमः"
    };
  }

  // 6. General Human Vedic Blessing
  return {
    reply: `${blessing} \n\nAapke dwara poochi gayi baat par grah-gochar ka aakalan karne par aane wala samay dhyan aur dhairya se aage badhne ka sanket de raha hai. Devguru Brihaspati ka aashirwad aapke chart par shubh fal dega. Apne lakshya par bharosa rakhein.`,
    remedy: "Pratidin subah mata-pita ka aashirwad lein aur Gayatri Mantra ka 11 baar shant man se jaap karein.",
    mantra: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्"
  };
};

// Call Google Gemini Live AI with structured Vedic Astrologer Prompt and Auto-Model Fallback
async function askGoogleGemini(query, context = {}, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ];

  const astroName = context.astrologerName || "Maa Gayatri Devi";
  const astroSpecialty = context.specialty || context.astrologerSpecialty || "Vedic Kundli & Graha Shanti";
  const astroTitle = context.title || "Senior Vedic Astrologer";
  const userName = context.name || "Seeker";

  let conversationText = "";
  if (Array.isArray(history) && history.length > 0) {
    conversationText = "\n\nPrevious Conversation History:\n" + history
      .slice(-6)
      .map((h) => `${h.sender === "user" ? userName : astroName}: ${h.text}`)
      .join("\n");
  }

  const prompt = `You are AstroAI's revered master astrologer: ${astroName} (${astroTitle}), specialist in ${astroSpecialty}.
The user (${userName}) is asking: "${query}".
${conversationText}

Core Guidelines for Natural Human-Like Astrologer Consultation:
1. Speak warmly, respectfully and lovingly like a real human Indian astrologer in conversational Hindi / Hinglish (just like talking on WhatsApp or phone).
2. If the user greeted you (e.g. "ram ram", "namaste", "pranam", "jai mata di", "radhe radhe", "hello", "hi"):
   - Greet them back with heartfelt blessings ("Ram Ram beta! Kalyan ho, sada khush raho. Maa Gayatri ka aashirwad hamesha tumhare sath hai...").
   - Ask gently what is on their mind today regarding their Kundli, life, career, marriage or dosha.
   - Leave "remedy" and "mantra" empty for simple greetings; do NOT give unasked heavy remedies.
3. If they ask a real life or astrology question:
   - Empathize with their struggle first like an elder guide.
   - Give personalized astrological insight (planets like Shani, Guru, Rahu, Mangal, Surya, Chandrama, 7th/10th house).
   - Provide 1 practical, easy Vedic Upay (remedy).
   - Provide 1 authentic Sanskrit Mantra in Devanagari script.
4. Keep the tone compassionate, conversational, and direct (2 to 4 sentences). Never sound robotic.

Respond strictly in valid JSON format:
{
  "reply": "Conversational human response speaking directly to ${userName} as ${astroName}",
  "remedy": "Practical Vedic remedy if question asked, else empty string",
  "mantra": "Mantra if question asked, else empty string"
}`;

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`⚠️  [Gemini AI] Model ${model} returned status:`, response.status);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      let parsed;
      try {
        parsed = JSON.parse(rawText.trim());
      } catch (parseErr) {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (parsed && parsed.reply) {
        return {
          reply: parsed.reply,
          remedy: parsed.remedy || "",
          mantra: parsed.mantra || "",
          source: `Google Gemini AI (${model})`,
        };
      }
    } catch (err) {
      console.warn(`⚠️  [Gemini AI] Error with model ${model}:`, err.message);
    }
  }

  return null;
}

export const chatWithAIAstrologer = async (req, res) => {
  const { message, context, conversationHistory } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Kripya apna sawaal likhein!"
    });
  }

  // 1. Try Live Google Gemini AI First (with model fallback)
  let analysis = await askGoogleGemini(message, context, conversationHistory);

  // 2. Fallback to In-house Intelligent Vedic Engine if Gemini API is unreachable
  if (!analysis) {
    analysis = getVedicAnalysisFallback(message, context);
    analysis.source = "AstroAI Vedic Engine";
  }

  console.log(`🤖 [AI Astrologer] Answered query "${message.substring(0, 30)}..." via ${analysis.source}`);

  res.json({
    success: true,
    reply: analysis.reply,
    remedy: analysis.remedy,
    mantra: analysis.mantra,
    source: analysis.source,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    remainingFreeQuestions: 5
  });
};
