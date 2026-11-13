let deployments = loadData("deployments", startDeployments);
const stageOrder = ["planning", "setup", "training", "production"];

function renderDeployments() {
  const tbody = document.querySelector("#deploymentTable");
  tbody.innerHTML = "";

  // сводка
  const average = deployments.length
    ? Math.round(deployments.reduce((sum, item) => sum + item.done / item.total, 0) / deployments.length * 100)
    : 0;
  document.querySelector("#depTotal").textContent = deployments.length;
  document.querySelector("#depActive").textContent = deployments.filter(item => item.stage !== "production").length;
  document.querySelector("#depAvg").textContent = average + "%";

  if (deployments.length === 0) {
    const row = document.createElement("tr");
    const cell = makeCell("Пока нет внедрений 🌸");
    cell.colSpan = 9;
    cell.className = "empty";
    row.append(cell);
    tbody.append(row);
    return;
  }

  deployments.forEach(item => {
    const percent = Math.round((item.done / item.total) * 100);

    const bar = document.createElement("div");
    bar.className = "progress";
    const fill = document.createElement("span");
    fill.style.width = percent + "%";
    bar.append(fill);

    const label = document.createElement("small");
    label.textContent = percent + "% (" + item.done + "/" + item.total + ")";

    const progressBox = document.createElement("div");
    progressBox.append(bar, label);

    // кнопки действий
    const actions = document.createElement("div");
    const nextBtn = makeButton("→ Этап", () => advanceStage(item.id));
    if (item.stage === "production") nextBtn.disabled = true;
    actions.append(nextBtn, " ", makeButton("🗑", () => deleteDeployment(item.id), "btn-danger"));

    const row = document.createElement("tr");
    row.append(
      makeCell(item.id),
      makeCell(item.client),
      makeCell(item.product),
      makeCell(item.version),
      makeCell(makeBadge(stageNames[item.stage], item.stage)),
      makeCell(item.owner),
      makeCell(item.plannedDate),
      makeCell(progressBox),
      makeCell(actions)
    );
    tbody.append(row);
  });
}

function advanceStage(id) {
  const item = deployments.find(deployment => deployment.id === id);
  const index = stageOrder.indexOf(item.stage);
  if (index >= stageOrder.length - 1) return;

  item.stage = stageOrder[index + 1];
  if (item.stage === "production") {
    item.done = item.total;
    confetti();
    toast("🚀 " + item.client + " запущен в эксплуатацию!");
  } else {
    toast("Этап: " + stageNames[item.stage]);
  }

  saveData("deployments", deployments);
  renderDeployments();
}

function deleteDeployment(id) {
  if (!confirm("Удалить внедрение " + id + "?")) return;
  deployments = deployments.filter(item => item.id !== id);
  saveData("deployments", deployments);
  renderDeployments();
  toast("Внедрение удалено");
}

document.querySelector("#deploymentForm").addEventListener("submit", event => {
  event.preventDefault();

  const client = document.querySelector("#client").value.trim();
  const product = document.querySelector("#product").value.trim();
  const stage = document.querySelector("#stage").value;
  const owner = document.querySelector("#owner").value.trim();
  const plannedDate = document.querySelector("#plannedDate").value;
  const done = Number(document.querySelector("#done").value);
  const total = Number(document.querySelector("#total").value);

  if (client === "" || product === "") {
    alert("Заполните заказчика и продукт");
    return;
  }
  if (!(total > 0) || done < 0 || done > total) {
    alert("Проверьте шаги: сделано не может быть больше, чем всего");
    return;
  }

  deployments.push({
    id: nextId(deployments, "DEP", 2),
    client: client,
    product: product,
    version: getCurrentVersion(),
    stage: stage,
    owner: owner || "-",
    plannedDate: plannedDate || "-",
    done: done,
    total: total
  });

  saveData("deployments", deployments);
  renderDeployments();
  event.target.reset();
  toast("Внедрение добавлено ✨");
});

renderDeployments();
