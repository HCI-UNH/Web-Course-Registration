const API_BASE = "http://localhost:8005";

async function apiGet(path) {
  try {
    const resp = await fetch(API_BASE + path);
    if (!resp.ok) throw new Error(resp.status + " " + resp.statusText);
    return await resp.json();
  } catch (e) {
    showError("Could not reach API: " + e.message);
    return [];
  }
}

async function apiPost(path, body) {
  try {
    const resp = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      let detail = "";
      try { detail = (await resp.json()).detail; } catch (_) {}
      showError(detail || "Request failed: " + resp.status);
      return false;
    }
    clearError();
    return true;
  } catch (e) {
    showError("Could not reach API: " + e.message);
    return false;
  }
}

function showError(msg) { document.getElementById("error").textContent = msg; }
function clearError() { document.getElementById("error").textContent = ""; }

async function registerSection(sectionId) {
  if (await apiPost("/register", { section_id: sectionId })) {
    renderAll();
  }
}

async function dropSection(sectionId) {
  if (await apiPost("/drop", { section_id: sectionId })) {
    renderAll();
  }
}

function el(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

async function renderSections() {
  const container = document.getElementById("sections");
  const sections = await apiGet("/sections");
  container.replaceChildren();

  for (const s of sections) {
    const row = el("div");
    row.className = "row";
    row.appendChild(el("span",
      `${s.code} - ${s.title} - ${s.instructor} - ${s.meets} - ${s.seats_open}/${s.capacity} seats open`));

    if (s.you_enrolled) {
      const btn = el("button", "Drop");
      btn.onclick = () => dropSection(s.id);
      row.appendChild(btn);
    } else {
      const btn = el("button", "Register");
      btn.onclick = () => registerSection(s.id);
      row.appendChild(btn);
    }
    container.appendChild(row);
  }
}

async function renderSchedule() {
  const container = document.getElementById("schedule");
  const schedule = await apiGet("/my-schedule");
  container.replaceChildren();

  if (!schedule.length) {
    container.appendChild(el("div", "You aren't registered for anything yet."));
    return;
  }
  for (const s of schedule) {
    container.appendChild(el("div", `${s.code} - ${s.title} - ${s.meets}`));
  }
}

async function renderAnnouncements() {
  const container = document.getElementById("announcements");
  const announcements = await apiGet("/announcements");
  container.replaceChildren();

  for (const a of announcements) {
    container.appendChild(el("div", a.title));
    container.appendChild(el("div", a.body));
    container.appendChild(document.createElement("hr"));
  }
}

function renderAll() {
  renderSections();
  renderSchedule();
}

renderAll();
renderAnnouncements();