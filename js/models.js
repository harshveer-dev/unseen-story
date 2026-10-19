/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Brand: UNSEEN HUMAN NATURE (@unseen_hummannature)
 * Project Owner: Harshveer Singh
 * Core Data Models & Constants
 */

window.UHN = window.UHN || {};

UHN.Models = {
  BRAND: {
    name: "UNSEEN HUMAN NATURE",
    handle: "@unseen_hummannature",
    tagline: "You see the face. We question the person behind it.",
    owner: "Harshveer Singh",
    primaryHashtag: "#UnseenHumanNature"
  },

  NARRATION_STYLES: [
    { id: "calm_psychological", label: "Calm psychological narrator", desc: "Measured, introspective cadence with deliberate analytical weight." },
    { id: "dark_cinematic", label: "Dark cinematic narrator", desc: "Low-pitch, resonant, mysterious delivery with atmospheric pauses." },
    { id: "investigative", label: "Investigative storyteller", desc: "Probing, questioning tone peeling back layers of human motive." },
    { id: "reflective", label: "Reflective first-person narrator", desc: "Intimate, confessional, self-examining inner monologue." },
    { id: "documentary", label: "Documentary-style narrator", desc: "Objective observational voice balancing facts with behavioral psychology." }
  ],

  EMOTIONAL_INTENSITIES: [
    { id: "subtle", label: "Subtle & Chilling", desc: "Quiet undercurrents, micro-tensions, unspoken discomfort." },
    { id: "moderate", label: "Moderate & Reflective", desc: "Balanced narrative pace allowing psychological concepts to sink in." },
    { id: "intense", label: "Intense & Dramatic", desc: "High stakes, sharp turning points, conflicting motives." },
    { id: "vulnerable", label: "Raw & Vulnerable", desc: "Deep emotional hurt, honesty, heartbreak and detachment." }
  ],

  ENDING_STYLES: [
    { id: "cliffhanger", label: "Haunting Cliffhanger", desc: "Leaves a pressing unanswered question that compels the next watch." },
    { id: "moral", label: "Moral Reflection", desc: "Examines ethical consequences and character accountability." },
    { id: "question", label: "Psychological Question", desc: "Challenges the viewer to reflect on their own relationships." },
    { id: "ambiguity", label: "Open Ambiguity", desc: "Refuses easy answers; explores the grey zones of human intent." },
    { id: "reality_check", label: "Reality Check", desc: "Distinguishes between romanticized control and real human connection." }
  ],

  HOOK_CATEGORIES: [
    { id: "psychological_mystery", label: "Psychological Mystery", desc: "Explores the hidden mechanisms behind why people behave unexpectedly." },
    { id: "unexpected_observation", label: "Unexpected Observation", desc: "Highlights an everyday human quirk that reveals deeper motives." },
    { id: "emotional_conflict", label: "Emotional Conflict", desc: "Captures the tension between wanting closeness and fearing vulnerability." },
    { id: "contradiction", label: "Contradiction", desc: "Juxtaposes what people profess with what they actually execute." },
    { id: "unanswered_question", label: "Unanswered Question", desc: "Poses a direct dilemma that stops the scroller immediately." },
    { id: "character_revelation", label: "Character Revelation", desc: "Unveils a character's true mindset beneath their public facade." },
    { id: "behavioural_observation", label: "Behavioural Observation", desc: "Pinpoints micro-signals like delayed replies, silence, or sudden warmth." },
    { id: "story_suspense", label: "Story-based Suspense", desc: "Pivotal story cliffhook driving straight into the immediate plot." },
    { id: "relatable_vulnerability", label: "Relatable Vulnerability", desc: "Speaks to universal feelings of loneliness, doubt, or overthinking." },
    { id: "reality_check", label: "Reality Check", desc: "Grounds viewers in psychological truth without false promises." }
  ],

  EPISODE_STATUSES: [
    { id: "draft", label: "Draft", color: "#71717a", badgeClass: "badge-draft" },
    { id: "review", label: "Ready for Review", color: "#f59e0b", badgeClass: "badge-review" },
    { id: "production", label: "Ready for Production", color: "#3b82f6", badgeClass: "badge-production" },
    { id: "published", label: "Published", color: "#10b981", badgeClass: "badge-published" }
  ],

  STORY_CATEGORIES: [
    "Emotional Attachment & Detachment",
    "Trust, Doubt & Betrayal",
    "Manipulation & Subtle Control",
    "Loneliness, Solitude & Identity",
    "Online Persona vs Real Character",
    "Heartbreak, Vulnerability & Healing",
    "The Dark Triad & Self-Awareness"
  ],

  VOICE_MARKERS: [
    { tag: "[PAUSE]", label: "Pause (1s)", title: "Insert a 1-second silence for dramatic weight" },
    { tag: "[LOWER VOICE]", label: "Lower Voice", title: "Directs narrator to speak in a hushed, intimate baritone" },
    { tag: "[EMPHASIS]", label: "Emphasis", title: "Stress the following word or phrase with deliberate punch" },
    { tag: "[WHISPER]", label: "Whisper", title: "Near-mic whisper for chilling psychological revelation" },
    { tag: "[SCENE CHANGE]", label: "Scene Change", title: "Pacing break indicating visual transition" },
    { tag: "[HEAVY BREATH]", label: "Breath Pause", title: "Subtle pause capturing emotional weight" }
  ],

  DEFAULT_SETTINGS: {
    wpm: 135,
    targetDuration: 45,
    brandName: "UNSEEN HUMAN NATURE",
    brandHandle: "@unseen_hummannature",
    tagline: "You see the face. We question the person behind it.",
    apiKey: "",
    elevenLabsKey: "",
    defaultLanguage: "Hinglish",
    soundTheme: "dark_cinematic_subtle"
  }
};
