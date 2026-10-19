/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Voice-Over Studio: Pacing, Timing, Direction Markers & Web Speech Engine
 * Brand: @unseen_hummannature
 */

window.UHN = window.UHN || {};

UHN.VoiceStudio = (function() {
  let synth = window.speechSynthesis;
  let currentUtterance = null;
  let isPlaying = false;
  let onHighlightCallback = null;

  function insertMarker(textarea, marker) {
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const val = textarea.value;
    
    // Add spaces/newlines around marker for clean pacing
    const toInsert = `\n${marker}\n`;
    textarea.value = val.substring(0, start) + toInsert + val.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + toInsert.length;
    textarea.focus();
    // Dispatch input event so live listeners update
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function getCleanSpokenText(script) {
    if (!script) return "";
    return script
      .replace(/\[(PAUSE|LOWER VOICE|EMPHASIS|WHISPER|SCENE CHANGE|HEAVY BREATH)\]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function splitIntoSentences(script) {
    if (!script) return [];
    const lines = script.split("\n");
    const blocks = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      const isMarker = /^\[(PAUSE|LOWER VOICE|EMPHASIS|WHISPER|SCENE CHANGE|HEAVY BREATH)\]$/i.test(trimmed);
      if (isMarker) {
        blocks.push({
          type: "marker",
          text: trimmed,
          markerType: trimmed.replace(/[\[\]]/g, "").toUpperCase()
        });
      } else {
        // Spoken line: break into sentences
        const parts = trimmed.match(/[^.?!।]+[.?!।]*/g) || [trimmed];
        parts.forEach(p => {
          const pt = p.trim();
          if (pt) {
            const wordCount = pt.split(/\s+/).length;
            blocks.push({
              type: "spoken",
              text: pt,
              wordCount
            });
          }
        });
      }
    });

    return blocks;
  }

  function getAvailableVoices() {
    if (!synth) return [];
    return synth.getVoices();
  }

  function playPreview(script, wpm = 135, onProgress, onEnd) {
    stopPreview();
    if (!synth) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    const cleanText = getCleanSpokenText(script);
    if (!cleanText) return;

    // Rate: Web Speech rate 1.0 is ~150-160 WPM. Convert wpm to rate:
    const rate = Math.max(0.6, Math.min(1.8, wpm / 140));

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.rate = rate;
    currentUtterance.pitch = 0.95; // slightly lower pitch for dark narrator vibe

    // Attempt to pick an appropriate Hindi / Indian English / deep voice
    const voices = synth.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith("hi") || v.name.toLowerCase().includes("india"));
    const englishVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("David") || v.name.includes("Natural") || v.name.includes("Male")));
    
    if (hindiVoice) {
      currentUtterance.voice = hindiVoice;
    } else if (englishVoice) {
      currentUtterance.voice = englishVoice;
    }

    currentUtterance.onboundary = function(e) {
      if (e.name === "word" || e.name === "sentence") {
        if (onProgress) onProgress(e.charIndex, cleanText);
      }
    };

    currentUtterance.onend = function() {
      isPlaying = false;
      if (onEnd) onEnd();
    };

    currentUtterance.onerror = function(err) {
      console.warn("Speech synthesis notice:", err);
      isPlaying = false;
      if (onEnd) onEnd();
    };

    isPlaying = true;
    synth.speak(currentUtterance);
  }

  function pausePreview() {
    if (synth && isPlaying) {
      synth.pause();
    }
  }

  function resumePreview() {
    if (synth && synth.paused) {
      synth.resume();
    }
  }

  function stopPreview() {
    if (synth) {
      synth.cancel();
    }
    isPlaying = false;
  }

  return {
    insertMarker,
    getCleanSpokenText,
    splitIntoSentences,
    getAvailableVoices,
    playPreview,
    pausePreview,
    resumePreview,
    stopPreview,
    isPlaying: () => isPlaying
  };
})();
