/**
 * UNSEEN HUMAN NATURE — DARK STORIES STUDIO
 * Local-First Storage & Persistence Layer
 * Brand: @unseen_hummannature
 */

window.UHN = window.UHN || {};

UHN.Storage = (function() {
  const STORAGE_KEY_SERIES = "uhn_dark_studio_series_v2";
  const STORAGE_KEY_ACTIVE = "uhn_dark_studio_active_id";
  const STORAGE_KEY_SETTINGS = "uhn_dark_studio_settings_v1";

  function init() {
    try {
      let existing = localStorage.getItem(STORAGE_KEY_SERIES);
      if (!existing) {
        // Check if v1 existed and migrate
        const oldV1 = localStorage.getItem("uhn_dark_studio_series_v1");
        if (oldV1) {
          const parsed = JSON.parse(oldV1);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Upgrade characters in existing series
            parsed.forEach(s => {
              if (s.id === UHN.SampleData.MASTER_SERIES.id || !s.characters || s.characters.length === 0 || !s.characters[0].faceReference) {
                s.characters = JSON.parse(JSON.stringify(UHN.SampleData.MASTER_SERIES.characters));
              }
            });
            localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(parsed));
            existing = JSON.stringify(parsed);
          }
        }
      }

      if (!existing || JSON.parse(existing).length === 0) {
        // Pre-populate with master series "WHO AM I?"
        const initialList = [JSON.parse(JSON.stringify(UHN.SampleData.MASTER_SERIES))];
        localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(initialList));
        localStorage.setItem(STORAGE_KEY_ACTIVE, UHN.SampleData.MASTER_SERIES.id);
      } else {
        // Ensure active series has full characters and enriched scenes
        const parsed = JSON.parse(existing);
        let modified = false;
        parsed.forEach(s => {
          if (!s.characters || s.characters.length === 0 || !s.characters[0].faceReference) {
            s.characters = JSON.parse(JSON.stringify(UHN.SampleData.MASTER_SERIES.characters));
            modified = true;
          }
          if (s.id === UHN.SampleData.MASTER_SERIES.id && s.episodes && s.episodes[0] && s.episodes[0].timelinePlan && !s.episodes[0].timelinePlan[0].characterRef) {
            s.episodes = JSON.parse(JSON.stringify(UHN.SampleData.MASTER_SERIES.episodes));
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(parsed));
        }
      }

      if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(UHN.Models.DEFAULT_SETTINGS));
      }
    } catch (e) {
      console.warn("Storage init warning:", e);
    }
  }

  function getAllSeries() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SERIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading series:", e);
      return [];
    }
  }

  function getSeries(id) {
    const list = getAllSeries();
    return list.find(s => s.id === id) || null;
  }

  function getActiveSeries() {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
    const list = getAllSeries();
    if (activeId) {
      const found = list.find(s => s.id === activeId);
      if (found) return found;
    }
    return list[0] || null;
  }

  function setActiveSeriesId(id) {
    localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    window.dispatchEvent(new CustomEvent("uhn:seriesChanged", { detail: { id } }));
  }

  function saveSeries(series) {
    if (!series || !series.id) return false;
    const list = getAllSeries();
    const idx = list.findIndex(s => s.id === series.id);
    series.lastModified = new Date().toISOString();
    
    if (idx >= 0) {
      list[idx] = series;
    } else {
      list.unshift(series);
    }
    
    localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("uhn:saved", { detail: { seriesId: series.id } }));
    return true;
  }

  function deleteSeries(id) {
    let list = getAllSeries();
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(list));
    
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (activeId === id) {
      if (list.length > 0) {
        setActiveSeriesId(list[0].id);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    }
    return true;
  }

  function duplicateSeries(id) {
    const original = getSeries(id);
    if (!original) return null;
    
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = "series_" + Date.now();
    copy.title = `${original.title} (Copy)`;
    copy.lastModified = new Date().toISOString();
    
    const list = getAllSeries();
    list.unshift(copy);
    localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(list));
    setActiveSeriesId(copy.id);
    return copy;
  }

  function getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return data ? { ...UHN.Models.DEFAULT_SETTINGS, ...JSON.parse(data) } : UHN.Models.DEFAULT_SETTINGS;
    } catch (e) {
      return UHN.Models.DEFAULT_SETTINGS;
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("uhn:settingsUpdated", { detail: settings }));
  }

  function exportBackupJSON() {
    const backup = {
      version: "1.0",
      brand: "@unseen_hummannature",
      exportedAt: new Date().toISOString(),
      series: getAllSeries(),
      settings: getSettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  function importBackupJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.series && Array.isArray(data.series)) {
        localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(data.series));
        if (data.settings) {
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.settings));
        }
        if (data.series.length > 0) {
          setActiveSeriesId(data.series[0].id);
        }
        return { success: true, count: data.series.length };
      }
      return { success: false, error: "Invalid backup format: missing series array" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function resetDefaults() {
    const initialList = [JSON.parse(JSON.stringify(UHN.SampleData.MASTER_SERIES))];
    localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(initialList));
    localStorage.setItem(STORAGE_KEY_ACTIVE, UHN.SampleData.MASTER_SERIES.id);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(UHN.Models.DEFAULT_SETTINGS));
    return true;
  }

  init();

  return {
    init,
    getAllSeries,
    getSeries,
    getActiveSeries,
    setActiveSeriesId,
    saveSeries,
    deleteSeries,
    duplicateSeries,
    getSettings,
    saveSettings,
    exportBackupJSON,
    importBackupJSON,
    resetDefaults
  };
})();
