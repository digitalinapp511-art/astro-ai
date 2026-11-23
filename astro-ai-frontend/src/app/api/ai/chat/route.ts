import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Authentic Intelligent Vedic Astrologer Engine (Warm, Human Fallback)
function getIntelligentHumanFallback(query: string, context: any) {
  const q = query.toLowerCase().trim();
  const userName = context?.name || "Seeker";
  const astroName = context?.astrologerName || "Maa Gayatri Devi";
  const isMaa = astroName.toLowerCase().includes("gayatri") || astroName.toLowerCase().includes("maa");
  const isAcharya = astroName.toLowerCase().includes("vidyadhar") || astroName.toLowerCase().includes("acharya");
  const isAnanya = astroName.toLowerCase().includes("ananya");
  const isRadhey = astroName.toLowerCase().includes("radhe");

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

  // 2. Marriage, Love, Relationship, Delay
  if (
    q.includes("shaadi") || q.includes("marriage") || q.includes("vivah") ||
    q.includes("love") || q.includes("pyaar") || q.includes("rishta") ||
    q.includes("breakup") || q.includes("patni") || q.includes("pati") || q.includes("partner")
  ) {
    return {
      reply: `${address}, vivah aur rishton ke maamle me chinta mat kijiye. Janam Kundli ke Saptam Bhaav (7th House) par Brihaspati aur Shukra ke transit ke kaaran thoda vilamb ya man-mutaav dikh raha hai, parantu aane wale 3 se 6 mahino me anukool yog prabal ho rahe hain. Dhyan rakhein ki baat-cheet me krodh aur jaldbaazi se bachein.`,
      remedy: "Guruwaar (Thursday) ke din peele vastra dharan karein, Vishnu Sahasranama ya Brihaspati kavach ka smaran karein aur kesar ka tilak lagayein.",
      mantra: "ॐ नमो भगवते वासुदेवाय नमः • ॐ क्लीं कृष्णाय नमः",
    };
  }

  // 3. Career, Job, Promotion, Business
  if (
    q.includes("job") || q.includes("naukri") || q.includes("career") ||
    q.includes("promotion") || q.includes("business") || q.includes("vyapar") ||
    q.includes("boss") || q.includes("work") || q.includes("interview")
  ) {
    return {
      reply: `${address}, karyakshetra me mehnat ka fal thoda ruk kar milne se pareshan na hon. Dasham Bhaav (10th House) me Surya aur Budh ke yog se aane wale samay me sthirta aayegi. Karobaar aur naukri me naye avsar khulenge, bas apne niyam aur imaandari par dridh rahein.`,
      remedy: "Pratidin suryoday ke samay taambe ke lote se Surya Dev ko arghya dein, jisme thoda laal chandan aur akshat daalein.",
      mantra: "ॐ घृणिः सूर्याय नमः",
    };
  }

  // 4. Money, Debt, Finance, Property
  if (
    q.includes("money") || q.includes("paisa") || q.includes("dhan") ||
    q.includes("karz") || q.includes("debt") || q.includes("property") || q.includes("loss")
  ) {
    return {
      reply: `${address}, aarthik sthiti ko lekar ghabraane ki zaroorat nahi hai. Dwitiya (Dhan) aur Ekadash (Labh) bhaav me Kuber aur Maa Lakshmi ki kripa banne ke sanket hain. Ruka hua paisa nikalne ke yog hain, parantu kisi bhi anjaan risk ya speculation se bachein.`,
      remedy: "Shukrawar ko safed kheer ya mithai zarooratmand ko dein aur ghar ki tijori Uttar (North) disha me rakhein.",
      mantra: "ॐ श्रीं ह्रीं क्लीं श्रीं सिद्ध लक्ष्म्यै नमः",
    };
  }

  // 5. Shani, Sade Sati, Rahu-Ketu, Nazar, Fear, Dosha
  if (
    q.includes("shani") || q.includes("sade sati") || q.includes("dhayya") ||
    q.includes("rahu") || q.includes("ketu") || q.includes("nazar") ||
    q.includes("dosh") || q.includes("manglik") || q.includes("dar")
  ) {
    return {
      reply: `${address}, Shani Dev anyay nahi karte, wo karm ke anusaar jeevan ko tarashte hain. Agar Sade Sati ya Rahu ka prabhav hai toh niyamit sadhana se sabhi kasht door ho jate hain. Kisi ka dil na dukhayein aur sewa bhaav rakhein.`,
      remedy: "Shanivaar ki shaam suryast ke baad peepal ke ped ke paas sarson ke tel ka deepak jalayein aur Hanuman Chalisa ka paath karein.",
      mantra: "ॐ शं शनैश्चराय नमः • ॐ हं हनुमते नमः",
    };
  }

  // 6. Health, Anxiety, Tension, Sleep
  if (
    q.includes("health") || q.includes("sehat") || q.includes("tension") ||
    q.includes("neend") || q.includes("depression") || q.includes("bimaari") || q.includes("dard")
  ) {
    return {
      reply: `${address}, sharirik aur mansik ashanti Chandrama (Moon) ke utaar-chadhaav se hoti hai. Bholenath ki upasana se Chandrama balwaan hota hai aur man me shanti aati hai. Doctor ki salah ke sath-sath adhyatmik urja ko banaye rakhein.`,
      remedy: "Somvaar ko Shivling par kachha doodh aur jal arpit karein, aur raat ko sone se pehle thoda dhyan lagayein.",
      mantra: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्",
    };
  }

  // 7. General Human Astrologer Response
  return {
    reply: `${blessing} \n\nAapke dwara poochi gayi baat par grah-gochar ka aakalan karne par aane wala samay dhyan aur dhairya se aage badhne ka sanket de raha hai. Devguru Brihaspati ka aashirwad aapke chart par shubh fal dega. Apne lakshya par bharosa rakhein.`,
    remedy: "Pratidin subah mata-pita ka aashirwad lein aur Gayatri Mantra ka 11 baar shant man se jaap karein.",
    mantra: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message?.trim();
    const context = body.context || {};
    const history = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Kripya apna sawaal likhein!" },
        { status: 400 }
      );
    }

    const astroName = context.astrologerName || "Maa Gayatri Devi";
    const astroTitle = context.title || "Senior Vedic Astrologer";
    const astroSpecialty = context.specialty || "Vedic Kundli & Dosha Shanti";
    const userName = context.name || "Seeker";

    // Format previous conversation turns if provided
    let conversationText = "";
    if (history.length > 0) {
      conversationText = "\n\nPrevious Conversation Context:\n" + history
        .slice(-6)
        .map((h: any) => `${h.sender === "user" ? userName : astroName}: ${h.text}`)
        .join("\n");
    }

    const systemPrompt = `You are ${astroName} (${astroTitle}), a revered, authentic, deeply caring Indian Vedic Astrologer on AstroAI (Specialty: ${astroSpecialty}).
The user (${userName}) is chatting with you: "${message}".
${conversationText}

Core Guidelines for Truly Human-Like Vedic Consultation:
1. Speak warmly, respectfully, compassionately and naturally like a wise elder Indian astrologer in conversational Hindi / Hinglish (as if chatting on WhatsApp or phone).
2. If the user greeted you (e.g., "ram ram", "namaste", "pranam", "jai mata di", "radhe radhe", "hello"):
   - Greet them back with heartfelt warmth and blessings (e.g. "Ram Ram beta! Kalyan ho, khush raho...").
   - Ask gently what is in their heart today regarding their Kundli, career, love, marriage, health, or family.
   - Leave "remedy" and "mantra" empty for simple greetings; do NOT give unprompted heavy remedies.
3. If they asked a life question (career, marriage, relationship, breakup, money, debt, health, anxiety, dosha):
   - First empathize with their emotions like an affectionate elder mentor.
   - Give direct, personalized astrological insight referencing relevant planetary energies (Shani, Guru/Brihaspati, Rahu-Ketu, Surya, Chandrama, 7th/10th house, Dasha).
   - Provide 1 practical, easy Vedic Upay (remedy).
   - Provide 1 authentic Sanskrit Mantra in Devanagari script.
4. Keep the response natural, conversational, and direct (2 to 4 sentences). Never sound robotic or like a template.

You MUST respond strictly in valid JSON format:
{
  "reply": "Conversational human response as ${astroName}",
  "remedy": "Practical Vedic remedy if question asked, else empty string",
  "mantra": "Mantra if question asked, else empty string"
}`;

    const candidateModels = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-flash-latest"];

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`[Gemini AI] ${model} returned ${response.status}`);
          continue;
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        let parsed: any;
        try {
          parsed = JSON.parse(rawText.trim());
        } catch (e) {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
        }

        if (parsed && parsed.reply) {
          return NextResponse.json({
            success: true,
            reply: parsed.reply,
            remedy: parsed.remedy || "",
            mantra: parsed.mantra || "",
            source: `Google Gemini AI (${model})`,
          });
        }
      } catch (err: any) {
        console.warn(`[Gemini AI] Model ${model} error:`, err.message);
      }
    }

    // Intelligent Vedic Engine Fallback (guaranteed warm human reply)
    const fallback = getIntelligentHumanFallback(message, context);
    return NextResponse.json({
      success: true,
      reply: fallback.reply,
      remedy: fallback.remedy,
      mantra: fallback.mantra,
      source: "AstroAI Vedic Engine",
    });
  } catch (error: any) {
    console.error("[AI Chat API Exception]", error);
    const fallback = getIntelligentHumanFallback("pranam", {});
    return NextResponse.json({
      success: true,
      reply: fallback.reply,
      remedy: fallback.remedy,
      mantra: fallback.mantra,
      source: "AstroAI Resilient Engine",
    });
  }
}
