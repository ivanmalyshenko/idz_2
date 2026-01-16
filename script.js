<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Калькулятор відпустки</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="app">
    <h1>Калькулятор відпустки</h1>

    <p class="subtitle">
        Оберіть, що потрібно порахувати, заповніть два інші параметри,
        вкажіть (за бажанням) святкові дні — і натисніть «Розрахувати».
    </p>

    <div class="card">
        <fieldset class="mode">
            <legend>Режим розрахунку</legend>
            <label>
                <input type="radio" name="mode" value="duration" checked>
                Обчислити тривалість
            </label>
            <label>
                <input type="radio" name="mode" value="end">
                Обчислити дату завершення
            </label>
            <label>
                <input type="radio" name="mode" value="start">
                Обчислити дату початку
            </label>
        </fieldset>

        <div class="form-grid">
            <div class="field">
                <label for="startDate">Дата початку відпустки</label>
                <input type="date" id="startDate">
            </div>

            <div class="field">
                <label for="endDate">Дата завершення відпустки</label>
                <input type="date" id="endDate">
            </div>

            <div class="field">
                <label for="duration">Тривалість (днів)</label>
                <input type="number" id="duration" min="1" placeholder="Напр. 14">
            </div>
        </div>

        <div class="field">
            <label for="holidays">
                Святкові дні (не враховуються у відпустку)
                <span class="hint">формат: YYYY-MM-DD, через кому</span>
            </label>
            <input
                type="text"
                id="holidays"
                placeholder="Напр.: 2025-01-01, 2025-01-07, 2025-03-08"
            >
        </div>

        <div id="warning" class="warning"></div>

        <div class="buttons">
            <button id="calculateBtn" class="btn">Розрахувати</button>
            <button id="clearBtn" class="btn btn-secondary">Очистити</button>
        </div>

        <div id="result" class="result"></div>
    </div>

    <p class="footer-note">
        * Дати початку та завершення враховуються <strong>включно</strong>. Святкові дні не
        входять до тривалості відпустки.
    </p>
</div>

<script src="script.js"></script>
</body>
</html>
