/* ==========================================================================
   Cross-device sync. If config.js sets a SYNC_URL (a free Firebase Realtime
   Database URL — see README.md "Turn on syncing"), state is saved there so
   every device sees the same thing. No server code to write or deploy,
   just a URL. Local storage always gets a copy too, so the site still works
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

  // Firebase Realtime Database's REST API reads/writes a path by appending
  // ".json" to it — this app stores everything under a single "state" node.
  function stateUrl() {
    return `${SYNC_URL.replace(/\/$/, "")}/state.json`;
  }

  async function loadRemote() {
    if (!SYNC_URL) return null;
    try {
      const res = await fetch(stateUrl(), { cache: "no-store" });
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
      fetch(stateUrl(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
