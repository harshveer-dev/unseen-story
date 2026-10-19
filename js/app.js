/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Main Application Coordinator & Interactive UI Controller
 * Brand: @unseen_hummannature | Owner: Harshveer Singh
 */

window.UHN = window.UHN || {};

UHN.App = (function() {
  let activeTab = "bible";
  let activeSeries = null;
  let activeEpisodeIndex = 0;
  
  // Simulator State
  let simInterval = null;
  let simCurrentTime = 0;
  let simDuration = 45;
  let simIsPlaying = false;
  let simShowIG = true;
  let simShowSafe = false;

  // Voice Studio State
  let voiceCurrentWpm = 135;
  let voiceFontSize = 22;
  let voiceSentences = [];
  let voiceActiveIndex = -1;

  function init() {
    UHN.Storage.init();
    activeSeries = UHN.Storage.getActiveSeries();
    
    // Ensure we have an active series
    if (!activeSeries || !activeSeries.episodes || activeSeries.episodes.length === 0) {
      UHN.Storage.resetDefaults();
      activeSeries = UHN.Storage.getActiveSeries();
    }

    const settings = UHN.Storage.getSettings();
    voiceCurrentWpm = settings.wpm || 135;

    renderHeader();
    setupNavigation();
    setupModals();
    setupSimulatorEvents();
    setupVoiceStudioEvents();
    setupStoryIngestionEvents();
    setupExportEvents();

    // Listen to storage events
    window.addEventListener("uhn:saved", () => {
      renderHeader();
      updateSidebarList();
    });

    window.addEventListener("uhn:seriesChanged", (e) => {
      activeSeries = UHN.Storage.getSeries(e.detail.id) || UHN.Storage.getActiveSeries();
      activeEpisodeIndex = 0;
      renderHeader();
      renderCurrentTab();
      showToast("Loaded series: " + activeSeries.title);
    });

    // Populate system voices once speech synthesis is ready
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoicesList;
      populateVoicesList();
    }

    renderCurrentTab();
  }

  /* ==========================================================================
     HEADER & GLOBAL NAVIGATION
     ========================================================================== */
  function renderHeader() {
    if (!activeSeries) return;
    const seriesTitleEl = document.getElementById("headerSeriesTitle");
    if (seriesTitleEl) {
      seriesTitleEl.textContent = activeSeries.title;
    }
    const seriesCountEl = document.getElementById("headerSeriesCount");
    if (seriesCountEl && activeSeries.episodes) {
      seriesCountEl.textContent = `${activeSeries.episodes.length} Parts • ${activeSeries.category || "Dark Psychological"}`;
    }
  }

  function setupNavigation() {
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    // Update active nav button
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });

    // Update active view
    document.querySelectorAll(".studio-view").forEach(view => {
      view.classList.toggle("active-view", view.getAttribute("id") === `view-${tab}`);
    });

    // Stop playback if leaving simulator or voice studio
    if (tab !== "simulator" && simIsPlaying) {
      pauseSimulator();
    }
    if (tab !== "voice" && UHN.VoiceStudio.isPlaying()) {
      UHN.VoiceStudio.stopPreview();
    }

    renderCurrentTab();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderCurrentTab() {
    switch (activeTab) {
      case "bible":
        renderEpisodeBible();
        break;
      case "simulator":
        renderSimulator();
        break;
      case "voice":
        renderVoiceStudio();
        break;
      case "story-processor":
        renderStoryProcessorView();
        break;
      case "characters":
        renderCharacterBible();
        break;
      case "export":
        renderExportCenter();
        break;
      case "settings":
        renderSettingsView();
        break;
    }
  }

  /* ==========================================================================
     EPISODE BIBLE VIEW
     ========================================================================== */
  function renderEpisodeBible() {
    updateSidebarList();
    renderEpisodeWorkspace();
  }

  function updateSidebarList() {
    const listEl = document.getElementById("episodeSidebarList");
    if (!listEl || !activeSeries) return;
    listEl.innerHTML = "";

    const episodes = activeSeries.episodes || [];
    const countBadge = document.getElementById("sidebarEpisodeCount");
    if (countBadge) countBadge.textContent = `${episodes.length} Parts`;

    episodes.forEach((ep, index) => {
      const card = document.createElement("div");
      card.className = `episode-card ${index === activeEpisodeIndex ? "active" : ""}`;
      card.onclick = () => {
        activeEpisodeIndex = index;
        updateSidebarList();
        renderEpisodeWorkspace();
      };

      const partNum = ep.number < 10 ? "0" + ep.number : ep.number;
      const statusClass = `badge-${ep.status || "draft"}`;

      card.innerHTML = `
        <div class="episode-card-top">
          <span class="episode-num">PART ${partNum}</span>
          <span class="badge ${statusClass}">${(ep.status || "draft").toUpperCase()}</span>
        </div>
        <div class="episode-card-title">${escapeHTML(ep.title)}</div>
        <div class="episode-card-meta">
          <span>~${ep.estimatedDuration || ep.targetDuration || 45}s</span>
          <span>${ep.wordCount || 0} words</span>
        </div>
      `;
      listEl.appendChild(card);
    });

    const addBtn = document.getElementById("btnAddEpisode");
    if (addBtn) {
      addBtn.onclick = addNewEpisode;
    }
  }

  function renderEpisodeWorkspace() {
    if (!activeSeries || !activeSeries.episodes || !activeSeries.episodes[activeEpisodeIndex]) return;
    const ep = activeSeries.episodes[activeEpisodeIndex];

    // Inputs
    const titleInput = document.getElementById("epTitleInput");
    const numInput = document.getElementById("epNumberInput");
    const statusSelect = document.getElementById("epStatusSelect");
    const themeInput = document.getElementById("epThemeInput");
    const scriptArea = document.getElementById("epNarrationScript");

    if (titleInput) {
      titleInput.value = ep.title || "";
      titleInput.oninput = (e) => {
        ep.title = e.target.value;
        autoSave();
        updateSidebarList();
      };
    }

    if (numInput) {
      numInput.value = ep.number;
      numInput.oninput = (e) => {
        ep.number = parseInt(e.target.value) || 1;
        autoSave();
        updateSidebarList();
      };
    }

    if (statusSelect) {
      statusSelect.value = ep.status || "draft";
      statusSelect.onchange = (e) => {
        ep.status = e.target.value;
        autoSave();
        updateSidebarList();
      };
    }

    if (themeInput) {
      themeInput.value = ep.theme || "";
      themeInput.oninput = (e) => {
        ep.theme = e.target.value;
        autoSave();
      };
    }

    if (scriptArea) {
      scriptArea.value = ep.narrationScript || "";
      scriptArea.oninput = (e) => {
        ep.narrationScript = e.target.value;
        updateScriptMetrics(e.target.value);
        autoSave();
      };
    }

    // Voice Markers Toolbar
    setupVoiceMarkersToolbar(scriptArea);

    // Initial metrics calculation
    updateScriptMetrics(ep.narrationScript || "");

    // Hooks
    renderHooksSection(ep);

    // Psychological Insight
    const insightText = document.getElementById("epInsightText");
    if (insightText) {
      insightText.value = ep.psychologicalInsight || "";
      insightText.oninput = (e) => {
        ep.psychologicalInsight = e.target.value;
        autoSave();
      };
    }

    // Cinematic Specs
    const visualDir = document.getElementById("epVisualDirections");
    const onScreenText = document.getElementById("epOnScreenText");
    const soundDesign = document.getElementById("epSoundDesign");
    const transitionInst = document.getElementById("epTransitionInstructions");

    if (visualDir) {
      visualDir.value = ep.visualDirections || "";
      visualDir.oninput = (e) => { ep.visualDirections = e.target.value; autoSave(); };
    }
    if (onScreenText) {
      onScreenText.value = ep.onScreenText || "";
      onScreenText.oninput = (e) => {
        ep.onScreenText = e.target.value;
        validateSafeZoneText(e.target.value);
        autoSave();
      };
      validateSafeZoneText(ep.onScreenText || "");
    }
    if (soundDesign) {
      soundDesign.value = ep.soundDesign || "";
      soundDesign.oninput = (e) => { ep.soundDesign = e.target.value; autoSave(); };
    }
    if (transitionInst) {
      transitionInst.value = ep.transitionInstructions || "";
      transitionInst.oninput = (e) => { ep.transitionInstructions = e.target.value; autoSave(); };
    }

    // Timeline Table
    renderTimelineTable(ep);

    // Social Media Pack
    renderSocialMediaPack(ep);

    // Delete Episode Button
    const deleteBtn = document.getElementById("btnDeleteEpisode");
    if (deleteBtn) {
      deleteBtn.onclick = deleteCurrentEpisode;
    }
  }

  function setupVoiceMarkersToolbar(textarea) {
    const toolbar = document.getElementById("voiceMarkersToolbar");
    if (!toolbar) return;
    toolbar.innerHTML = `<span class="voice-markers-label">Voice Directions:</span>`;

    UHN.Models.VOICE_MARKERS.forEach(marker => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "marker-btn";
      btn.textContent = marker.tag;
      btn.title = marker.title;
      btn.onclick = () => {
        UHN.VoiceStudio.insertMarker(textarea, marker.tag);
        showToast(`Inserted ${marker.tag}`);
      };
      toolbar.appendChild(btn);
    });
  }

  function updateScriptMetrics(scriptText) {
    const analysis = UHN.StoryProcessor.analyzeText(scriptText, voiceCurrentWpm);
    const ep = activeSeries.episodes[activeEpisodeIndex];
    if (ep) {
      ep.wordCount = analysis.wordCount;
      ep.estimatedDuration = analysis.estimatedSeconds;
    }

    const wordEl = document.getElementById("metricWordCount");
    const durEl = document.getElementById("metricDuration");
    const paceEl = document.getElementById("metricPaceIndicator");
    const wpmEl = document.getElementById("metricWpm");

    if (wordEl) wordEl.textContent = analysis.wordCount;
    if (durEl) durEl.textContent = `~${analysis.estimatedSeconds}s`;
    if (wpmEl) wpmEl.textContent = `${voiceCurrentWpm} WPM`;

    if (paceEl) {
      if (analysis.estimatedSeconds <= 45) {
        paceEl.className = "metric-indicator metric-safe";
        paceEl.innerHTML = `✓ Safe Range (0–45s) • High Retention`;
      } else if (analysis.estimatedSeconds <= 60) {
        paceEl.className = "metric-indicator metric-warn";
        paceEl.innerHTML = `⚠ Moderate (45–60s) • Watch pacing`;
      } else {
        paceEl.className = "metric-indicator metric-danger";
        paceEl.innerHTML = `✕ Long (>60s) • Risk of drop-off`;
      }
    }
  }

  function validateSafeZoneText(text) {
    const badge = document.getElementById("safeZoneBadge");
    if (!badge) return;
    const check = UHN.ReelPlanner.checkSafeZone(text);
    if (check.safe) {
      badge.className = "badge badge-published";
      badge.textContent = `Safe (${text.length} chars)`;
    } else {
      badge.className = "badge badge-review";
      badge.textContent = `Warning: ${text.length} chars (recom. <70)`;
    }
  }

  function renderHooksSection(ep) {
    const currentHookInput = document.getElementById("epOpeningHook");
    if (currentHookInput) {
      currentHookInput.value = ep.openingHook || "";
      currentHookInput.oninput = (e) => {
        ep.openingHook = e.target.value;
        autoSave();
      };
    }

    const hookGrid = document.getElementById("hooksAlternativeGrid");
    if (!hookGrid) return;
    hookGrid.innerHTML = "";

    const hooks = ep.hooks || [];
    hooks.forEach(h => {
      const isSelected = h.text.trim() === (ep.openingHook || "").trim();
      const card = document.createElement("div");
      card.className = `hook-option-card ${isSelected ? "selected" : ""}`;
      card.innerHTML = `
        <div>
          <div class="hook-category-tag">${h.category.replace(/_/g, " ").toUpperCase()}</div>
          <div class="hook-text">"${escapeHTML(h.text)}"</div>
        </div>
        <button class="btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}" type="button">
          ${isSelected ? "Active" : "Select"}
        </button>
      `;
      card.onclick = () => {
        ep.openingHook = h.text;
        if (currentHookInput) currentHookInput.value = h.text;
        renderHooksSection(ep);
        autoSave();
        showToast("Opening hook updated!");
      };
      hookGrid.appendChild(card);
    });
  }

  function renderTimelineTable(ep) {
    const tbody = document.getElementById("timelineTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const timeline = ep.timelinePlan || [];
    timeline.forEach((scene, sIdx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="timeline-badge-time">${scene.timeRange} (${scene.duration})</td>
        <td><strong>${escapeHTML(scene.visual)}</strong></td>
        <td><code>${escapeHTML(scene.camera)}</code></td>
        <td><em>"${escapeHTML(scene.text)}"</em></td>
        <td><span style="color: #60a5fa">${escapeHTML(scene.sfx)}</span></td>
        <td><button class="btn btn-sm btn-danger btn-icon" title="Remove Scene" type="button">✕</button></td>
      `;
      const delBtn = tr.querySelector(".btn-danger");
      if (delBtn) {
        delBtn.onclick = () => {
          ep.timelinePlan.splice(sIdx, 1);
          ep.timelinePlan = UHN.ReelPlanner.recalculateTimelines(ep.timelinePlan);
          renderTimelineTable(ep);
          autoSave();
        };
      }
      tbody.appendChild(tr);
    });

    const addSceneBtn = document.getElementById("btnAddTimelineScene");
    if (addSceneBtn) {
      addSceneBtn.onclick = () => {
        ep.timelinePlan = ep.timelinePlan || [];
        ep.timelinePlan.push({
          timeRange: "00:00–00:05",
          duration: "5s",
          visual: "New cinematic scene visual",
          camera: "Slow forward push",
          text: "KEY PSYCHOLOGICAL QUESTION",
          sfx: "Subtle heartbeat",
          narrationSync: "Synced with narration"
        });
        ep.timelinePlan = UHN.ReelPlanner.recalculateTimelines(ep.timelinePlan);
        renderTimelineTable(ep);
        autoSave();
        showToast("Added new timeline scene!");
      };
    }
  }

  function renderSocialMediaPack(ep) {
    const captions = ep.instagramCaptions || {
      short: `${ep.openingHook || ""}... Part ${ep.number} of ${activeSeries.title}.`,
      storytelling: `Jab insaan apne emotions par dhyan nahi deta, toh doosre unka fayda uthane lagte hain. In Part ${ep.number} of "${activeSeries.title}", explore the reality behind human behavior.`,
      psychological: `${ep.psychologicalInsight || ""} #UnseenHumanNature explores real behavioural patterns.`
    };

    const captionBox = document.getElementById("socialCaptionBox");
    const questionBox = document.getElementById("socialQuestionBox");
    const ctaBox = document.getElementById("socialCtaBox");
    const hashtagsBox = document.getElementById("socialHashtagsBox");

    let currentCaptionType = "storytelling";

    function updateCaptionDisplay() {
      if (captionBox) {
        captionBox.textContent = captions[currentCaptionType] || "";
      }
    }

    const captionTabs = document.querySelectorAll(".caption-tab-btn");
    captionTabs.forEach(btn => {
      btn.onclick = () => {
        captionTabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCaptionType = btn.getAttribute("data-caption");
        updateCaptionDisplay();
      };
    });

    updateCaptionDisplay();

    if (questionBox) questionBox.textContent = ep.thoughtProvokingQuestion || "What would you do in this situation?";
    if (ctaBox) ctaBox.textContent = ep.callToAction || `Follow @unseen_hummannature for Part ${ep.number + 1}.`;
    if (hashtagsBox) hashtagsBox.textContent = ep.hashtags || "#UnseenHumanNature #DarkStories #PsychologicalReels";

    // Copy buttons
    setupCopyButton("btnCopyCaption", () => captionBox ? captionBox.textContent : "");
    setupCopyButton("btnCopyQuestion", () => questionBox ? questionBox.textContent : "");
    setupCopyButton("btnCopyCTA", () => ctaBox ? ctaBox.textContent : "");
    setupCopyButton("btnCopyHashtags", () => hashtagsBox ? hashtagsBox.textContent : "");
  }

  function addNewEpisode() {
    if (!activeSeries) return;
    const epNum = (activeSeries.episodes ? activeSeries.episodes.length : 0) + 1;
    const newEp = {
      id: "ep_" + Date.now(),
      number: epNum,
      title: `SHADOW ENCOUNTER ${epNum}`,
      theme: "Psychological tension and observation",
      status: "draft",
      targetDuration: 45,
      estimatedDuration: 45,
      wordCount: 85,
      openingHook: "Kyun hota hai ki hum kisi ko pehchante hue bhi nahi pehchan paate?",
      narrationScript: `Yeh kahani sirf ek shuruat hai. [PAUSE]\nKuch sawal aise hote hain jinka jawab koi nahi deta.\n[LOWER VOICE] Lekin jab sach samne aata hai, tab der ho chuki hoti hai.`,
      psychologicalInsight: "True accountability begins when we examine our own motives honestly.",
      visualDirections: "Dark alleyway, lone silhouette, neon light reflects in puddle.",
      onScreenText: `PART ${epNum < 10 ? "0" + epNum : epNum}: SHADOW ENCOUNTER`,
      soundDesign: "Low drone, sudden sub-bass drop",
      transitionInstructions: "Fade out slowly to pitch black",
      endingCliffhanger: "Lekin kya agla kadam uska tha... ya kisi aur ka?",
      nextEpisodeTeaser: "Coming in next part.",
      instagramCaptions: {
        short: `Part ${epNum} of ${activeSeries.title}. Who is really behind the mask?`,
        storytelling: `Har rishte ki ek pehchaan hoti hai. Follow Part ${epNum} of "${activeSeries.title}".`,
        psychological: `Emotional honesty is rare. Explore human nature with @unseen_hummannature.`
      },
      thoughtProvokingQuestion: "Have you ever felt someone hiding their real face?",
      callToAction: `Follow @unseen_hummannature for Part ${epNum + 1}.`,
      hashtags: "#UnseenHumanNature #DarkStories #PsychologyReel",
      hooks: [
        { category: "psychological_mystery", text: "Kyun hota hai ki hum kisi ko pehchante hue bhi nahi pehchan paate?" },
        { category: "unexpected_observation", text: "Insaan aksar wahi kho deta hai jise woh sabse zyada chupata hai." }
      ],
      timelinePlan: [
        { timeRange: "00:00–00:05", duration: "5s", visual: "Macro extreme close up of reflective eyes", camera: "Slow push in", text: `PART ${epNum}: SHADOW ENCOUNTER`, sfx: "Subtle sub-bass", narrationSync: "Opening hook spoken" },
        { timeRange: "00:05–00:20", duration: "15s", visual: "Walking alone through rainy city lights", camera: "Tracking over shoulder", text: "OBSERVING HUMAN MOTIVE", sfx: "Rain ambience", narrationSync: "Main story narration" },
        { timeRange: "00:20–00:45", duration: "25s", visual: "Silhouette standing in front of mirror", camera: "Static tilt up", text: "THE UNSEEN TRUTH", sfx: "Deep pulse drone", narrationSync: "Concluding reflection" }
      ]
    };

    activeSeries.episodes = activeSeries.episodes || [];
    activeSeries.episodes.push(newEp);
    activeEpisodeIndex = activeSeries.episodes.length - 1;
    autoSave();
    updateSidebarList();
    renderEpisodeWorkspace();
    showToast(`Added Part ${epNum}!`);
  }

  function deleteCurrentEpisode() {
    if (!activeSeries || !activeSeries.episodes || activeSeries.episodes.length <= 1) {
      alert("A series must retain at least one episode.");
      return;
    }
    const ep = activeSeries.episodes[activeEpisodeIndex];
    if (confirm(`Are you sure you want to delete Part ${ep.number}: "${ep.title}"?`)) {
      activeSeries.episodes.splice(activeEpisodeIndex, 1);
      // Re-index remaining episodes
      activeSeries.episodes.forEach((e, idx) => { e.number = idx + 1; });
      activeEpisodeIndex = Math.max(0, activeEpisodeIndex - 1);
      autoSave();
      updateSidebarList();
      renderEpisodeWorkspace();
      showToast("Episode removed.");
    }
  }

  /* ==========================================================================
     9:16 REEL SIMULATOR CONTROLLER
     ========================================================================== */
  function renderSimulator() {
    if (!activeSeries || !activeSeries.episodes || !activeSeries.episodes[activeEpisodeIndex]) return;
    const ep = activeSeries.episodes[activeEpisodeIndex];

    const titleEl = document.getElementById("simEpTitle");
    const partPill = document.getElementById("simPartPill");
    const overlayText = document.getElementById("simOverlayText");
    const subtitleBar = document.getElementById("simSubtitleBar");
    const igUsername = document.getElementById("simIgUsername");
    const igCaption = document.getElementById("simIgCaption");
    const timelineList = document.getElementById("simSceneTimelineList");

    if (titleEl) titleEl.textContent = `PART ${ep.number < 10 ? "0" + ep.number : ep.number}: ${ep.title}`;
    if (partPill) partPill.textContent = `PART ${ep.number < 10 ? "0" + ep.number : ep.number}`;
    if (overlayText) overlayText.textContent = ep.onScreenText || ep.title;
    if (subtitleBar) subtitleBar.textContent = `"${ep.openingHook}"`;
    if (igUsername) igUsername.textContent = UHN.Models.BRAND.handle;
    if (igCaption) igCaption.textContent = ep.instagramCaptions ? ep.instagramCaptions.short : ep.openingHook;

    simDuration = ep.estimatedDuration || ep.targetDuration || 45;
    const maxDurationEl = document.getElementById("simMaxDuration");
    if (maxDurationEl) maxDurationEl.textContent = formatSec(simDuration);

    const scrubber = document.getElementById("simScrubber");
    if (scrubber) {
      scrubber.max = simDuration;
      scrubber.value = simCurrentTime;
    }

    // Render Scene List
    if (timelineList) {
      timelineList.innerHTML = "";
      (ep.timelinePlan || []).forEach((scene, idx) => {
        const item = document.createElement("div");
        item.className = "card";
        item.style.padding = "12px 16px";
        item.style.marginBottom = "8px";
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:4px">
            <span class="timeline-badge-time">${scene.timeRange} (${scene.duration})</span>
            <span style="font-size:11px; color:#60a5fa">${escapeHTML(scene.camera)}</span>
          </div>
          <div style="font-size:12px; color:#ffffff; font-weight:600">${escapeHTML(scene.visual)}</div>
          <div style="font-size:11px; color:#a1a1aa; margin-top:2px"><em>Overlay: "${escapeHTML(scene.text)}"</em></div>
        `;
        timelineList.appendChild(item);
      });
    }

    updateSimulatorFrame(simCurrentTime);
  }

  function setupSimulatorEvents() {
    const playBtn = document.getElementById("btnSimPlay");
    const resetBtn = document.getElementById("btnSimReset");
    const scrubber = document.getElementById("simScrubber");
    const toggleIG = document.getElementById("btnSimToggleIG");
    const toggleSafe = document.getElementById("btnSimToggleSafe");
    const voicePreviewBtn = document.getElementById("btnSimVoicePreview");

    if (playBtn) {
      playBtn.onclick = () => {
        if (simIsPlaying) {
          pauseSimulator();
        } else {
          startSimulator();
        }
      };
    }

    if (resetBtn) {
      resetBtn.onclick = () => {
        pauseSimulator();
        simCurrentTime = 0;
        updateSimulatorFrame(0);
      };
    }

    if (scrubber) {
      scrubber.oninput = (e) => {
        simCurrentTime = parseInt(e.target.value) || 0;
        updateSimulatorFrame(simCurrentTime);
      };
    }

    if (toggleIG) {
      toggleIG.onclick = () => {
        simShowIG = !simShowIG;
        const igLayer = document.getElementById("simInstagramOverlay");
        if (igLayer) igLayer.style.display = simShowIG ? "flex" : "none";
        toggleIG.classList.toggle("btn-primary", simShowIG);
      };
    }

    if (toggleSafe) {
      toggleSafe.onclick = () => {
        simShowSafe = !simShowSafe;
        const safeLayer = document.getElementById("simSafeZoneOverlay");
        if (safeLayer) safeLayer.style.display = simShowSafe ? "flex" : "none";
        toggleSafe.classList.toggle("btn-primary", simShowSafe);
      };
    }

    if (voicePreviewBtn) {
      voicePreviewBtn.onclick = () => {
        const ep = activeSeries.episodes[activeEpisodeIndex];
        if (!ep) return;
        if (UHN.VoiceStudio.isPlaying()) {
          UHN.VoiceStudio.stopPreview();
          voicePreviewBtn.innerHTML = `<span>▶ Listen to Narration Audio</span>`;
        } else {
          voicePreviewBtn.innerHTML = `<span>⏹ Stop Narration Audio</span>`;
          UHN.VoiceStudio.playPreview(ep.narrationScript, voiceCurrentWpm, null, () => {
            voicePreviewBtn.innerHTML = `<span>▶ Listen to Narration Audio</span>`;
          });
        }
      };
    }
  }

  function startSimulator() {
    simIsPlaying = true;
    const playBtn = document.getElementById("btnSimPlay");
    if (playBtn) playBtn.innerHTML = `<span>❚❚ Pause</span>`;

    if (simInterval) clearInterval(simInterval);
    simInterval = setInterval(() => {
      simCurrentTime++;
      if (simCurrentTime > simDuration) {
        pauseSimulator();
        simCurrentTime = 0;
      }
      updateSimulatorFrame(simCurrentTime);
    }, 1000);
  }

  function pauseSimulator() {
    simIsPlaying = false;
    if (simInterval) clearInterval(simInterval);
    const playBtn = document.getElementById("btnSimPlay");
    if (playBtn) playBtn.innerHTML = `<span>▶ Play Timeline</span>`;
  }

  function updateSimulatorFrame(timeInSec) {
    const curTimeEl = document.getElementById("simCurrentTime");
    const scrubber = document.getElementById("simScrubber");
    if (curTimeEl) curTimeEl.textContent = formatSec(timeInSec);
    if (scrubber) scrubber.value = timeInSec;

    const ep = activeSeries.episodes[activeEpisodeIndex];
    if (!ep) return;

    // Determine current scene from timelinePlan
    const timeline = ep.timelinePlan || [];
    let curScene = timeline[0] || null;
    let accumulated = 0;

    for (let scene of timeline) {
      const durMatch = (scene.duration || "5s").match(/\d+/);
      const dur = durMatch ? parseInt(durMatch[0]) : 5;
      if (timeInSec >= accumulated && timeInSec < accumulated + dur) {
        curScene = scene;
        break;
      }
      accumulated += dur;
    }

    const overlayText = document.getElementById("simOverlayText");
    const subtitleBar = document.getElementById("simSubtitleBar");
    const sceneVisualDesc = document.getElementById("simActiveVisualNote");

    if (curScene) {
      if (overlayText) overlayText.textContent = curScene.text || ep.onScreenText;
      if (subtitleBar) subtitleBar.textContent = `"${curScene.narrationSync || ep.openingHook}"`;
      if (sceneVisualDesc) {
        sceneVisualDesc.textContent = `Camera: ${curScene.camera} • Visual: ${curScene.visual} • SFX: ${curScene.sfx}`;
      }
    }
  }

  /* ==========================================================================
     VOICE-OVER STUDIO CONTROLLER
     ========================================================================== */
  function renderVoiceStudio() {
    if (!activeSeries || !activeSeries.episodes || !activeSeries.episodes[activeEpisodeIndex]) return;
    const ep = activeSeries.episodes[activeEpisodeIndex];

    const titleEl = document.getElementById("voiceStudioEpTitle");
    if (titleEl) {
      titleEl.textContent = `PART ${ep.number < 10 ? "0" + ep.number : ep.number}: ${ep.title}`;
    }

    const teleprompterBox = document.getElementById("teleprompterContent");
    if (!teleprompterBox) return;
    teleprompterBox.innerHTML = "";

    voiceSentences = UHN.VoiceStudio.splitIntoSentences(ep.narrationScript);

    voiceSentences.forEach((block, idx) => {
      const lineEl = document.createElement("div");
      lineEl.className = "teleprompter-line";
      lineEl.id = `teleLine_${idx}`;
      lineEl.style.fontSize = `${voiceFontSize}px`;

      if (block.type === "marker") {
        lineEl.innerHTML = `<span class="teleprompter-marker-tag">${block.text}</span>`;
      } else {
        lineEl.textContent = block.text;
      }

      lineEl.onclick = () => {
        highlightTeleprompterLine(idx);
      };

      teleprompterBox.appendChild(lineEl);
    });

    const wpmSlider = document.getElementById("voiceWpmSlider");
    const wpmLabel = document.getElementById("voiceWpmDisplay");
    if (wpmSlider) wpmSlider.value = voiceCurrentWpm;
    if (wpmLabel) wpmLabel.textContent = `${voiceCurrentWpm} WPM`;
  }

  function setupVoiceStudioEvents() {
    const playBtn = document.getElementById("btnVoicePlay");
    const pauseBtn = document.getElementById("btnVoicePause");
    const stopBtn = document.getElementById("btnVoiceStop");
    const wpmSlider = document.getElementById("voiceWpmSlider");
    const fontPlusBtn = document.getElementById("btnVoiceFontPlus");
    const fontMinusBtn = document.getElementById("btnVoiceFontMinus");

    if (playBtn) {
      playBtn.onclick = () => {
        const ep = activeSeries.episodes[activeEpisodeIndex];
        if (!ep) return;

        UHN.VoiceStudio.playPreview(
          ep.narrationScript,
          voiceCurrentWpm,
          (charIndex, fullCleanText) => {
            // Find approximately matching sentence
            const spokenBlocks = voiceSentences.filter(b => b.type === "spoken");
            let accumulatedChars = 0;
            for (let i = 0; i < spokenBlocks.length; i++) {
              accumulatedChars += spokenBlocks[i].text.length;
              if (charIndex <= accumulatedChars) {
                const realIndex = voiceSentences.indexOf(spokenBlocks[i]);
                highlightTeleprompterLine(realIndex);
                break;
              }
            }
          },
          () => {
            resetTeleprompterHighlights();
          }
        );
      };
    }

    if (pauseBtn) {
      pauseBtn.onclick = () => {
        if (UHN.VoiceStudio.isPlaying()) {
          UHN.VoiceStudio.pausePreview();
        } else {
          UHN.VoiceStudio.resumePreview();
        }
      };
    }

    if (stopBtn) {
      stopBtn.onclick = () => {
        UHN.VoiceStudio.stopPreview();
        resetTeleprompterHighlights();
      };
    }

    if (wpmSlider) {
      wpmSlider.oninput = (e) => {
        voiceCurrentWpm = parseInt(e.target.value) || 135;
        const wpmLabel = document.getElementById("voiceWpmDisplay");
        if (wpmLabel) wpmLabel.textContent = `${voiceCurrentWpm} WPM`;
        updateScriptMetrics(activeSeries.episodes[activeEpisodeIndex].narrationScript || "");
      };
    }

    if (fontPlusBtn) {
      fontPlusBtn.onclick = () => {
        voiceFontSize = Math.min(36, voiceFontSize + 2);
        document.querySelectorAll(".teleprompter-line").forEach(l => {
          l.style.fontSize = `${voiceFontSize}px`;
        });
      };
    }

    if (fontMinusBtn) {
      fontMinusBtn.onclick = () => {
        voiceFontSize = Math.max(16, voiceFontSize - 2);
        document.querySelectorAll(".teleprompter-line").forEach(l => {
          l.style.fontSize = `${voiceFontSize}px`;
        });
      };
    }
  }

  function highlightTeleprompterLine(index) {
    resetTeleprompterHighlights();
    voiceActiveIndex = index;
    const line = document.getElementById(`teleLine_${index}`);
    if (line) {
      line.classList.add("karaoke-active");
      line.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function resetTeleprompterHighlights() {
    document.querySelectorAll(".teleprompter-line").forEach(l => {
      l.classList.remove("karaoke-active");
    });
  }

  function populateVoicesList() {
    const select = document.getElementById("voiceSelectDropdown");
    if (!select || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    select.innerHTML = "";

    voices.forEach((v, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.lang.startsWith("hi") || v.name.toLowerCase().includes("india") || (v.lang.startsWith("en") && v.name.includes("David"))) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  }

  /* ==========================================================================
     STORY INGESTION & GENERATOR CONTROLLER
     ========================================================================== */
  function renderStoryProcessorView() {
    const categorySelect = document.getElementById("ingestCategory");
    const narrationStyleSelect = document.getElementById("ingestNarrationStyle");
    const intensitySelect = document.getElementById("ingestIntensity");
    const endingSelect = document.getElementById("ingestEndingStyle");

    if (categorySelect && categorySelect.options.length === 0) {
      UHN.Models.STORY_CATEGORIES.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
      });
    }

    if (narrationStyleSelect && narrationStyleSelect.options.length === 0) {
      UHN.Models.NARRATION_STYLES.forEach(style => {
        narrationStyleSelect.innerHTML += `<option value="${style.id}">${style.label}</option>`;
      });
    }

    if (intensitySelect && intensitySelect.options.length === 0) {
      UHN.Models.EMOTIONAL_INTENSITIES.forEach(ei => {
        intensitySelect.innerHTML += `<option value="${ei.label}">${ei.label}</option>`;
      });
    }

    if (endingSelect && endingSelect.options.length === 0) {
      UHN.Models.ENDING_STYLES.forEach(es => {
        endingSelect.innerHTML += `<option value="${es.label}">${es.label}</option>`;
      });
    }
  }

  function setupStoryIngestionEvents() {
    const loadSampleBtn = document.getElementById("btnLoadSampleStory");
    const transformBtn = document.getElementById("btnTransformStory");
    const storyTextarea = document.getElementById("ingestRawStory");
    const titleInput = document.getElementById("ingestTitle");

    if (loadSampleBtn) {
      loadSampleBtn.onclick = () => {
        if (storyTextarea) {
          storyTextarea.value = UHN.SampleData.MASTER_SERIES.sourceStorySummary;
        }
        if (titleInput) {
          titleInput.value = "THE ILLUSION OF ATTACHMENT";
        }
        showToast("Loaded sample psychological narrative!");
      };
    }

    if (transformBtn) {
      transformBtn.onclick = () => {
        const rawStory = storyTextarea ? storyTextarea.value.trim() : "";
        if (!rawStory || rawStory.length < 30) {
          alert("Please paste a story with at least a few sentences.");
          return;
        }

        const title = (titleInput ? titleInput.value.trim() : "") || "UNTITLED PSYCHOLOGICAL ARC";
        const category = document.getElementById("ingestCategory").value;
        const narrationStyle = document.getElementById("ingestNarrationStyle").value;
        const emotionalIntensity = document.getElementById("ingestIntensity").value;
        const endingStyle = document.getElementById("ingestEndingStyle").value;
        const duration = parseInt(document.getElementById("ingestDuration").value) || 45;
        const episodeCount = document.getElementById("ingestEpisodeCount").value;
        const language = document.getElementById("ingestLanguage").value;

        transformBtn.disabled = true;
        transformBtn.textContent = "Processing & Generating Multi-Part Series...";

        setTimeout(() => {
          try {
            const newSeries = UHN.StoryProcessor.processStoryIntoSeries({
              title,
              rawStory,
              language,
              category,
              narrationStyle,
              emotionalIntensity,
              endingStyle,
              targetDuration: duration,
              episodeCount,
              wpm: voiceCurrentWpm
            });

            UHN.Storage.saveSeries(newSeries);
            UHN.Storage.setActiveSeriesId(newSeries.id);

            showToast(`Created ${newSeries.episodes.length}-part series!`);
            switchTab("bible");
          } catch (err) {
            alert("Error transforming story: " + err.message);
          } finally {
            transformBtn.disabled = false;
            transformBtn.textContent = "Transform Story into Multi-Part Production Series";
          }
        }, 300);
      };
    }
  }

  /* ==========================================================================
     CHARACTER BIBLE & MOODBOARD VIEW
     ========================================================================== */
  function renderCharacterBible() {
    const grid = document.getElementById("charactersListGrid");
    if (!grid || !activeSeries) return;
    grid.innerHTML = "";

    const characters = activeSeries.characters || [];
    characters.forEach(char => {
      const card = document.createElement("div");
      card.className = "character-card";
      
      const propsHtml = (char.props || []).map(p => `
        <span class="prop-pill"><strong>${escapeHTML(p.name)}:</strong> ${escapeHTML(p.desc)}</span>
      `).join("");

      card.innerHTML = `
        <div class="character-top">
          <div class="character-avatar">${char.name.charAt(0)}</div>
          <div class="character-name-block">
            <span class="character-name">${escapeHTML(char.name)}</span>
            <span class="character-role-tag">${escapeHTML(char.role || "Character")} • ${char.age || ""}</span>
          </div>
        </div>
        <div class="character-quote">"${escapeHTML(char.quote || "")}"</div>
        <div style="font-size:12.5px; color:#d4d4d8">
          <strong>Personality:</strong> ${escapeHTML(char.personality || "Introspective and complex.")}
        </div>
        <div style="font-size:12px; color:#a1a1aa">
          <strong>Visual Aesthetic:</strong> ${escapeHTML(char.visualAesthetic || "Cinematic moody backdrop")}
        </div>
        <div class="props-list">${propsHtml}</div>
      `;
      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     EXPORT CENTER CONTROLLER
     ========================================================================== */
  function renderExportCenter() {
    // Handlers setup in setupExportEvents
  }

  function setupExportEvents() {
    // 1. Full Production Bible (.md)
    setupDownloadBtn("btnExportBibleMd", () => {
      const md = UHN.ExportCenter.generateSeriesMarkdown(activeSeries);
      UHN.ExportCenter.downloadFile(md, `${sanitizeFilename(activeSeries.title)}_Production_Bible.md`, "text/markdown;charset=utf-8;");
      showToast("Downloaded Series Production Bible (.md)");
    });

    // 2. Single Episode Plan (.md)
    setupDownloadBtn("btnExportEpisodeMd", () => {
      const ep = activeSeries.episodes[activeEpisodeIndex];
      const md = UHN.ExportCenter.generateSingleEpisodeMarkdown(ep, activeSeries.title);
      UHN.ExportCenter.downloadFile(md, `${sanitizeFilename(activeSeries.title)}_Part_${ep.number}_Plan.md`, "text/markdown;charset=utf-8;");
      showToast(`Downloaded Part ${ep.number} Plan (.md)`);
    });

    // 3. Teleprompter Scripts (.txt)
    setupDownloadBtn("btnExportScriptsTxt", () => {
      const txt = UHN.ExportCenter.generateAllScriptsText(activeSeries);
      UHN.ExportCenter.downloadFile(txt, `${sanitizeFilename(activeSeries.title)}_Teleprompter_Scripts.txt`);
      showToast("Downloaded Narration Scripts (.txt)");
    });

    // 4. Hook Database (.txt)
    setupDownloadBtn("btnExportHooksTxt", () => {
      const txt = UHN.ExportCenter.generateAllHooksText(activeSeries);
      UHN.ExportCenter.downloadFile(txt, `${sanitizeFilename(activeSeries.title)}_Hook_Database.txt`);
      showToast("Downloaded Hook Database (.txt)");
    });

    // 5. Instagram Caption Pack (.txt)
    setupDownloadBtn("btnExportCaptionsTxt", () => {
      const txt = UHN.ExportCenter.generateCaptionsText(activeSeries);
      UHN.ExportCenter.downloadFile(txt, `${sanitizeFilename(activeSeries.title)}_Instagram_Captions.txt`);
      showToast("Downloaded Caption Pack (.txt)");
    });

    // 6. Director's Shot List (.txt)
    setupDownloadBtn("btnExportVisualsTxt", () => {
      const txt = UHN.ExportCenter.generateVisualPlansText(activeSeries);
      UHN.ExportCenter.downloadFile(txt, `${sanitizeFilename(activeSeries.title)}_Visual_Shot_List.txt`);
      showToast("Downloaded Shot List (.txt)");
    });

    // 7. Full JSON Backup
    setupDownloadBtn("btnExportBackupJson", () => {
      const json = UHN.Storage.exportBackupJSON();
      UHN.ExportCenter.downloadFile(json, `UHN_Dark_Studio_Backup_${new Date().toISOString().slice(0, 10)}.json`, "application/json;charset=utf-8;");
      showToast("Exported complete studio backup (.json)");
    });

    // Backup Import
    const fileInput = document.getElementById("inputImportBackup");
    const importBtn = document.getElementById("btnTriggerImport");
    if (importBtn && fileInput) {
      importBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = UHN.Storage.importBackupJSON(event.target.result);
          if (res.success) {
            activeSeries = UHN.Storage.getActiveSeries();
            activeEpisodeIndex = 0;
            renderHeader();
            renderCurrentTab();
            showToast(`Imported ${res.count} series successfully!`);
          } else {
            alert("Failed to import backup: " + res.error);
          }
        };
        reader.readAsText(file);
      };
    }
  }

  function setupDownloadBtn(id, onClick) {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = onClick;
  }

  /* ==========================================================================
     SETTINGS & SERIES MODALS
     ========================================================================== */
  function renderSettingsView() {
    const settings = UHN.Storage.getSettings();
    const handleInput = document.getElementById("settingBrandHandle");
    const brandNameInput = document.getElementById("settingBrandName");
    const taglineInput = document.getElementById("settingBrandTagline");
    const wpmInput = document.getElementById("settingWpm");

    if (handleInput) handleInput.value = settings.brandHandle || UHN.Models.BRAND.handle;
    if (brandNameInput) brandNameInput.value = settings.brandName || UHN.Models.BRAND.name;
    if (taglineInput) taglineInput.value = settings.tagline || UHN.Models.BRAND.tagline;
    if (wpmInput) wpmInput.value = settings.wpm || 135;

    const saveBtn = document.getElementById("btnSaveSettings");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const updated = {
          ...settings,
          brandHandle: handleInput.value.trim(),
          brandName: brandNameInput.value.trim(),
          tagline: taglineInput.value.trim(),
          wpm: parseInt(wpmInput.value) || 135
        };
        UHN.Storage.saveSettings(updated);
        voiceCurrentWpm = updated.wpm;
        showToast("Settings saved successfully!");
      };
    }

    const resetDefaultsBtn = document.getElementById("btnResetDefaults");
    if (resetDefaultsBtn) {
      resetDefaultsBtn.onclick = () => {
        if (confirm("Reset to the Master Sample Series 'WHO AM I?' and factory settings?")) {
          UHN.Storage.resetDefaults();
          activeSeries = UHN.Storage.getActiveSeries();
          activeEpisodeIndex = 0;
          renderHeader();
          renderCurrentTab();
          showToast("Studio reset to defaults.");
        }
      };
    }
  }

  function setupModals() {
    const seriesModalBtn = document.getElementById("headerSeriesPill");
    const seriesModal = document.getElementById("modalSeriesSwitcher");
    const closeSeriesModal = document.getElementById("btnCloseSeriesModal");

    if (seriesModalBtn && seriesModal) {
      seriesModalBtn.onclick = () => {
        renderSeriesSwitcherList();
        seriesModal.classList.add("open");
      };
    }

    if (closeSeriesModal && seriesModal) {
      closeSeriesModal.onclick = () => seriesModal.classList.remove("open");
    }

    // New Blank Series in Modal
    const btnNewSeriesModal = document.getElementById("btnModalNewSeries");
    if (btnNewSeriesModal) {
      btnNewSeriesModal.onclick = () => {
        const title = prompt("Enter Title for the New Series:", "THE DARK REFLECTION");
        if (!title) return;
        const newSeries = {
          id: "series_" + Date.now(),
          title: title.trim(),
          category: "Trust, Doubt & Betrayal",
          language: "Hinglish / Hindi",
          status: "draft",
          lastModified: new Date().toISOString(),
          characters: [
            {
              id: "char_narrator",
              name: "The Narrator",
              role: "Narrator & Observer",
              quote: "Not every kind heart is pure.",
              personality: "Calm, observant, calculating."
            }
          ],
          episodes: []
        };
        // Add Part 1
        newSeries.episodes.push({
          id: "ep_1_" + Date.now(),
          number: 1,
          title: "THE FIRST GLIMPSE",
          theme: "Initial meeting and observation",
          status: "draft",
          targetDuration: 45,
          estimatedDuration: 42,
          wordCount: 80,
          openingHook: "Kyun hota hai ki sabse gehri baatein sirf anjaano se hoti hain?",
          narrationScript: "Kuch log hamari zindagi mein aate hain bina kisi dastak ke. [PAUSE]\nLekin unki khamoshi sabse zyada shor machati hai.",
          psychologicalInsight: "Vulnerability without boundary invites subtle emotional leverage.",
          visualDirections: "Slow zoom on rain droplets running down midnight cafe window.",
          onScreenText: "PART 01: THE FIRST GLIMPSE",
          soundDesign: "Distant thunder and subtle Rhodes piano notes",
          transitionInstructions: "Fade to black",
          endingCliffhanger: "Lekin kya woh sach mein anjaan thi?",
          instagramCaptions: {
            short: "Part 01: The First Glimpse. Follow @unseen_hummannature for Part 2.",
            storytelling: "When two lonely minds cross paths, boundaries blur.",
            psychological: "Exploring attachment psychology with @unseen_hummannature."
          },
          thoughtProvokingQuestion: "Have you ever trusted a stranger too quickly?",
          callToAction: "Follow @unseen_hummannature for Part 02.",
          hashtags: "#UnseenHumanNature #DarkStories",
          hooks: [
            { category: "psychological_mystery", text: "Kyun hota hai ki sabse gehri baatein sirf anjaano se hoti hain?" }
          ],
          timelinePlan: [
            { timeRange: "00:00–00:10", duration: "10s", visual: "Rain on cafe window", camera: "Macro focus pull", text: "PART 01: THE FIRST GLIMPSE", sfx: "Rain sound", narrationSync: "First line" }
          ]
        });

        UHN.Storage.saveSeries(newSeries);
        UHN.Storage.setActiveSeriesId(newSeries.id);
        seriesModal.classList.remove("open");
        showToast(`Created series: "${newSeries.title}"`);
      };
    }
  }

  function renderSeriesSwitcherList() {
    const listEl = document.getElementById("modalSeriesList");
    if (!listEl) return;
    listEl.innerHTML = "";

    const allSeries = UHN.Storage.getAllSeries();
    allSeries.forEach(s => {
      const isCurrent = activeSeries && s.id === activeSeries.id;
      const card = document.createElement("div");
      card.className = `card ${isCurrent ? "active" : ""}`;
      card.style.display = "flex";
      card.style.alignItems = "center";
      card.style.justifyContent = "space-between";
      card.style.marginBottom = "10px";
      card.style.padding = "14px 18px";
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div>
          <div style="font-family:var(--font-serif); font-size:15px; font-weight:700; color:#ffffff">
            ${escapeHTML(s.title)} ${isCurrent ? '<span class="badge badge-published">Active</span>' : ""}
          </div>
          <div style="font-size:11.5px; color:#a1a1aa; margin-top:2px">
            ${s.episodes ? s.episodes.length : 0} Episodes • ${s.category || "Dark Stories"}
          </div>
        </div>
        <div style="display:flex; gap:8px">
          <button class="btn btn-sm btn-secondary btn-duplicate" title="Duplicate Series" type="button">Duplicate</button>
          ${allSeries.length > 1 ? '<button class="btn btn-sm btn-danger btn-delete" title="Delete Series" type="button">Delete</button>' : ""}
        </div>
      `;

      card.onclick = (e) => {
        if (e.target.closest("button")) return;
        UHN.Storage.setActiveSeriesId(s.id);
        document.getElementById("modalSeriesSwitcher").classList.remove("open");
      };

      const dupBtn = card.querySelector(".btn-duplicate");
      if (dupBtn) {
        dupBtn.onclick = (e) => {
          e.stopPropagation();
          UHN.Storage.duplicateSeries(s.id);
          renderSeriesSwitcherList();
          showToast("Duplicated series!");
        };
      }

      const delBtn = card.querySelector(".btn-delete");
      if (delBtn) {
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Delete "${s.title}"?`)) {
            UHN.Storage.deleteSeries(s.id);
            renderSeriesSwitcherList();
            showToast("Series deleted.");
          }
        };
      }

      listEl.appendChild(card);
    });
  }

  /* ==========================================================================
     HELPERS & UTILITIES
     ========================================================================== */
  function autoSave() {
    if (activeSeries) {
      UHN.Storage.saveSeries(activeSeries);
    }
  }

  function setupCopyButton(btnId, getText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.onclick = () => {
      const text = getText();
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>✓ Copied!</span>`;
        setTimeout(() => { btn.innerHTML = originalText; }, 1800);
        showToast("Copied to clipboard!");
      }).catch(() => {
        showToast("Failed to copy text.");
      });
    };
  }

  function showToast(message) {
    let toast = document.getElementById("studioToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "studioToast";
      toast.className = "studio-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${escapeHTML(message)}</span>
    `;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  function formatSec(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  }

  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function sanitizeFilename(str) {
    return (str || "Series").replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  return {
    init,
    switchTab,
    showToast,
    autoSave
  };
})();

// Bootstrap on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  UHN.App.init();
});
