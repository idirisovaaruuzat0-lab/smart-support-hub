# Smart Support Hub

Учебная веб-панель команды поддержки программного продукта.
Внедрения, инциденты с контролем SLA, заявки на сопровождение, релизы и дашборд с графиками.

**Сайт:** https://ВАШ_НИК.github.io/smart-support-hub/

## Возможности
- **Панель**: 4 показателя, графики Chart.js (инциденты по приоритетам, заявки по видам, динамика по дням)
- **Внедрения**: этап и процент готовности, добавление, переход к следующему этапу
- **Инциденты**: приоритет, статус, срок SLA с обратным отсчётом, поиск и фильтр по статусу
- **Заявки**: четыре вида сопровождения (корректирующее, адаптивное, совершенствующее, профилактическое)
- **Релизы**: история версий, подсказка следующей версии, копирование CHANGELOG
- Тёмная и светлая темы, адаптивная вёрстка (1366, 768, 390 px)
- Данные хранятся в браузере (localStorage)

## Технологии
HTML5, CSS3, JavaScript, localStorage, Chart.js, GitHub Pages

## Структура
```
smart-support-hub/
├── index.html, deployments.html, incidents.html, maintenance.html, releases.html
├── assets/css/style.css
├── assets/js/ (data, storage, utils, dashboard, deployments, incidents, maintenance, releases)
├── docs/USER_GUIDE.md
├── CHANGELOG.md
└── README.md
```

## Запуск
Открыть папку в VS Code и запустить Live Server на index.html.

## Документация
- [Руководство пользователя](docs/USER_GUIDE.md)
- [Список изменений](CHANGELOG.md)

Все названия и люди в учебных данных вымышленные.
