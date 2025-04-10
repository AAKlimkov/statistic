import fs from 'fs'

// Загрузка дат
const dates = [
	'14.04.2024',
	'21.04.2024',
	'03.05.2024',
	'04.05.2024',
	'05.05.2023',
]

// Кол-во игр на каждую дату
const gamesPerDayList = [10, 10, 6, 6, 6]

// Пути к файлам
const inputPath = './73second2nd.json'
const outputPath = './73second2nd_with_date_split.json'

// Чтение входного файла
const rawData = fs.readFileSync(inputPath, 'utf-8')
const originalGames = JSON.parse(rawData)

let gameIndex = 0
const resultGames = {}

// Извлекаем ключи исходных игр
const originalKeys = Object.keys(originalGames)

// Этап 1: Разделение игр по количеству игроков
originalKeys.forEach(gameKey => {
	const players = originalGames[gameKey]
	if (!players) return

	// Если больше 10 игроков — делим на две части
	if (players.length > 10) {
		// Первые 10 игроков с "f"
		resultGames[gameKey] = players.slice(10)
		const fKey = `Игра f${gameKey.replace('Игра ', '')}`
		// Остальные игроки без "f"
		resultGames[fKey] = players.slice(0, 10)
	} else {
		resultGames[gameKey] = players
	}
})

// Этап 2: Разделение игр на те, которые с "f", и те, которые без
const gamesWithoutF = Object.keys(resultGames).filter(key => !key.includes('f'))
const gamesWithF = Object.keys(resultGames).filter(key => key.includes('f'))

// Этап 3: Объединяем игры: сначала без "f", потом с "f"
const sortedKeys = [...gamesWithoutF, ...gamesWithF]

// Пересоздаём объект с отсортированными играми
const sortedResultGames = {}
sortedKeys.forEach(gameKey => {
	sortedResultGames[gameKey] = resultGames[gameKey]
})

// Этап 4: Добавление дат с учетом лимита игр на каждый день
let currentDateIndex = 0
let currentGamesForDate = 0 // Считаем, сколько игр добавлено на текущую дату

Object.keys(sortedResultGames).forEach(gameKey => {
	const players = sortedResultGames[gameKey]
	if (!players) return

	// Выбираем текущую дату из списка
	const date = dates[currentDateIndex]

	// Добавляем дату каждому игроку
	const playersWithDate = players.map(player => ({
		date,
		...player,
	}))

	// Обновляем игру с добавленными датами
	sortedResultGames[gameKey] = playersWithDate

	// Увеличиваем счетчик игр на текущую дату
	currentGamesForDate++

	// Если количество игр на текущую дату достигло лимита, переходим к следующей дате
	if (currentGamesForDate >= gamesPerDayList[currentDateIndex]) {
		currentDateIndex++
		currentGamesForDate = 0 // Сбрасываем счетчик для следующей даты
	}
})

// Сохраняем результат
fs.writeFileSync(
	outputPath,
	JSON.stringify(sortedResultGames, null, 2),
	'utf-8'
)

console.log(
	`✅ Даты добавлены и игры разделены. Файл сохранён в: ${outputPath}`
)
console.log(
	`📦 Было игр: ${originalKeys.length}, Стало: ${
		Object.keys(sortedResultGames).length
	}`
)
