/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Reel Production Planner & 9:16 Visual Timeline Simulator
 * Brand: @unseen_hummannature
 */

window.UHN = window.UHN || {};

UHN.ReelPlanner = (function() {

  /**
   * Safe-Zone validation helper for Instagram Reels (9:16)
   * Top 15% header, bottom 20% caption/audio bar, right 15% like/comment buttons
   */
  function checkSafeZone(text) {
    if (!text || text.trim() === "") {
      return { safe: true, status: "safe", message: "No overlay text" };
    }
    const len = text.trim().length;
    if (len > 70) {
      return {
        safe: false,
        status: "danger",
        message: `Overlay text length (${len} chars) exceeds 70 chars. It will be obstructed by mobile buttons.`
      };
    }
    if (len > 50) {
      return {
        safe: true,
        status: "warning",
        message: `Moderate length (${len} chars). Keep centered in the 9:16 safe zone.`
      };
    }
    return {
      safe: true,
      status: "safe",
      message: `Optimal length (${len} chars). Clean visibility in Instagram 9:16 safe margins.`
    };
  }

  /**
   * Recalculates timestamp ranges when scene durations change
   */
  function recalculateTimelines(scenes) {
    if (!Array.isArray(scenes) || scenes.length === 0) return [];
    let currentSeconds = 0;

    return scenes.map((scene) => {
      const durMatch = (String(scene.duration) || "5s").match(/\d+/);
      const dur = Math.max(1, durMatch ? parseInt(durMatch[0]) : 5);
      const start = currentSeconds;
      const end = currentSeconds + dur;
      currentSeconds = end;
      
      const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
      };

      return {
        ...scene,
        durationSeconds: dur,
        timeRange: `${formatTime(start)}–${formatTime(end)}`,
        duration: `${dur}s`
      };
    });
  }

  /**
   * Calculates total duration of scenes in seconds
   */
  function calculateTotalDuration(scenes) {
    if (!Array.isArray(scenes) || scenes.length === 0) return 0;
    return scenes.reduce((acc, scene) => {
      const durMatch = (String(scene.duration) || "5s").match(/\d+/);
      return acc + (durMatch ? parseInt(durMatch[0]) : 5);
    }, 0);
  }

  /**
   * Proportionally scales scene durations to match target/estimated duration
   */
  function syncTimelineToTarget(scenes, targetSeconds) {
    if (!Array.isArray(scenes) || scenes.length === 0) return scenes;
    const target = Math.max(15, Math.min(90, parseInt(targetSeconds) || 45));
    const currentTotal = calculateTotalDuration(scenes);
    if (currentTotal <= 0) return recalculateTimelines(scenes);

    // Calculate proportional durations
    let remaining = target;
    const updatedScenes = scenes.map((scene, idx) => {
      if (idx === scenes.length - 1) {
        // Last scene takes whatever remainder to ensure exact sum
        const lastDur = Math.max(2, remaining);
        return { ...scene, duration: `${lastDur}s` };
      }
      const durMatch = (String(scene.duration) || "5s").match(/\d+/);
      const curDur = durMatch ? parseInt(durMatch[0]) : 5;
      const scaledDur = Math.max(2, Math.round((curDur / currentTotal) * target));
      remaining -= scaledDur;
      return { ...scene, duration: `${scaledDur}s` };
    });

    return recalculateTimelines(updatedScenes);
  }

  /**
   * Compares estimated duration vs target duration and provides honest feedback
   */
  function evaluatePacing(estimatedSeconds, targetSeconds) {
    const est = Math.max(1, estimatedSeconds || 0);
    const target = parseInt(targetSeconds) || 45;
    const diff = est - target;

    if (diff > 10) {
      return {
        status: "danger",
        badgeClass: "badge-review",
        message: `High Drop-Off Risk: Script runs ~${est}s (${diff}s over ${target}s target). Instagram viewers typically swipe away after 45-50s. Trim ~${Math.round((diff * 135) / 60)} words.`
      };
    } else if (diff > 4) {
      return {
        status: "warning",
        badgeClass: "badge-review",
        message: `Slightly Long: Script runs ~${est}s (+${diff}s vs ${target}s target). Good if tension is maintained.`
      };
    } else if (diff < -8) {
      return {
        status: "warning",
        badgeClass: "badge-review",
        message: `Under Target: Script runs ~${est}s (${Math.abs(diff)}s under ${target}s target). Consider expanding dialogue or adding [PAUSE] for psychological weight.`
      };
    }
    return {
      status: "optimal",
      badgeClass: "badge-published",
      message: `Optimal Reel Pace: ~${est}s aligns with ${target}s target. High audience completion and loop potential.`
    };
  }

  return {
    checkSafeZone,
    recalculateTimelines,
    calculateTotalDuration,
    syncTimelineToTarget,
    evaluatePacing
  };
})();
