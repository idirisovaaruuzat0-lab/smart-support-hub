let requests = loadData("requests", startRequests);
const nextStatus = { new: "planned", planned: "done" };
let typeFilter = "all";

function renderRequests() {
  const tbody = document.querySelector("#requestTable");
  tbody.innerHTML = "";

  // счётчики по видам
  Object.keys(typeNames).forEach(type => {
    document.querySelector("#cnt-" + type).textContent =
      requests.filter(item => item.type === type).length;
  });

  const list = typeFilter === "all" ? requests : requests.filter(item => item.type === typeFilter);

  if (list.length === 0) {
    const row = document.createElement("tr");
    const cell = makeCell("Заявок нет 🌸");
    cell.colSpan = 6;
    cell.className = "empty";
    row.append(cell);
    tbody.append(row);
    return;
  }

  list.forEach(item => {
    const actions = document.createElement("div");
    if (nextStatus[item.status]) {
      actions.append(
        makeButton("→ " + requestStatusNames[nextStatus[item.status]], () => advanceRequest(item.id)),
        " "
      );
    }
    actions.append(makeButton("🗑", () => deleteRequest(item.id), "btn-danger"));

    const row = document.createElement("tr");
    row.append(
      makeCell(item.id),
      makeCell(item.title),
      makeCell(makeBadge(typeNames[item.type], item.type)),
      makeCell(makeBadge(requestStatusNames[item.status], item.status)),
      makeCell(item.targetVersion),
      makeCell(actions)
    );
    tbody.append(row);
  });
}

function advanceRequest(id) {
  const item = requests.find(request => request.id === id);
  item.status = nextStatus[item.status];
  saveData("requests", requests);
  renderRequests();
  if (item.status === "done") confetti();
  toast(id + ": " + requestStatusNames[item.status]);
}

function deleteRequest(id) {
  if (!confirm("Удалить заявку " + id + "?")) return;
  requests = requests.filter(item => item.id !== id);
  saveData("requests", requests);
  renderRequests();
  toast("Заявка удалена");
}

document.querySelector("#requestForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = document.querySelector("#reqTitle").value.trim();
  const type = document.querySelector("#reqType").value;
  const targetVersion = document.querySelector("#reqVersion").value.trim();

  if (title === "") {
    alert("Введите название заявки");
    return;
  }
  if (!/^v\d+\.\d+\.\d+$/.test(targetVersion)) {
    alert("Версия должна быть вида v1.3.0");
    return;
  }

  requests.push({
    id: nextId(requests, "REQ", 3),
    title: title,
    type: type,
    status: "new",
    targetVersion: targetVersion
  });

  saveData("requests", requests);
  renderRequests();
  event.target.reset();
  toast("Заявка создана ✨");
});

document.querySelector("#typeFilter").addEventListener("change", event => {
  typeFilter = event.target.value;
  renderRequests();
});

renderRequests();
