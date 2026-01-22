"use strict";

// Константа для переводу мс у дні (на випадок використання різниці дат)
const DAY_MS = 24 * 60 * 60 * 1000;

// Елементи DOM
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const durationInput = document.getElementById("duration");
const holidaysInput = document.getElementById("holidays");

const modeInputs = document.querySelectorAll('input[name="mode"]');

const warningBox = document.getElementById("warning");
const resultBox = document.getElementById("result");

const calculateBtn = document.getElementById("calculateBtn");
const clearBtn = document.getElementById("clearBtn");

// ------------------------- Допоміжні функції -------------------------

/**
 * Парсимо дату з input[type="date"] у об'єкт Date
 */
function parseDate(value) {
    if (!value) return null;
    // Додаємо T00:00:00, щоб уникнути проблем із часовими поясами
    return new Date(value + "T00:00:00");
}

/**
 * Перетворюємо Date у рядок YYYY-MM-DD
 */
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Отримуємо множину святкових дат у форматі "YYYY-MM-DD"
 */
function parseHolidays() {
    const text = holidaysInput.value.trim();
    const set = new Set();

    if (!text) return set;

    // Розділення по комі, пробілу або переносу рядка
    const parts = text.split(/[, \n\r;]+/).map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
        const d = parseDate(part);
        if (!isNaN(d.getTime())) {
            set.add(formatDate(d));
        }
    }
    return set;
}

/**
 * Рахуємо тривалість відпустки у днях (включно),
 * не враховуючи святкові дні.
 */
function calculateDuration(start, end, holidaysSet) {
    let days = 0;
    const current = new Date(start);

    while (current <= end) {
        const key = formatDate(current);
        if (!holidaysSet.has(key)) {
            days++;
        }
        current.setDate(current.getDate() + 1);
    }
    return days;
}

/**
 * Рухаємось вперед від start, поки не пройдемо duration днів відпустки
 * (включно, без святкових днів), повертаємо дату завершення.
 */
function calculateEndDate(start, duration, holidaysSet) {
    let remaining = duration;
    const current = new Date(start);

    while (true) {
        const key = formatDate(current);
        if (!holidaysSet.has(key)) {
            remaining--;
        }
        if (remaining <= 0) break;
        current.setDate(current.getDate() + 1);
    }

    return current;
}

/**
 * Рухаємось назад від end, поки не пройдемо duration днів відпустки
 * (включно, без святкових днів), повертаємо дату початку.
 */
function calculateStartDate(end, duration, holidaysSet) {
    let remaining = duration;
    const current = new Date(end);

    while (true) {
        const key = formatDate(current);
        if (!holidaysSet.has(key)) {
            remaining--;
        }
        if (remaining <= 0) break;
        current.setDate(current.getDate() - 1);
    }

    return current;
}

/**
 * Перевірка, чи дата припадає на неділю
 */
function isSunday(date) {
    return date.getDay() === 0; // 0 — неділя
}

/**
 * Оновлюємо попередження про неділю
 */
function showSundayWarnings(start, end) {
    const messages = [];

    if (start && isSunday(start)) {
        messages.push("⚠️ Дата початку відпустки припадає на неділю.");
    }
    if (end && isSunday(end)) {
        messages.push("⚠️ Дата завершення відпустки припадає на неділю.");
    }

    warningBox.innerHTML = messages.join("<br>");
}

/**
 * Отримуємо поточний режим розрахунку
 */
function getMode() {
    for (const input of modeInputs) {
        if (input.checked) return input.value; // "duration" | "end" | "start"
    }
    return "duration";
}

/**
 * Вмикаємо/вимикаємо потрібні поля згідно з режимом
 */
function updateModeUI() {
    const mode = getMode();

    // Спочатку все увімкнути
    startDateInput.disabled = false;
    endDateInput.disabled = false;
    durationInput.disabled = false;

    if (mode === "duration") {
        durationInput.disabled = true;
        durationInput.placeholder = "Буде обчислено";
    } else if (mode === "end") {
        endDateInput.disabled = true;
        endDateInput.placeholder = "Буде обчислено";
    } else if (mode === "start") {
        startDateInput.disabled = true;
        startDateInput.placeholder = "Буде обчислено";
    }

    // Очищуємо результати при зміні режиму
    resultBox.textContent = "";
    resultBox.className = "result";
    warningBox.textContent = "";
}

// ------------------------- Основна логіка -------------------------

function handleCalculate() {
    const mode = getMode();

    const startDate = parseDate(startDateInput.value);
    const endDate = parseDate(endDateInput.value);
    const duration = durationInput.value ? parseInt(durationInput.value, 10) : null;
    const holidaysSet = parseHolidays();

    // Очищаємо повідомлення
    resultBox.textContent = "";
    resultBox.className = "result";
    warningBox.textContent = "";

    // Загальна базова валідація
    if (mode === "duration") {
        if (!startDate || !endDate) {
            showError("Будь ласка, заповніть дати початку та завершення.");
            return;
        }
        if (endDate < startDate) {
            showError("Дата завершення не може бути раніше за дату початку.");
            return;
        }

        const days = calculateDuration(startDate, endDate, holidaysSet);
        durationInput.value = days;
        showSundayWarnings(startDate, endDate);
        showOk(
            `Тривалість відпустки: <strong>${days}</strong> дн(ів) (без урахування святкових дат).`
        );
    } else if (mode === "end") {
        if (!startDate || !duration || duration <= 0) {
            showError("Вкажіть дату початку та додатну тривалість відпустки.");
            return;
        }

        const end = calculateEndDate(startDate, duration, holidaysSet);
        endDateInput.value = formatDate(end);
        showSundayWarnings(startDate, end);
        showOk(
            `Дата завершення відпустки: <strong>${formatDate(end)}</strong>.`
        );
    } else if (mode === "start") {
        if (!endDate || !duration || duration <= 0) {
            showError("Вкажіть дату завершення та додатну тривалість відпустки.");
            return;
        }

        const start = calculateStartDate(endDate, duration, holidaysSet);
        startDateInput.value = formatDate(start);
        showSundayWarnings(start, endDate);
        showOk(
            `Дата початку відпустки: <strong>${formatDate(start)}</strong>.`
        );
    }
}

function showError(message) {
    resultBox.innerHTML = message;
    resultBox.className = "result result--error";
}

function showOk(message) {
    resultBox.innerHTML = message;
    resultBox.className = "result result--ok";
}

function handleClear() {
    startDateInput.value = "";
    endDateInput.value = "";
    durationInput.value = "";
    holidaysInput.value = "";
    resultBox.textContent = "";
    resultBox.className = "result";
    warningBox.textContent = "";
}

// ------------------------- Обробники подій -------------------------

modeInputs.forEach(input => {
    input.addEventListener("change", updateModeUI);
});

calculateBtn.addEventListener("click", handleCalculate);
clearBtn.addEventListener("click", handleClear);

// Ініціалізація
updateModeUI();
