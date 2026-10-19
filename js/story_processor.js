/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Story Processing & Episode Division Engine
 * Brand: @unseen_hummannature
 */

window.UHN = window.UHN || {};

UHN.StoryProcessor = (function() {

  /**
   * Cleans text and counts words and reading duration
   */
  function analyzeText(text, wpm = 135) {
    if (!text) return { wordCount: 0, charCount: 0, estimatedSeconds: 0, cleanText: "" };
    // Remove narrator direction markers for accurate spoken word count
    const spokenText = text.replace(/\[(PAUSE|LOWER VOICE|EMPHASIS|WHISPER|SCENE CHANGE|HEAVY BREATH)\]/gi, " ");
    const words = spokenText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    // Add additional pause seconds for [PAUSE] markers
    const pauseMatches = (text.match(/\[PAUSE\]/gi) || []).length;
    const spokenSeconds = Math.round((wordCount / wpm) * 60);
    const estimatedSeconds = spokenSeconds + (pauseMatches * 1);
    
    return {
      wordCount,
      charCount: text.length,
      estimatedSeconds: Math.max(1, estimatedSeconds),
      cleanText: text
    };
  }

  /**
   * Intelligently parses long-form Hindi/Hinglish/English story into episodic narrative arcs
   */
  function processStoryIntoSeries(params) {
    const {
      title,
      rawStory,
      language = "Hinglish",
      category = "Emotional Attachment & Manipulation",
      narrationStyle = "calm_psychological",
      emotionalIntensity = "Moderate & Reflective",
      endingStyle = "Moral Reflection",
      targetDuration = 45,
      episodeCount = "auto",
      sensitivity = "standard",
      wpm = 135
    } = params;

    if (!rawStory || rawStory.trim().length < 20) {
      throw new Error("Story content is too short. Please paste at least a paragraph.");
    }

    // Split story by paragraphs or sentence chunks
    const paragraphs = rawStory
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Determine number of episodes
    let numEpisodes = 5;
    if (episodeCount !== "auto" && !isNaN(parseInt(episodeCount))) {
      numEpisodes = Math.max(2, Math.min(15, parseInt(episodeCount)));
    } else {
      // Auto heuristic based on story length
      const totalWords = rawStory.split(/\s+/).length;
      if (totalWords < 250) numEpisodes = 3;
      else if (totalWords < 550) numEpisodes = 5;
      else if (totalWords < 900) numEpisodes = 7;
      else numEpisodes = 10;
    }

    // Group paragraphs into episode buckets
    const chunks = distributeParagraphs(paragraphs, numEpisodes);
    const generatedEpisodes = [];

    for (let i = 0; i < numEpisodes; i++) {
      const epNum = i + 1;
      const chunkText = chunks[i] || `Episode ${epNum} continuation of ${title}`;
      const ep = generateEpisodeFromChunk({
        epNum,
        totalEpisodes: numEpisodes,
        chunkText,
        title,
        language,
        category,
        narrationStyle,
        emotionalIntensity,
        endingStyle,
        targetDuration,
        wpm
      });
      generatedEpisodes.push(ep);
    }

    // Connect next episode teasers
    for (let i = 0; i < generatedEpisodes.length; i++) {
      if (i < generatedEpisodes.length - 1) {
        generatedEpisodes[i].nextEpisodeTeaser = `Next Part ${i + 2}: "${generatedEpisodes[i + 1].title}" — ${generatedEpisodes[i + 1].theme}.`;
      } else {
        generatedEpisodes[i].nextEpisodeTeaser = `End of series. Follow @unseen_hummannature for upcoming dark psychological stories.`;
      }
    }

    const seriesId = "series_" + Date.now();
    const newSeries = {
      id: seriesId,
      title: title.trim() || "Untitled Psychological Story",
      tagline: `An episodic exploration of ${category.toLowerCase()}.`,
      status: "draft",
      lastModified: new Date().toISOString(),
      language,
      targetAudience: "Young Adults & Psychology Enthusiasts",
      category,
      narrationStyle,
      emotionalIntensity,
      endingStyle,
      targetDuration: parseInt(targetDuration) || 45,
      sourceStorySummary: rawStory, // Complete verbatim source story without silent truncation
      characters: JSON.parse(JSON.stringify(UHN.SampleData.MASTER_SERIES.characters || [])),
      episodes: generatedEpisodes
    };

    return newSeries;
  }

  function distributeParagraphs(paragraphs, count) {
    if (paragraphs.length <= count) {
      // Each paragraph is an episode, pad if needed
      return Array.from({ length: count }, (_, i) => paragraphs[i] || paragraphs[paragraphs.length - 1] || "");
    }
    const result = [];
    const chunkSize = Math.ceil(paragraphs.length / count);
    for (let i = 0; i < count; i++) {
      const slice = paragraphs.slice(i * chunkSize, (i + 1) * chunkSize);
      result.push(slice.join("\n\n"));
    }
    return result;
  }

  /**
   * Generates a single episodic script with all 15 required components
   */
  function generateEpisodeFromChunk({
    epNum,
    totalEpisodes,
    chunkText,
    title,
    language,
    category,
    narrationStyle,
    emotionalIntensity,
    endingStyle,
    targetDuration,
    wpm
  }) {
    // Determine episode thematic role in arc
    let phase = "beginning";
    if (epNum === 1) phase = "hook_setup";
    else if (epNum === totalEpisodes) phase = "resolution_accountability";
    else if (epNum < totalEpisodes * 0.4) phase = "conflict_building";
    else if (epNum < totalEpisodes * 0.7) phase = "turning_point";
    else phase = "consequences";

    const titlesByPhase = {
      hook_setup: ["THE FIRST MASK", "SHADOWS IN THE LIGHT", "THE UNNOTICED SHIFT", "THE INVITATION"],
      conflict_building: ["THE UNSEEN CRACK", "WHISPERS AT MIDNIGHT", "THE INVISIBLE THREAD", "THE STRANGER'S TRUST"],
      turning_point: ["THE TURNING OF TIDES", "THE SILENT WITHDRAWAL", "THE COLD CALCULATION", "THE UNCERTAIN ANSWER"],
      consequences: ["THE ROLE REVERSAL", "BEHIND THE MIRROR", "THE COST OF CONTROL", "THE FIRST LAW"],
      resolution_accountability: ["WHO IS THE VILLAIN?", "THE UNMASKING", "BEYOND THE SHADOWS", "THE REALITY OF CONSCIENCE"]
    };

    const titlePool = titlesByPhase[phase] || ["THE SHADOW STEP"];
    const chosenTitle = titlePool[(epNum - 1) % titlePool.length];

    // Build curated narration script preserving original meaning with markers
    const scriptLines = buildCuratedScript(chunkText, epNum, totalEpisodes, phase, narrationStyle);
    const analysis = analyzeText(scriptLines, wpm);

    // Generate 10 alternative hooks
    const hooks = generate10Hooks(chosenTitle, chunkText, category, phase);
    const primaryHook = hooks[0].text;

    // Generate psychological insight grounded in ethics
    const psychInsight = generatePsychologicalInsight(category, phase);

    // Generate timeline visual plan
    const timelinePlan = generateTimelinePlan(analysis.estimatedSeconds, chosenTitle, scriptLines);

    // Captions & Hashtags
    const captions = {
      short: `${primaryHook.slice(0, 80)}... Part ${epNum} of ${title}.`,
      storytelling: `Jab insaan apne emotions par dhyan nahi deta, toh doosre unka fayda uthane lagte hain. In Part ${epNum} of "${title}", explore the reality behind human behavior.`,
      psychological: `${psychInsight} #UnseenHumanNature explores real behavioural patterns without romanticizing manipulation.`
    };

    return {
      id: `ep_${epNum}_${Date.now()}`,
      number: epNum,
      title: chosenTitle,
      theme: generateEpisodeTheme(phase, category),
      status: "draft",
      targetDuration,
      estimatedDuration: analysis.estimatedSeconds,
      wordCount: analysis.wordCount,
      openingHook: primaryHook,
      narrationScript: scriptLines,
      psychologicalInsight: psychInsight,
      visualDirections: generateVisualDirection(phase),
      onScreenText: `PART ${epNum < 10 ? "0" + epNum : epNum}: ${chosenTitle}`,
      soundDesign: generateSoundDesign(phase),
      transitionInstructions: "Cinematic cut to black, accompanied by low frequency sub-bass strike.",
      endingCliffhanger: generateCliffhanger(phase, endingStyle),
      nextEpisodeTeaser: "", // linked dynamically
      instagramCaptions: captions,
      thoughtProvokingQuestion: generateQuestion(phase),
      callToAction: `Follow @unseen_hummannature for Part ${epNum + 1}. Save this reel to reflect.`,
      hashtags: `#UnseenHumanNature #DarkStories #PsychologicalReels #HumanBehavior #${category.split(" ")[0].replace(/[^a-zA-Z]/g, "")} #Part${epNum}`,
      hooks,
      timelinePlan
    };
  }

  function buildCuratedScript(chunkText, epNum, totalEpisodes, phase, narrationStyle) {
    // Split sentences from chunk
    const sentences = chunkText
      .replace(/([.?!।])\s*(?=[A-Z0-9\u0900-\u097F])/g, "$1|")
      .split("|")
      .map(s => s.trim())
      .filter(s => s.length > 5);

    let baseText = "";
    if (sentences.length >= 3) {
      baseText = sentences.slice(0, 5).join("\n");
    } else {
      baseText = chunkText;
    }

    // Insert natural pacing markers
    let formatted = baseText
      .replace(/\.\s+/g, ".\n[PAUSE]\n")
      .replace(/\?\s+/g, "?\n[PAUSE]\n");

    // Add cinematic opening and psychological close
    if (phase === "hook_setup") {
      formatted = `Duniya sirf wahi dekhti hai jo tum dikhana chahte ho.\n[PAUSE]\n${formatted}\n[LOWER VOICE]\nLekin sawal yeh hai... parde ke peeche kaun hai?\n[WHISPER]`;
    } else if (phase === "resolution_accountability") {
      formatted = `${formatted}\n[PAUSE]\n[LOWER VOICE]\nKhel khatam hone par aaina sabko uska asli chehra dikha hi deta hai.\n[WHISPER]\nYou see the face. We question the person behind it.`;
    } else {
      formatted = `${formatted}\n[PAUSE]\n[LOWER VOICE]\nHar action ke peeche ek anjaan motive chupa hota hai.`;
    }

    return formatted;
  }

  function generateEpisodeTheme(phase, category) {
    const themes = {
      hook_setup: "Loneliness, facade, and the curiosity to observe others.",
      conflict_building: "Vulnerability, initial boundaries, and the allure of validation.",
      turning_point: "Power shift, deliberate pauses, and emotional tension.",
      consequences: "The psychological cost of control versus genuine connection.",
      resolution_accountability: "Self-awareness, moral accountability, and restorative truth."
    };
    return themes[phase] || "Human nature and behavioural dynamics.";
  }

  function generatePsychologicalInsight(category, phase) {
    const insights = {
      hook_setup: "Isolation sharpens observation. When an individual steps out of active participation, they begin analyzing human interactions through an intellectual lens, sometimes mistaking detachment for superior insight.",
      conflict_building: "Radical validation in moments of distress creates rapid rapport. Vulnerable individuals often conflate immediate relief with lifelong trustworthiness, skipping crucial verification steps.",
      turning_point: "Intermittent reinforcement: abrupt silence after constant presence triggers acute anxiety in attached minds. The mind frantically searches for its own fault rather than questioning the other's intent.",
      consequences: "The principle of least interest illustrates that power lies with whoever cares less. Yet exercising that power damages authentic reciprocity, replacing emotional safety with fear of abandonment.",
      resolution_accountability: "Accountability is the antidote to rationalization. Stepping out of psychological games requires acknowledging that vulnerability is courage, whereas exploiting vulnerability is internal weakness."
    };
    return insights[phase] || "Behavioral psychology highlights that human reactions are shaped by past attachments, current insecurities, and the longing for emotional safety.";
  }

  function generateVisualDirection(phase) {
    const directions = {
      hook_setup: "Muted charcoal palette. Distant streetlamps cutting through midnight mist. Tracking shot of a solitary figure walking past glass storefronts reflecting distorted neon.",
      conflict_building: "Intimate dark interior. A warm amber lamp contrasting against cool blue window light. Hands holding a phone, screen glow illuminating weary eyes.",
      turning_point: "Cold cinematic desaturation. Flat overhead angles of an unread notification screen. Shadow stretching across an empty desk, motionless clock ticks.",
      consequences: "High contrast chiaroscuro lighting. Cracked mirror reflections, rain trickling down dark glass panes, silhouette looking out over a silent city skyline.",
      resolution_accountability: "Early dawn breaking into soft charcoal mist. Harsh shadows dissolving into natural morning illumination. Clean symmetrical framing emphasizing dignity and quiet release."
    };
    return directions[phase] || "Cinematic 9:16 vertical framing with low-key lighting and atmospheric depth of field.";
  }

  function generateSoundDesign(phase) {
    const sfx = {
      hook_setup: "Subtle vinyl static, deep 55Hz sub drone, muted footsteps on wet pavement.",
      conflict_building: "Slow cello motif, soft room tone, muffled phone chime with long reverb trail.",
      turning_point: "Clock ticking cadence synchronizing with low heartbeat thud, sudden vacuum silence.",
      consequences: "Harsh metallic drone, bowed bass strings, distant thunder rumble.",
      resolution_accountability: "Warm acoustic piano resolving into gentle major chord, morning bird calls, clean room breath."
    };
    return sfx[phase] || "Atmospheric dark cinematic ambient soundscape.";
  }

  function generateCliffhanger(phase, endingStyle) {
    const cliffhangers = {
      hook_setup: "Lekin kya main waqai observer tha... ya akelepan ne mujhe badal diya tha?",
      conflict_building: "Usne mujhe sachcha samjha... kyunki maine use warn kiya tha.",
      turning_point: "Khamoshi sabse aasan hathiyar hai... kyunki isme koi saboot nahi hota.",
      consequences: "Control paane ke baad jab pata chale ki board par akele ho... toh kya karoge?",
      resolution_accountability: "You see the face. We question the person behind it."
    };
    return cliffhangers[phase] || "Sawal yeh nahi ki kya hua... sawal yeh hai ki kyun hua?";
  }

  function generateQuestion(phase) {
    const questions = {
      hook_setup: "Kya aap bheed mein bhi khud ko akela mehsoos karte hain?",
      conflict_building: "Kya anjaan logon ko dil ka haal batana aasan hota hai?",
      turning_point: "Kya kisi ka achanak chup ho jaana aapko pareshan karta hai?",
      consequences: "Kya rishte mein control paane ki koshish pyaar hai ya insecurity?",
      resolution_accountability: "Kya aap mein apni galti maan kar kisi ko aage badhne dene ki himmat hai?"
    };
    return questions[phase] || "Aap is baare mein kya sochte hain? Share your view below.";
  }

  /**
   * Generates 10 distinct hooks matching the 10 prompt categories
   */
  function generate10Hooks(title, chunkText, category, phase) {
    return [
      {
        category: "psychological_mystery",
        text: "Har insaan ka ek chehra hota hai jo duniya dekhti hai... par parde ke peeche asli roop kaun jaanta hai?"
      },
      {
        category: "unexpected_observation",
        text: "Log kehte hain akelepan se darr lagta hai... par bheed mein fake muskurana usse 10 guna zyada thakata hai."
      },
      {
        category: "emotional_conflict",
        text: "Usne bas itna pucha tha: 'Kya galti meri thi?' Aur mere paas koi jhootha dilasa nahi tha."
      },
      {
        category: "contradiction",
        text: "Hum sab social media par connect hone aate hain, lekin asal mein har koi kisi se bachne ki koshish kar raha hai."
      },
      {
        category: "unanswered_question",
        text: "Agar tumhare saare social masks chheen liye jayein... toh aaine mein kaun bachega?"
      },
      {
        category: "character_revelation",
        text: "Maine logon se dosti chhod di kyunki mujhe unka agla kadam pehle hi dikhne laga tha."
      },
      {
        category: "behavioural_observation",
        text: "Jab koi insaan ghanto phone scroll kare, toh woh entertainment nahi... apne hi khayalon se bhaag raha hota hai."
      },
      {
        category: "story_suspense",
        text: "Us aadhi raat ki conversation ne mere andar ke ek aise darwaaze ko khol diya jise band hona chahiye tha."
      },
      {
        category: "relatable_vulnerability",
        text: "Sabse gehra dard tab hota hai jab tumhe lage ki kisi ke liye tum sirf ek convenient option the."
      },
      {
        category: "reality_check",
        text: "Psychology rules sikha sakti hai, par agar empathy nahi hai toh woh rules sirf khokhle hathiyar hain."
      }
    ];
  }

  /**
   * Generates a timeline plan that perfectly adapts to the actual duration of the script
   */
  function generateTimelinePlan(totalSeconds, title, script) {
    const s = Math.max(25, Math.min(60, totalSeconds));
    const hEnd = 3;
    const s1End = Math.round(s * 0.25);
    const s2End = Math.round(s * 0.55);
    const s3End = Math.round(s * 0.82);

    return [
      {
        timeRange: `00:00–00:0${hEnd}`,
        duration: `${hEnd}s`,
        characterRef: "char_narrator",
        visual: "Pitch black screen. Sharp high-contrast white typography hits center frame with mobile-safe padding.",
        camera: "Static locked frame",
        text: `${title.toUpperCase()}`,
        subtitle: `${title.toUpperCase()}`,
        imagePrompt: `Cinematic typography backdrop, pure charcoal black background, subtle floating dust particles, moody low-key lighting, photorealistic 8k, aspect ratio 9:16 --ar 9:16 --style raw`,
        sfx: "Sub-bass boom (60Hz) impact with clean cutoff",
        transition: "Hard cut to opening scene",
        narrationSync: "Opening Hook (First 3 seconds grab)"
      },
      {
        timeRange: `00:0${hEnd}–00:${s1End < 10 ? "0" + s1End : s1End}`,
        duration: `${s1End - hEnd}s`,
        characterRef: "char_narrator",
        visual: "Cinematic establishing shot: The Narrator in dark oversized hoodie, subtle rain falling on window pane.",
        camera: "Slow lateral tracking dolly (left to right)",
        text: "The Initial Context",
        subtitle: "Observing without participating",
        imagePrompt: `Cinematic 9:16 shot of a 20-year-old South Asian male in oversized charcoal hoodie with silver band ring on right hand, looking out rainy cafe window at midnight, neon reflections on asphalt, photorealistic, 8k --ar 9:16 --style raw`,
        sfx: "Gentle vinyl static and distant rain ambiance",
        transition: "Slow cross dissolve (0.5s)",
        narrationSync: "Core narrative exposition begins"
      },
      {
        timeRange: `00:${s1End < 10 ? "0" + s1End : s1End}–00:${s2End < 10 ? "0" + s2End : s2End}`,
        duration: `${s2End - s1End}s`,
        characterRef: "char_isha",
        visual: "Intimate close-up: Isha in oversized cream cable-knit sweater holding phone, late night warm bedside lamp.",
        camera: "Slow creeping push-in (depth of field rack)",
        text: "Emotional Turning Point",
        subtitle: "A stranger listening in the dark",
        imagePrompt: `Cinematic 9:16 portrait of a 19-year-old South Asian girl in messy hair bun and cream knit sweater, holding glowing smartphone in dark bedroom, warm lamp light, emotional vulnerable expression, photorealistic, 8k --ar 9:16 --style raw`,
        sfx: "Subtle heartbeat tempo rising, low cello swell",
        transition: "Match cut on phone screen glow",
        narrationSync: "Psychological conflict & character dynamic"
      },
      {
        timeRange: `00:${s2End < 10 ? "0" + s2End : s2End}–00:${s3End < 10 ? "0" + s3End : s3End}`,
        duration: `${s3End - s2End}s`,
        characterRef: "both",
        visual: "Split emotional reality: High-contrast silhouette of narrator in cold rain contrasted against warm interior.",
        camera: "Low angle profile rotation",
        text: "The Unspoken Reality",
        subtitle: "Power shifts to whoever cares less",
        imagePrompt: `Cinematic dual-mood composition, moody low-key lighting, chiaroscuro shadows, rainy city window reflections, deep emotional tension, photorealistic, 8k --ar 9:16 --style raw`,
        sfx: "Riser pitch ascending, sudden drop into dead air",
        transition: "Sub-bass hit cut to pure black",
        narrationSync: "Climax of the episode's insight"
      },
      {
        timeRange: `00:${s3End < 10 ? "0" + s3End : s3End}–00:${s < 10 ? "0" + s : s}`,
        duration: `${s - s3End}s`,
        characterRef: "none",
        visual: "Screen cuts to pure charcoal black. Studio emblem and brand tagline emerge in muted silver.",
        camera: "Static with subtle breathing pulse",
        text: "@unseen_hummannature",
        subtitle: "You see the face. We question the person behind it.",
        imagePrompt: `Minimalist dark luxury title card, matte silver metallic emblem on textured obsidian background, restrained red rim light, 8k --ar 9:16 --style raw`,
        sfx: "Resonant signature cinematic note + silence",
        transition: "Fade to black",
        narrationSync: "Final cliffhanger line and call to action"
      }
    ];
  }

  return {
    analyzeText,
    processStoryIntoSeries,
    generateEpisodeFromChunk,
    generate10Hooks,
    generateTimelinePlan
  };
})();
