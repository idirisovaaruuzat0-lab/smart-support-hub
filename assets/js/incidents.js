let incidents = loadData("incidents", startIncidents);
let currentFilter = "all";
let currentSearch = "";

function renderIncidents() {
  const tbody = document.querySelector("#incidentTable");
  tbody.innerHTML = "";

  // счётчики
  document.querySelector("#cntAll").textContent = incidents.length;
  document.querySelector("#cntNew").textContent = incidents.filter(item => item.status === "new").length;
  document.querySelector("#cntProgress").textContent = incidents.filter(item => item.status === "in_progress").length;
  document.querySelector("#cntResolved").textContent = incidents.filter(item => item.status === "resolved").length;
  document.querySelector("#cntBreached").textContent =
    incidents.filter(item => getSlaState(item, settings) === "breached").length;

  // фильтр по статусу и поиск
  const list = incidents
    .filter(item => currentFilter === "all" || item.status === currentFilter)
    .filter(item => (item.id + " " + item.title).toLowerCase().includes(currentSearch));

  if (list.length === 0) {
    const row = document.createElement("tr");
    const cell = makeCell("Ничего не найдено 🌸");
    cell.colSpan = 7;
    cell.className = "empty";
    row.append(cell);
    tbody.append(row);
    return;
  }

  list.forEach(item => {
    const state = getSlaState(item, settings);

    // кнопки действий
    const actions = document.createElement("div");
    if (item.status === "new") {
      actions.append(makeButton("В работу", () => startIncident(item.id)), " ");
    }
    if (item.status !== "resolved") {
      actions.append(makeButton("Решить", () => resolveIncident(item.id)), " ");
    }
    actions.append(makeButton("🗑", () => deleteIncident(item.id), "btn-danger"));

    const left = document.createElement("small");
    left.textContent = getSlaLeftText(item, settings);

    const row = document.createElement("tr");
    row.append(
      makeCell(item.id),
      makeCell(item.title),
      makeCell(makeBadge(priorityNames[item.priority], item.priority)),
      makeCell(makeBadge(statusNames[item.status], item.status)),
      makeCell(makeBadge(slaNames[state], state)),
      makeCell(left),
      makeCell(actions)
    );
    tbody.append(row);
  });
}

function startIncident(id) {
  const item = incidents.find(incident => incident.id === id);
  item.status = "in_progress";
  saveData("incidents", incidents);
  renderIncidents();
  toast("Инцидент " + id + " взят в работу");
}

function resolveIncident(id) {
  const item = incidents.find(incident => incident.id === id);
  item.status = "resolved";
  item.resolvedAt = new Date().toISOString();
  saveData("incidents", incidents);
  renderIncidents();
  confetti();
  toast("🎉 " + id + ": " + slaNames[getSlaState(item, settings)]);
}

function deleteIncident(id) {
  if (!confirm("Удалить инцидент " + id + "?")) return;
  incidents = incidents.filter(item => item.id !== id);
  saveData("incidents", incidents);
  renderIncidents();
  toast("Инцидент удалён");
}

document.querySelector("#incidentForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = document.querySelector("#title").value.trim();
  const priority = document.querySelector("#priority").value;

  if (title === "") {
    alert("Введите описание инцидента");
    return;
  }

  incidents.push({
    id: nextId(incidents, "INC", 3),
    title: title,
    priority: priority,
    status: "new",
    createdAt: new Date().toISOString(),
    resolvedAt: null
  });

  saveData("incidents", incidents);
  renderIncidents();
  event.target.reset();
  toast("Инцидент создан, срок: " + settings.slaHours[priority] + " ч");
});

document.querySelector("#statusFilter").addEventListener("change", event => {
  currentFilter = event.target.value;
  renderIncidents();
});

document.querySelector("#search").addEventListener("input", event => {
  currentSearch = event.target.value.trim().toLowerCase();
  renderIncidents();
});

renderIncidents();
// обновлять «осталось ...» раз в минуту
setInterval(renderIncidents, 60000);
