/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Reel Production Planner & 9:16 Visual Timeline Simulator
 * Brand: @unseen_hummannature
 */

window.UHN = window.UHN || {};

UHN.ReelPlanner = (function() {

  /**
   * Safe-Zone validation helper
   */
  function checkSafeZone(text) {
    if (!text) return { safe: true, message: "No overlay text" };
    if (text.length > 70) {
      return { safe: false, message: "Text length may exceed mobile-safe readability. Recommend under 60 chars." };
    }
    return { safe: true, message: "Within Instagram safe margins (high-contrast, centered)" };
  }

  /**
   * Recalculates timestamp ranges when scene durations change
   */
  function recalculateTimelines(scenes) {
    let currentSeconds = 0;
    return scenes.map((scene) => {
      // Parse duration number
      const durMatch = (scene.duration || "5s").match(/\d+/);
      const dur = durMatch ? parseInt(durMatch[0]) : 5;
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
        timeRange: `${formatTime(start)}–${formatTime(end)}`,
        duration: `${dur}s`
      };
    });
  }

  return {
    checkSafeZone,
    recalculateTimelines
  };
})();
