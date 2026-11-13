// ----- Настройки SLA (часы на решение) -----
const settings = {
  slaHours: { critical: 4, high: 8, medium: 24, low: 72 }
};

// ----- Названия для интерфейса -----
const stageNames = { planning: "Планирование", setup: "Настройка", training: "Обучение", production: "Эксплуатация" };
const priorityNames = { critical: "Критический", high: "Высокий", medium: "Средний", low: "Низкий" };
const statusNames = { new: "Новый", in_progress: "В работе", resolved: "Решён" };
const slaNames = { on_track: "В срок", breached: "Нарушен", met: "Решён вовремя" };
const typeNames = { corrective: "Корректирующее", adaptive: "Адаптивное", perfective: "Совершенствующее", preventive: "Профилактическое" };
const requestStatusNames = { new: "Новая", planned: "Запланирована", done: "Выполнена" };

// ----- SLA -----
function getSlaState(incident, settings, now = Date.now()) {
  const hours = settings.slaHours[incident.priority];
  const created = new Date(incident.createdAt).getTime();
  const deadline = created + hours * 60 * 60 * 1000;

  if (incident.status === "resolved") {
    const resolved = new Date(incident.resolvedAt).getTime();
    return resolved <= deadline ? "met" : "breached";
  }
  return now > deadline ? "breached" : "on_track";
}

function getSlaPercent(incidents, settings) {
  const resolved = incidents.filter(item => item.status === "resolved");
  if (resolved.length === 0) return 100;
  const met = resolved.filter(item => getSlaState(item, settings) === "met");
  return Math.round((met.length / resolved.length) * 100);
}

// Сколько осталось до срока (или насколько просрочено)
function getSlaLeftText(incident, settings, now = Date.now()) {
  const hours = settings.slaHours[incident.priority];
  const deadline = new Date(incident.createdAt).getTime() + hours * 60 * 60 * 1000;

  if (incident.status === "resolved") {
    const resolved = new Date(incident.resolvedAt).getTime();
    return resolved <= deadline ? "решён в срок" : "решён с опозданием";
  }

  const diff = deadline - now;
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const text = h >= 24 ? Math.floor(h / 24) + " д " + (h % 24) + " ч" : h + " ч " + m + " мин";
  return diff >= 0 ? "осталось " + text : "просрочено на " + text;
}

// ----- Версии -----
function getNextVersion(current, level) {
  const parts = current.replace("v", "").split(".").map(Number);
  if (level === "major") return `v${parts[0] + 1}.0.0`;
  if (level === "minor") return `v${parts[0]}.${parts[1] + 1}.0`;
  return `v${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function getCurrentVersion() {
  const releases = loadData("releases", startReleases);
  return releases.length ? releases[releases.length - 1].version : "v1.0.0";
}

// ----- Новый номер записи (не повторяется даже после удаления) -----
function nextId(list, prefix, pad) {
  const max = list.reduce((m, item) => Math.max(m, Number(item.id.split("-")[1]) || 0), 0);
  return prefix + "-" + String(max + 1).padStart(pad, "0");
}

// ----- Помощники для таблиц -----
function makeBadge(text, cssClass) {
  const span = document.createElement("span");
  span.className = "badge " + cssClass;
  span.textContent = text;
  return span;
}

function makeCell(content) {
  const td = document.createElement("td");
  if (content instanceof Node) td.append(content);
  else td.textContent = content;
  return td;
}

function makeButton(text, handler, extraClass = "") {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = text;
  if (extraClass) btn.className = extraClass;
  btn.addEventListener("click", handler);
  return btn;
}

// ----- Уведомление-«тост» -----
function toast(message) {
  let box = document.querySelector("#toasts");
  if (!box) {
    box = document.createElement("div");
    box.id = "toasts";
    document.body.append(box);
  }
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  box.append(item);
  setTimeout(() => item.classList.add("out"), 2600);
  setTimeout(() => item.remove(), 3000);
}

// ----- Конфетти 🎉 -----
function confetti() {
  const emojis = ["🎉", "💖", "✨", "🌸", "⭐", "🎀"];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDelay = Math.random() * 0.6 + "s";
    piece.style.fontSize = 1 + Math.random() * 1.4 + "rem";
    document.body.append(piece);
    setTimeout(() => piece.remove(), 3200);
  }
}

// ----- Тема (работает на каждой странице) -----
const themeButton = document.querySelector("#themeButton");

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", theme);
});

// ----- Версия в шапке -----
const versionLabel = document.querySelector("#currentVersion");
if (versionLabel) versionLabel.textContent = getCurrentVersion();

// ----- Кнопка «Сбросить данные» внизу меню (удобно для тестов) -----
const sidebar = document.querySelector(".sidebar");
if (sidebar) {
  sidebar.append(makeButton("♻ Сбросить данные", () => {
    if (!confirm("Вернуть учебные данные и удалить всё, что вы добавили?")) return;
    ["deployments", "incidents", "requests", "releases"].forEach(key => localStorage.removeItem(key));
    location.reload();
  }, "reset-btn"));
}
