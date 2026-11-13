let releases = loadData("releases", startReleases);
const levelSelect = document.querySelector("#relLevel");

function updateNextVersion() {
  const current = getCurrentVersion();
  document.querySelector("#curVer").textContent = current;
  document.querySelector("#nextVer").textContent = getNextVersion(current, levelSelect.value);
  document.querySelector("#currentVersion").textContent = current;
}

function renderReleases() {
  const box = document.querySelector("#releaseList");
  box.innerHTML = "";

  [...releases].reverse().forEach(release => {
    const card = document.createElement("div");
    card.className = "card release-card";

    const title = document.createElement("h3");
    title.append(release.version, makeBadge(release.level, release.level));
    const date = document.createElement("small");
    date.textContent = release.date;
    title.append(date);

    const list = document.createElement("ul");
    release.changes.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      list.append(li);
    });

    card.append(title, list);
    box.append(card);
  });
}

// Текст CHANGELOG.md из истории релизов
function buildChangelog() {
  return "# Changelog\n\n" + [...releases].reverse().map(release =>
    "## " + release.version + " - " + release.date + "\n" +
    release.changes.map(change => "- " + change).join("\n")
  ).join("\n\n") + "\n";
}

document.querySelector("#copyChangelog").addEventListener("click", () => {
  if (!navigator.clipboard) {
    toast("Копирование недоступно в этом браузере");
    return;
  }
  navigator.clipboard.writeText(buildChangelog())
    .then(() => toast("CHANGELOG скопирован 📋"))
    .catch(() => toast("Не удалось скопировать"));
});

levelSelect.addEventListener("change", updateNextVersion);

document.querySelector("#releaseForm").addEventListener("submit", event => {
  event.preventDefault();

  const changes = document.querySelector("#relChanges").value
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");

  if (changes.length === 0) {
    alert("Укажите хотя бы одно изменение");
    return;
  }

  const version = getNextVersion(getCurrentVersion(), levelSelect.value);

  releases.push({
    id: nextId(releases, "REL", 3),
    version: version,
    date: new Date().toISOString().slice(0, 10),
    level: levelSelect.value,
    changes: changes
  });

  saveData("releases", releases);
  renderReleases();
  updateNextVersion();
  event.target.reset();
  confetti();
  toast("📦 Выпущена версия " + version);
});

renderReleases();
updateNextVersion();
