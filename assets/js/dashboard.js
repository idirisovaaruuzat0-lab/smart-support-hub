const dashDeployments = loadData("deployments", startDeployments);
const dashIncidents = loadData("incidents", startIncidents);
const dashRequests = loadData("requests", startRequests);

// ----- Плавный счётчик чисел -----
function animateNumber(element, target, suffix = "") {
  const start = performance.now();
  const duration = 900;
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    element.textContent = Math.round(target * t) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ----- 4 показателя -----
// Активное внедрение: то, что ещё не в эксплуатации
const activeCount = dashDeployments.filter(item => item.stage !== "production").length;
const openIncidents = dashIncidents.filter(item => item.status !== "resolved");
const breachedOpen = openIncidents.filter(item => getSlaState(item, settings) === "breached").length;

animateNumber(document.querySelector("#kpiDeployments"), activeCount);
animateNumber(document.querySelector("#kpiIncidents"), openIncidents.length);
animateNumber(document.querySelector("#kpiSla"), getSlaPercent(dashIncidents, settings), "%");
document.querySelector("#kpiVersion").textContent = getCurrentVersion();

// ----- Приветствие -----
const today = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
document.querySelector("#heroTitle").textContent = "Привет, команда поддержки!";
document.querySelector("#heroText").textContent =
  "Сегодня " + today + ". Открытых инцидентов: " + openIncidents.length +
  (breachedOpen > 0 ? ", из них с нарушенным SLA: " + breachedOpen + " 🔥" : ", все в срок 🌸");

// ----- Последние инциденты -----
const recent = document.querySelector("#recentIncidents");
[...dashIncidents].reverse().slice(0, 5).forEach(item => {
  const state = getSlaState(item, settings);
  const row = document.createElement("tr");
  row.append(
    makeCell(item.id),
    makeCell(item.title),
    makeCell(makeBadge(priorityNames[item.priority], item.priority)),
    makeCell(makeBadge(statusNames[item.status], item.status)),
    makeCell(makeBadge(slaNames[state], state))
  );
  recent.append(row);
});

// ----- Настройка Chart.js под тему -----
const bodyStyle = getComputedStyle(document.body);
Chart.defaults.color = bodyStyle.getPropertyValue("--text").trim();
Chart.defaults.borderColor = "rgba(255, 150, 215, 0.2)";
Chart.defaults.font.family = "Nunito, sans-serif";
const pinkColors = ["#ff5fa2", "#c77dff", "#ff9ad5", "#ec3f8c"];

// ----- График 1: инциденты по приоритетам (bar) -----
const levels = ["critical", "high", "medium", "low"];

new Chart(document.querySelector("#priorityChart"), {
  type: "bar",
  data: {
    labels: levels.map(level => priorityNames[level]),
    datasets: [{
      label: "Инциденты",
      data: levels.map(level => dashIncidents.filter(item => item.priority === level).length),
      backgroundColor: pinkColors,
      borderRadius: 10
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
  }
});

// ----- График 2: заявки по видам (doughnut) -----
const types = ["corrective", "adaptive", "perfective", "preventive"];

new Chart(document.querySelector("#requestChart"), {
  type: "doughnut",
  data: {
    labels: types.map(type => typeNames[type]),
    datasets: [{
      data: types.map(type => dashRequests.filter(item => item.type === type).length),
      backgroundColor: ["#ff5fa2", "#c77dff", "#ff9ad5", "#14b8a6"],
      borderWidth: 0
    }]
  }
});

// ----- График 3 (по желанию): динамика по дням -----
function dayKey(iso) {
  const d = new Date(iso);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

const created = {};
const solved = {};
dashIncidents.forEach(item => {
  const c = dayKey(item.createdAt);
  created[c] = (created[c] || 0) + 1;
  if (item.resolvedAt) {
    const r = dayKey(item.resolvedAt);
    solved[r] = (solved[r] || 0) + 1;
  }
});

const days = [...new Set([...Object.keys(created), ...Object.keys(solved)])].sort().slice(-10);

new Chart(document.querySelector("#dayChart"), {
  type: "line",
  data: {
    labels: days.map(day => day.slice(8, 10) + "." + day.slice(5, 7)),
    datasets: [
      {
        label: "Создано",
        data: days.map(day => created[day] || 0),
        borderColor: "#ff5fa2", backgroundColor: "rgba(255, 95, 162, 0.2)",
        fill: true, tension: 0.4, pointRadius: 5
      },
      {
        label: "Решено",
        data: days.map(day => solved[day] || 0),
        borderColor: "#c77dff", backgroundColor: "rgba(199, 125, 255, 0.2)",
        fill: true, tension: 0.4, pointRadius: 5
      }
    ]
  },
  options: { scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
});

// Перекрасить подписи графиков после смены темы
document.querySelector("#themeButton").addEventListener("click", () => location.reload());
