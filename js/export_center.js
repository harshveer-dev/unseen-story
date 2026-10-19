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
      md += `## 2. CHARACTER CONSISTENCY BIBLE\n\n`;
      series.characters.forEach(char => {
        md += `### ${char.name} (${char.role})\n`;
        md += `- **Physical Appearance:** ${char.physicalAppearance || "N/A"}\n`;
        md += `- **Hair:** ${char.hair || "N/A"} | **Eyes:** ${char.eyeColor || "N/A"} | **Skin:** ${char.skinTone || "N/A"}\n`;
        md += `- **Wardrobe:** ${char.wardrobe || "N/A"}\n`;
        md += `- **Key Accessories:** ${char.accessories || "N/A"}\n`;
        md += `- **Voice Cadence:** ${char.voiceDescription || "N/A"}\n`;
        md += `- **Personality & Traits:** ${char.personality || "N/A"}\n`;
        md += `- **Emotional Range:** ${char.emotionalRange || "N/A"}\n`;
        md += `- **Continuity Restrictions:** ${char.continuityRestrictions || "N/A"}\n`;
        md += `- **AI Generation Prompt:** \`${char.faceReference || ""}\`\n\n`;
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

      md += `#### Psychological Grounding & Ethical Accountability:\n> ${ep.psychologicalInsight}\n\n`;

      md += `#### Cinematic Visual Direction:\n- **Visual Concept:** ${ep.visualDirections}\n- **On-Screen Text:** \`${ep.onScreenText}\`\n- **Sound Design:** ${ep.soundDesign}\n- **Transition:** ${ep.transitionInstructions}\n\n`;

      if (ep.timelinePlan && ep.timelinePlan.length > 0) {
        md += `#### Timestamped 9:16 Visual Timeline & Shot List:\n`;
        md += `| Timestamp | Duration | Character | Visual Concept | Camera | Subtitle / Text | SFX | Transition |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        ep.timelinePlan.forEach(t => {
          const charName = t.characterRef === "char_narrator" ? "Narrator" : t.characterRef === "char_isha" ? "Isha" : t.characterRef === "both" ? "Both" : "Atmospheric";
          md += `| ${t.timeRange} | ${t.duration} | ${charName} | ${t.visual.replace(/\|/g, "/")} | ${t.camera} | ${t.text} | ${t.sfx} | ${t.transition || "Dissolve"} |\n`;
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
    md += `**Est. Duration:** ~${ep.estimatedDuration || 45}s (${ep.wordCount || 0} words) | Target: ${ep.targetDuration || 45}s\n\n`;
    md += `---\n\n`;

    md += `### 1. OPENING HOOK (FIRST 3 SECONDS)\n"${ep.openingHook}"\n\n`;

    md += `### 2. NARRATION SCRIPT\n\`\`\`text\n${ep.narrationScript}\n\`\`\`\n\n`;

    md += `### 3. PSYCHOLOGICAL INSIGHT & ETHICAL GROUNDING\n> ${ep.psychologicalInsight}\n\n`;

    md += `### 4. VISUAL & SOUND SPECIFICATIONS\n`;
    md += `- **Visual Directions:** ${ep.visualDirections}\n`;
    md += `- **On-Screen Text:** ${ep.onScreenText}\n`;
    md += `- **Sound Design:** ${ep.soundDesign}\n`;
    md += `- **Transition:** ${ep.transitionInstructions}\n\n`;

    if (ep.timelinePlan && ep.timelinePlan.length > 0) {
      md += `### 5. TIMESTAMPED 9:16 SHOT LIST & AI IMAGE PROMPTS\n`;
      ep.timelinePlan.forEach((t, idx) => {
        const charName = t.characterRef === "char_narrator" ? "The Narrator" : t.characterRef === "char_isha" ? "Isha" : t.characterRef === "both" ? "The Narrator & Isha" : "Atmospheric Environment";
        md += `#### Scene ${idx + 1}: ${t.timeRange} (${t.duration})\n`;
        md += `- **Character in Frame:** ${charName}\n`;
        md += `- **Visual Concept:** ${t.visual}\n`;
        md += `- **Camera Movement:** ${t.camera}\n`;
        md += `- **On-Screen Subtitle:** "${t.text}"\n`;
        md += `- **Sound Design:** ${t.sfx}\n`;
        md += `- **Transition:** ${t.transition || "Clean cut"}\n`;
        if (t.imagePrompt) {
          md += `- **Midjourney / SDXL Prompt:** \`${t.imagePrompt}\`\n`;
        }
        md += `\n`;
      });
    }

    md += `### 6. INSTAGRAM CAPTION & DISTRIBUTION PACK\n`;
    if (ep.instagramCaptions) {
      md += `**Storytelling Caption:**\n${ep.instagramCaptions.storytelling}\n\n`;
      md += `**Short Caption:**\n${ep.instagramCaptions.short}\n\n`;
    }
    md += `**Discussion Question:** ${ep.thoughtProvokingQuestion}\n\n`;
    md += `**Call To Action:** ${ep.callToAction}\n\n`;
    md += `**Hashtags:** \`${ep.hashtags}\`\n`;

    return md;
  }

  function generateCharacterBibleMarkdown(characters, brand) {
    if (!Array.isArray(characters)) return "";
    let md = `# UNSEEN HUMAN NATURE — CHARACTER BIBLE & VISUAL IDENTITY\n`;
    md += `**Brand:** ${brand ? brand.handle : "@unseen_hummannature"}\n`;
    md += `**Production Rule:** Fictionalized character concepts. Never use the face or identity of a real person without permission.\n\n`;
    md += `---\n\n`;

    characters.forEach(char => {
      md += `## ${char.name.toUpperCase()} (${char.role})\n\n`;
      md += `* **Character ID:** \`${char.id}\`\n`;
      md += `* **Quote:** *"${char.quote || ""}"*\n`;
      md += `* **Physical Appearance:** ${char.physicalAppearance || "N/A"}\n`;
      md += `* **Hair:** ${char.hair || "N/A"}\n`;
      md += `* **Eye Color & Expression:** ${char.eyeColor || "N/A"}\n`;
      md += `* **Skin Tone:** ${char.skinTone || "N/A"}\n`;
      md += `* **Height & Build:** ${char.heightBuild || "N/A"}\n`;
      md += `* **Signature Wardrobe:** ${char.wardrobe || "N/A"}\n`;
      md += `* **Accessories & Visual Anchors:** ${char.accessories || "N/A"}\n`;
      md += `* **Voice Description:** ${char.voiceDescription || "N/A"}\n`;
      md += `* **Personality:** ${char.personality || "N/A"}\n`;
      md += `* **Emotional Range:** ${char.emotionalRange || "N/A"}\n`;
      md += `* **Continuity Restrictions:** ${char.continuityRestrictions || "N/A"}\n\n`;

      md += `### AI Generation Prompt (Midjourney / SDXL):\n\`\`\`text\n${char.faceReference || ""}\n\`\`\`\n\n`;

      if (char.props && char.props.length > 0) {
        md += `### Props & Visual Details:\n`;
        char.props.forEach(p => {
          md += `- **${p.name}:** ${p.desc}\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });

    return md;
  }

  function generateContinuityReportMarkdown(series) {
    if (!series || !window.UHN.ContinuityChecker) return "";
    const audit = UHN.ContinuityChecker.auditSeries(series);
    
    let md = `# UNSEEN HUMAN NATURE — STORY CONTINUITY AUDIT REPORT\n`;
    md += `**Series:** ${series.title}\n`;
    md += `**Overall Continuity Health:** ${audit.overallScore}% / 100%\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
    md += `---\n\n`;

    audit.episodeAudits.forEach(ep => {
      md += `### PART ${ep.episodeNumber < 10 ? "0" + ep.episodeNumber : ep.episodeNumber}: ${ep.title.toUpperCase()} (Health: ${ep.score}%)\n\n`;
      ep.checks.forEach(c => {
        const symbol = c.type === "success" ? "✓" : c.type === "warning" ? "⚠" : "✕";
        md += `* **[${c.classification}] ${symbol} ${c.title}** (${c.category})\n`;
        md += `  - *Detail:* ${c.detail}\n`;
        md += `  - *Action:* ${c.suggestion}\n\n`;
      });
      md += `---\n\n`;
    });

    return md;
  }

  function generateVideoProductionPlanMarkdown(ep, seriesTitle) {
    if (!ep) return "";
    let md = `# SCENE-TO-VIDEO PRODUCTION PLANNER — PART ${ep.number}: ${ep.title.toUpperCase()}\n`;
    md += `**Series:** ${seriesTitle}\n`;
    md += `**Estimated Spoken Runtime:** ~${ep.estimatedDuration || 45} seconds | Target Duration: ${ep.targetDuration || 45}s\n`;
    md += `**Video Canvas:** 9:16 Vertical (1080x1920 @ 30fps)\n\n`;

    md += `## 5-STEP PRODUCTION PIPELINE WORKFLOW:\n`;
    md += `1. **Voice-Over:** Record narration script at ~135 WPM following voice direction tags ([PAUSE], [LOWER VOICE], etc.).\n`;
    md += `2. **Visual Asset Generation:** Render scene prompts using Midjourney v6 (--ar 9:16 --style raw) or SDXL.\n`;
    md += `3. **Assembly:** Import into CapCut / Premiere Pro. Set canvas to 1080x1920. Place audio on track A1.\n`;
    md += `4. **Subtitles & Motion:** Apply slow camera movement (scale 100% to 105%). Add centered high-contrast subtitles within safe zone (avoid top 15% & bottom 20%).\n`;
    md += `5. **Audio Mixing:** Mix dialogue at -6dB, sub-bass 60Hz cue on key transition points, subtle rain ambience at -22dB.\n\n`;

    md += `---\n\n`;
    md += `## SHOT LIST & SCENE BREAKDOWN:\n\n`;

    (ep.timelinePlan || []).forEach((t, i) => {
      const charName = t.characterRef === "char_narrator" ? "The Narrator" : t.characterRef === "char_isha" ? "Isha" : t.characterRef === "both" ? "The Narrator & Isha" : "Atmospheric Environment";
      md += `### SCENE ${i + 1} [${t.timeRange}] (Duration: ${t.duration})\n`;
      md += `- **Character Focus:** ${charName}\n`;
      md += `- **Visual Concept:** ${t.visual}\n`;
      md += `- **Camera Movement:** ${t.camera}\n`;
      md += `- **Subtitle Text:** "${t.text}"\n`;
      md += `- **Sound Design / SFX:** ${t.sfx}\n`;
      md += `- **Scene Transition:** ${t.transition || "Hard cut"}\n`;
      md += `- **AI Generation Prompt:** \`${t.imagePrompt || ""}\`\n\n`;
    });

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
      txt += `Duration: ~${ep.estimatedDuration || 45}s | Target: ${ep.targetDuration || 45}s | Words: ${ep.wordCount || 0}\n`;
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
      txt += `Duration: ~${ep.estimatedDuration || 45}s | Target: ${ep.targetDuration || 45}s | Sound: ${ep.soundDesign}\n`;
      txt += `--------------------------------------------------------\n`;
      if (ep.timelinePlan && ep.timelinePlan.length > 0) {
        ep.timelinePlan.forEach((t, sIdx) => {
          const charName = t.characterRef === "char_narrator" ? "The Narrator" : t.characterRef === "char_isha" ? "Isha" : t.characterRef === "both" ? "Both" : "Atmospheric";
          txt += `[Scene ${sIdx + 1}: ${t.timeRange}] (${t.duration}) - Character: ${charName}\n`;
          txt += `  VISUAL: ${t.visual}\n`;
          txt += `  CAMERA: ${t.camera}\n`;
          txt += `  OVERLAY: ${t.text}\n`;
          txt += `  SFX: ${t.sfx}\n`;
          txt += `  TRANSITION: ${t.transition || "Dissolve"}\n`;
          if (t.imagePrompt) txt += `  AI PROMPT: ${t.imagePrompt}\n`;
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
    generateCharacterBibleMarkdown,
    generateContinuityReportMarkdown,
    generateVideoProductionPlanMarkdown,
    generateAllScriptsText,
    generateAllHooksText,
    generateCaptionsText,
    generateVisualPlansText
  };
})();
