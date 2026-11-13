// Учебные данные. Все названия и люди вымышленные.
// Время инцидентов считается от момента первого открытия сайта,
// поэтому на экране всегда видны все состояния SLA: в срок, нарушен, решён вовремя.
const ago = hours => new Date(Date.now() - hours * 3600000).toISOString();

const startDeployments = [
  { id: "DEP-01", client: "Колледж, учебная часть", product: "Система расписания", version: "v1.2.0", stage: "training", owner: "Иванов А.", plannedDate: "2026-11-20", done: 2, total: 3 },
  { id: "DEP-02", client: "Школа №5", product: "Электронный журнал", version: "v1.1.0", stage: "setup", owner: "Петрова М.", plannedDate: "2026-12-01", done: 1, total: 4 },
  { id: "DEP-03", client: "Библиотека", product: "Каталог книг", version: "v1.2.1", stage: "production", owner: "Сидоров К.", plannedDate: "2026-10-15", done: 5, total: 5 }
];

const startIncidents = [
  { id: "INC-001", title: "Не открывается отчёт", priority: "high", status: "in_progress", createdAt: ago(3), resolvedAt: null },
  { id: "INC-002", title: "Ошибка входа в систему", priority: "critical", status: "new", createdAt: ago(5), resolvedAt: null },
  { id: "INC-003", title: "Неверная дата в отчёте", priority: "medium", status: "resolved", createdAt: ago(30), resolvedAt: ago(20) },
  { id: "INC-004", title: "Опечатка в меню", priority: "low", status: "new", createdAt: ago(10), resolvedAt: null },
  { id: "INC-005", title: "Не сохраняется форма", priority: "high", status: "resolved", createdAt: ago(20), resolvedAt: ago(6) },
  { id: "INC-006", title: "Медленная загрузка таблицы", priority: "medium", status: "in_progress", createdAt: ago(2), resolvedAt: null }
];

const startRequests = [
  { id: "REQ-001", title: "Добавить экспорт отчёта в PDF", type: "perfective", status: "planned", targetVersion: "v1.3.0" },
  { id: "REQ-002", title: "Исправить ошибку открытия отчёта", type: "corrective", status: "done", targetVersion: "v1.2.1" },
  { id: "REQ-003", title: "Поддержка новой версии браузера", type: "adaptive", status: "new", targetVersion: "v1.3.0" },
  { id: "REQ-004", title: "Обновить устаревшую библиотеку", type: "preventive", status: "planned", targetVersion: "v1.2.2" }
];

const startReleases = [
  { id: "REL-004", version: "v1.2.0", date: "2026-10-20", level: "minor", changes: ["Добавлен модуль обучения", "Новый дизайн таблиц"] },
  { id: "REL-005", version: "v1.2.1", date: "2026-11-05", level: "patch", changes: ["Исправлено открытие отчёта", "Обновлено руководство пользователя"] }
];
