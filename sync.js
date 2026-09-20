/* ==========================================================================
   Cross-device sync. If config.js sets a SYNC_URL (a deployed Google Apps
   Script Web App), state is saved there so every device sees the same
   thing. Local storage always gets a copy too, so the site still works
   instantly and offline even if the sync call is slow or fails.
   ========================================================================== */

const SYNC = (() => {
  const LOCAL_KEY = "twoPlatesState";
  let saveTimer = null;

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLocal(state) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore (private browsing etc.) */
    }
  }

  async function loadRemote() {
    if (!SYNC_URL) return null;
    try {
      const res = await fetch(SYNC_URL, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data && typeof data === "object" ? data : null;
    } catch (e) {
      return null;
    }
  }

  function saveRemote(state) {
    if (!SYNC_URL) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      // text/plain avoids a CORS preflight, which Apps Script Web Apps don't handle
      fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(state)
      }).catch(() => {});
    }, 700);
  }

  function save(state) {
    saveLocal(state);
    saveRemote(state);
  }

  return { loadLocal, loadRemote, save, isConfigured: () => !!SYNC_URL };
})();
