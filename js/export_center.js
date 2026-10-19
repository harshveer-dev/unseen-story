/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Export Center: Markdown, Plain Text & JSON Exporters
 * Brand: @unseen_hummannature
 */

window.UHN = window.UHN || {};

UHN.ExportCenter = (function() {

  function downloadFile(content, filename, contentType = "text/plain;charset=utf-8;") {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function generateSeriesMarkdown(series) {
    if (!series) return "";
    let md = `# UNSEEN HUMAN NATURE — PRODUCTION BIBLE\n`;
    md += `**Series Title:** ${series.title}\n`;
    md += `**Instagram Brand:** ${UHN.Models.BRAND.handle} (${UHN.Models.BRAND.name})\n`;
    md += `**Tagline:** "${UHN.Models.BRAND.tagline}"\n`;
    md += `**Project Owner:** ${UHN.Models.BRAND.owner}\n`;
    md += `**Category:** ${series.category || "Psychological Story"}\n`;
    md += `**Language:** ${series.language || "Hinglish / Hindi"}\n`;
    md += `**Total Episodes:** ${series.episodes ? series.episodes.length : 0}\n`;
    md += `**Export Date:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;

    md += `---\n\n`;
    md += `## 1. STORY SUMMARY & SOURCE CONTEXT\n\n`;
    md += `${series.sourceStorySummary || "No source summary provided."}\n\n`;

    if (series.characters && series.characters.length > 0) {
      md += `## 2. CHARACTER PROFILES\n\n`;
      series.characters.forEach(char => {
        md += `### ${char.name} (${char.role})\n`;
        md += `- **Age:** ${char.age || "N/A"}\n`;
        md += `- **Quote:** *"${char.quote || ""}"*\n`;
        md += `- **Personality:** ${char.personality || ""}\n`;
        md += `- **Likes:** ${char.likes || ""}\n`;
        md += `- **Dislikes:** ${char.dislikes || ""}\n`;
        if (char.props && char.props.length > 0) {
          md += `- **Visual Props & Aesthetic:** ${char.props.map(p => `${p.name}: ${p.desc}`).join(" | ")}\n`;
        }
        md += `\n`;
      });
    }

    md += `---\n\n`;
    md += `## 3. EPISODIC SCRIPTS & PRODUCTION PLANS\n\n`;

    (series.episodes || []).forEach(ep => {
      md += `### PART ${ep.number < 10 ? "0" + ep.number : ep.number}: ${ep.title.toUpperCase()}\n\n`;
      md += `* **Theme:** ${ep.theme}\n`;
      md += `* **Status:** ${ep.status ? ep.status.toUpperCase() : "DRAFT"}\n`;
      md += `* **Target Duration:** ~${ep.estimatedDuration || ep.targetDuration || 45} seconds (${ep.wordCount || 0} words)\n`;
      md += `* **Opening Hook:** "${ep.openingHook}"\n\n`;

      md += `#### Narration Script (Voice-Over Directions):\n\`\`\`text\n${ep.narrationScript}\n\`\`\`\n\n`;

      md += `#### Psychological Grounding:\n> ${ep.psychologicalInsight}\n\n`;

      md += `#### Cinematic Visual Direction:\n- **Visual Concept:** ${ep.visualDirections}\n- **On-Screen Text:** \`${ep.onScreenText}\`\n- **Sound Design:** ${ep.soundDesign}\n- **Transition:** ${ep.transitionInstructions}\n\n`;

      if (ep.timelinePlan && ep.timelinePlan.length > 0) {
        md += `#### Timestamped 9:16 Visual Timeline:\n`;
        md += `| Timestamp | Duration | Visual Concept | Camera Movement | Overlay Text | SFX / Audio Cue |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        ep.timelinePlan.forEach(t => {
          md += `| ${t.timeRange} | ${t.duration} | ${t.visual.replace(/\|/g, "/")} | ${t.camera} | ${t.text} | ${t.sfx} |\n`;
        });
        md += `\n`;
      }

      md += `#### Ending & Continuity:\n- **Cliffhanger:** ${ep.endingCliffhanger}\n- **Next Episode Teaser:** ${ep.nextEpisodeTeaser}\n\n`;

      md += `#### Social Media Package:\n`;
      if (ep.instagramCaptions) {
        md += `- **Short Caption:** ${ep.instagramCaptions.short}\n`;
        md += `- **Storytelling Caption:** ${ep.instagramCaptions.storytelling}\n`;
        md += `- **Psychological Caption:** ${ep.instagramCaptions.psychological}\n`;
      }
      md += `- **Discussion Question:** ${ep.thoughtProvokingQuestion}\n`;
      md += `- **Call To Action:** ${ep.callToAction}\n`;
      md += `- **Hashtags:** \`${ep.hashtags}\`\n\n`;

      md += `---\n\n`;
    });

    return md;
  }

  function generateSingleEpisodeMarkdown(ep, seriesTitle) {
    if (!ep) return "";
    let md = `# UNSEEN HUMAN NATURE — EPISODE PRODUCTION PLAN\n`;
    md += `**Series:** ${seriesTitle || "Psychological Series"}\n`;
    md += `**Episode:** PART ${ep.number < 10 ? "0" + ep.number : ep.number} — ${ep.title}\n`;
    md += `**Instagram Brand:** ${UHN.Models.BRAND.handle}\n`;
    md += `**Est. Duration:** ~${ep.estimatedDuration || 45}s (${ep.wordCount || 0} words)\n\n`;
    md += `---\n\n`;

    md += `### 1. OPENING HOOK (FIRST 3 SECONDS)\n"${ep.openingHook}"\n\n`;

    md += `### 2. NARRATION SCRIPT\n\`\`\`text\n${ep.narrationScript}\n\`\`\`\n\n`;

    md += `### 3. PSYCHOLOGICAL INSIGHT\n> ${ep.psychologicalInsight}\n\n`;

    md += `### 4. VISUAL & SOUND SPECIFICATIONS\n`;
    md += `- **Visual Directions:** ${ep.visualDirections}\n`;
    md += `- **On-Screen Text:** ${ep.onScreenText}\n`;
    md += `- **Sound Design:** ${ep.soundDesign}\n`;
    md += `- **Transition:** ${ep.transitionInstructions}\n\n`;

    if (ep.timelinePlan && ep.timelinePlan.length > 0) {
      md += `### 5. TIMESTAMPED 9:16 TIMELINE\n`;
      ep.timelinePlan.forEach(t => {
        md += `* **${t.timeRange} (${t.duration})**\n  - Visual: ${t.visual}\n  - Camera: ${t.camera}\n  - Overlay Text: "${t.text}"\n  - SFX: ${t.sfx}\n  - Narration: ${t.narrationSync}\n\n`;
      });
    }

    md += `### 6. INSTAGRAM CAPTION & HASHTAGS\n`;
    if (ep.instagramCaptions) {
      md += `**Recommended Caption:**\n${ep.instagramCaptions.storytelling}\n\n`;
    }
    md += `**Discussion Question:**\n${ep.thoughtProvokingQuestion}\n\n`;
    md += `**CTA:**\n${ep.callToAction}\n\n`;
    md += `**Hashtags:**\n${ep.hashtags}\n`;

    return md;
  }

  function generateAllScriptsText(series) {
    if (!series || !series.episodes) return "";
    let txt = `UNSEEN HUMAN NATURE (@unseen_hummannature)\n`;
    txt += `TELEPROMPTER NARRATION SCRIPTS — ${series.title}\n`;
    txt += `========================================================\n\n`;

    series.episodes.forEach(ep => {
      txt += `--------------------------------------------------------\n`;
      txt += `PART ${ep.number < 10 ? "0" + ep.number : ep.number}: ${ep.title.toUpperCase()}\n`;
      txt += `Duration: ~${ep.estimatedDuration || 45}s | Words: ${ep.wordCount || 0} | Status: ${ep.status}\n`;
      txt += `--------------------------------------------------------\n`;
      txt += `HOOK:\n"${ep.openingHook}"\n\n`;
      txt += `NARRATION SCRIPT:\n${ep.narrationScript}\n\n`;
      txt += `CLIFFHANGER:\n${ep.endingCliffhanger}\n\n`;
    });

    return txt;
  }

  function generateAllHooksText(series) {
    if (!series || !series.episodes) return "";
    let txt = `UNSEEN HUMAN NATURE (@unseen_hummannature)\n`;
    txt += `COMPLETE HOOK DATABASE & CONTENT CALENDAR — ${series.title}\n`;
    txt += `========================================================\n\n`;

    series.episodes.forEach(ep => {
      txt += `PART ${ep.number < 10 ? "0" + ep.number : ep.number}: ${ep.title.toUpperCase()} (${ep.theme})\n`;
      txt += `Selected Hook: "${ep.openingHook}"\n\n`;
      txt += `Alternative Hooks (10 Categories):\n`;
      if (ep.hooks && ep.hooks.length > 0) {
        ep.hooks.forEach((h, idx) => {
          txt += `  ${idx + 1}. [${h.category.replace(/_/g, " ").toUpperCase()}]: "${h.text}"\n`;
        });
      }
      txt += `\n--------------------------------------------------------\n\n`;
    });

    return txt;
  }

  function generateCaptionsText(series) {
    if (!series || !series.episodes) return "";
    let txt = `UNSEEN HUMAN NATURE (@unseen_hummannature)\n`;
    txt += `INSTAGRAM CAPTION PACK — ${series.title}\n`;
    txt += `========================================================\n\n`;

    series.episodes.forEach(ep => {
      txt += `PART ${ep.number < 10 ? "0" + ep.number : ep.number}: ${ep.title.toUpperCase()}\n`;
      txt += `--------------------------------------------------------\n`;
      txt += `OPTION 1 (SHORT & PUNCHY):\n${ep.instagramCaptions ? ep.instagramCaptions.short : ""}\n\n`;
      txt += `OPTION 2 (DEEP STORYTELLING):\n${ep.instagramCaptions ? ep.instagramCaptions.storytelling : ""}\n\n`;
      txt += `OPTION 3 (PSYCHOLOGICAL REFLECTION):\n${ep.instagramCaptions ? ep.instagramCaptions.psychological : ""}\n\n`;
      txt += `QUESTION FOR COMMENTS:\n${ep.thoughtProvokingQuestion}\n\n`;
      txt += `CALL TO ACTION:\n${ep.callToAction}\n\n`;
      txt += `HASHTAGS:\n${ep.hashtags}\n\n`;
      txt += `========================================================\n\n`;
    });

    return txt;
  }

  function generateVisualPlansText(series) {
    if (!series || !series.episodes) return "";
    let txt = `UNSEEN HUMAN NATURE (@unseen_hummannature)\n`;
    txt += `DIRECTOR'S TIMESTAMPED SHOT LIST & 9:16 VISUAL PLANS — ${series.title}\n`;
    txt += `========================================================\n\n`;

    series.episodes.forEach(ep => {
      txt += `PART ${ep.number < 10 ? "0" + ep.number : ep.number}: ${ep.title.toUpperCase()}\n`;
      txt += `Duration: ~${ep.estimatedDuration || 45}s | Sound: ${ep.soundDesign}\n`;
      txt += `--------------------------------------------------------\n`;
      if (ep.timelinePlan && ep.timelinePlan.length > 0) {
        ep.timelinePlan.forEach(t => {
          txt += `[${t.timeRange}] (${t.duration})\n`;
          txt += `  VISUAL: ${t.visual}\n`;
          txt += `  CAMERA: ${t.camera}\n`;
          txt += `  TEXT OVERLAY: ${t.text}\n`;
          txt += `  SFX: ${t.sfx}\n`;
          txt += `  SYNC: ${t.narrationSync}\n\n`;
        });
      }
      txt += `\n`;
    });

    return txt;
  }

  return {
    downloadFile,
    generateSeriesMarkdown,
    generateSingleEpisodeMarkdown,
    generateAllScriptsText,
    generateAllHooksText,
    generateCaptionsText,
    generateVisualPlansText
  };
})();
