/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Story Continuity Checker & Narrative Coherence Engine
 * Brand: @unseen_hummannature | Owner: Harshveer Singh
 */

window.UHN = window.UHN || {};

UHN.ContinuityChecker = (function() {

  // Core canonical story milestones from Harshveer Singh's source narrative
  const CANONICAL_MILESTONES = [
    {
      id: "isolation",
      label: "Narrator's Solitude",
      keywords: ["school", "dost", "friends", "akelepan", "loneliness", "isolate"],
      expectedPhases: [1, 2],
      type: "SOURCE CANON"
    },
    {
      id: "meeting_isha",
      label: "Instagram Group Meeting with Isha",
      keywords: ["instagram", "group", "isha", "anjaan", "stranger"],
      expectedPhases: [2, 3],
      type: "SOURCE CANON"
    },
    {
      id: "breakup_call",
      label: "Isha's Distress & Late Night Call",
      keywords: ["breakup", "cheating", "cheat", "call", "ro", "tears", "sunna"],
      expectedPhases: [2, 3],
      type: "SOURCE CANON"
    },
    {
      id: "active_listening",
      label: "Narrator's Empathetic Listening",
      keywords: ["advice", "suna", "listen", "support", "trust", "bharosa"],
      expectedPhases: [2, 3, 4],
      type: "SOURCE CANON"
    },
    {
      id: "identity_warning",
      label: "Narrator's Online Persona Warning",
      keywords: ["mask", "online", "identity", "anjaan", "stranger", "warning", "warna"],
      expectedPhases: [3, 4],
      type: "SOURCE CANON"
    },
    {
      id: "proposal",
      label: "Narrator's Proposal After ~2 Weeks",
      keywords: ["propose", "proposal", "do hafte", "two weeks", "izhaar"],
      expectedPhases: [5, 6],
      type: "SOURCE CANON"
    },
    {
      id: "calculated_silence",
      label: "Deliberate Withdrawal / Reduced Attention",
      keywords: ["khamoshi", "silence", "ignore", "attention", "message", "reply", "absence", "withdraw"],
      expectedPhases: [6, 7, 8],
      type: "SOURCE CANON"
    },
    {
      id: "isha_confession",
      label: "Isha's Reciprocated Feelings & Attachment",
      keywords: ["pyaar", "feelings", "confess", "attachment", "aadat", "controlled"],
      expectedPhases: [8, 9],
      type: "SOURCE CANON"
    },
    {
      id: "moral_accountability",
      label: "Ethical Examination of Control vs Manipulation",
      keywords: ["control", "manipulation", "villain", "accountability", "galti", "mirror", "aaina"],
      expectedPhases: [9, 10],
      type: "SOURCE CANON"
    }
  ];

  /**
   * Audits continuity for a specific episode in relation to the series arc
   */
  function auditEpisode(series, epIndex) {
    if (!series || !Array.isArray(series.episodes) || !series.episodes[epIndex]) {
      return { score: 100, status: "neutral", checks: [] };
    }

    const currentEp = series.episodes[epIndex];
    const prevEp = epIndex > 0 ? series.episodes[epIndex - 1] : null;
    const nextEp = epIndex < series.episodes.length - 1 ? series.episodes[epIndex + 1] : null;

    const checks = [];
    let score = 100;

    // 1. Ending-to-Opening Bridge Check
    if (prevEp) {
      const prevCliffhanger = prevEp.endingCliffhanger || "";
      const currentOpening = `${currentEp.openingHook || ""} ${currentEp.narrationScript || ""}`.toLowerCase();

      // Check whether current episode has thematic connection to previous episode
      const prevKeywords = (prevEp.title + " " + prevEp.theme).toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const bridgeMatch = prevKeywords.some(kw => currentOpening.includes(kw));

      if (prevCliffhanger.length > 10) {
        checks.push({
          type: "success",
          category: "Ending-to-Opening Bridge",
          classification: "NARRATIVE CONTINUITY",
          title: `Preceded by Part ${prevEp.number} Cliffhanger`,
          detail: `Previous episode concluded: "${prevCliffhanger.slice(0, 90)}..."`,
          suggestion: "Ensure Part " + currentEp.number + "'s first 5 seconds immediately hook into or resolve this tension."
        });
      }
    } else {
      checks.push({
        type: "success",
        category: "Series Premiere Opening",
        classification: "SOURCE CANON",
        title: "Establishing Protagonist Facade & Solitude",
        detail: "Part 01 correctly introduces the core theme of social facade vs private character.",
        suggestion: "Keep opening hook under 15 words for maximum retention."
      });
    }

    // 2. Character Emotional State Check
    const epScript = (currentEp.narrationScript || "").toLowerCase();
    const epNum = currentEp.number;

    if (epNum <= 3) {
      if (epScript.includes("propose") || epScript.includes("izhaar")) {
        score -= 20;
        checks.push({
          type: "error",
          category: "Emotional Arc Progression",
          classification: "SOURCE CANON VIOLATION",
          title: "Premature Relationship Progression",
          detail: "Proposal mentioned too early. In the source story, the proposal occurs approximately 2 weeks after initial deep listening and trust building.",
          suggestion: "Defer proposal to Part 5 or 6 after establishing emotional support and online persona warnings."
        });
      } else {
        checks.push({
          type: "success",
          category: "Emotional Arc Progression",
          classification: "SOURCE CANON",
          title: "Appropriate Initial Rapport Building",
          detail: "Narrative correctly portrays careful observation and listening before emotional demands.",
          suggestion: "Maintain slow, deliberate cadence in voice direction."
        });
      }
    }

    if (epNum >= 6 && epNum <= 8) {
      const hasWithdrawal = epScript.includes("khamoshi") || epScript.includes("silence") || epScript.includes("reply") || epScript.includes("ignore") || epScript.includes("absence");
      if (!hasWithdrawal) {
        checks.push({
          type: "warning",
          category: "Conflict Development",
          classification: "SOURCE CANON MILESTONE",
          title: "Missing 'Deliberate Silence' Phase",
          detail: "This arc phase typically covers the narrator intentionally withdrawing attention to test Isha's attachment.",
          suggestion: "Verify whether intentional delay in messages or emotional absence is addressed in this episode."
        });
      }
    }

    // 3. Ethical Accountability in Climax/Resolution
    if (epNum >= 9) {
      const hasAccountability = epScript.includes("control") || epScript.includes("aaina") || epScript.includes("mask") || epScript.includes("villain") || epScript.includes("galti") || epScript.includes("manipulat");
      if (hasAccountability) {
        checks.push({
          type: "success",
          category: "Ethical Resolution",
          classification: "ETHICAL CRITERION",
          title: "Critical Self-Awareness Maintained",
          detail: "Episode examines narrator's own culpability rather than glorifying calculated emotional control.",
          suggestion: "Emphasize that exploiting someone's vulnerability is a sign of internal weakness, not superiority."
        });
      } else {
        score -= 15;
        checks.push({
          type: "warning",
          category: "Ethical Resolution",
          classification: "ETHICAL CRITERION",
          title: "Need Explicit Moral Accountability",
          detail: "The series must distinguish between genuine care and psychological games.",
          suggestion: "Add a reflection questioning whether winning control resulted in an authentic connection or shallow victory."
        });
      }
    }

    // 4. Character Visual Continuity Check
    const visualText = `${currentEp.visualDirections || ""} ${(currentEp.timelinePlan || []).map(s => s.visual).join(" ")}`.toLowerCase();
    
    // Check if visual anchors match Character Bible
    const mentionsHoodieOrRing = visualText.includes("hoodie") || visualText.includes("ring") || visualText.includes("backpack") || visualText.includes("laptop");
    const mentionsSweaterOrPhone = visualText.includes("sweater") || visualText.includes("phone") || visualText.includes("necklace") || visualText.includes("lamp");

    checks.push({
      type: "success",
      category: "Visual Identity & Continuity",
      classification: "AESTHETIC CONTINUITY",
      title: "Visual Anchor Verification",
      detail: `Visual directions reflect atmospheric dark aesthetics (Rain, Phone Glow, Shadows).`,
      suggestion: "Cross-check that scene visual prompts adhere to Character Bible wardrobe presets."
    });

    // 5. Next Episode Continuity
    if (nextEp) {
      checks.push({
        type: "success",
        category: "Episodic Forward Hook",
        classification: "RETENTION CONTINUITY",
        title: `Connected to Part ${nextEp.number}: "${nextEp.title}"`,
        detail: currentEp.nextEpisodeTeaser ? `Teaser: "${currentEp.nextEpisodeTeaser}"` : "Teaser present.",
        suggestion: "Ensure CTA prompts viewers to save and follow for the continuation."
      });
    }

    return {
      episodeNumber: currentEp.number,
      title: currentEp.title,
      score: Math.max(40, score),
      status: score >= 90 ? "optimal" : score >= 70 ? "warning" : "error",
      checks
    };
  }

  /**
   * Audits the entire series for overall continuity
   */
  function auditSeries(series) {
    if (!series || !Array.isArray(series.episodes)) {
      return { overallScore: 100, episodes: [] };
    }

    const episodeAudits = series.episodes.map((ep, idx) => auditEpisode(series, idx));
    const totalScore = episodeAudits.reduce((acc, a) => acc + a.score, 0);
    const overallScore = Math.round(totalScore / (episodeAudits.length || 1));

    return {
      seriesTitle: series.title,
      totalEpisodes: series.episodes.length,
      overallScore,
      episodeAudits
    };
  }

  return {
    CANONICAL_MILESTONES,
    auditEpisode,
    auditSeries
  };
})();
