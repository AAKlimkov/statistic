import fs from 'fs'

// Загрузка дат
const dates = [
	'31.01.2025',
	'01.02.2025',
	'02.02.2025',
	'07.02.2025',
	'08.02.2025',
	'09.02.2025',
	'14.02.2025',
	'15.02.2025',
	'16.02.2025',
	'21.02.2025',
	'22.02.2025',
	'23.02.2025',
	'01.03.2025',
	'02.03.2025',
	'08.03.2025',
	'09.03.2025',
	'22.03.2025',
	'23.03.2025',
	'29.03.2025',
	'30.03.2025',
]

// Загрузка файла с играми
const inputPath = './5el4th.json'
const outputPath = './5el4th_with_date.json'

const rawData = fs.readFileSync(inputPath, 'utf-8')
const games = JSON.parse(rawData)

const gameKeys = Object.keys(games)

let currentIndex = 0
let gameIndex = 0

for (let i = 0; i < dates.length; i++) {
	const date = dates[i]
	let gamesCount = 7

	// 17-я и 18-я дата → по 8 игр
	if (i === 16 || i === 17) {
		gamesCount = 8
	}

	for (
		let j = 0;
		j < gamesCount && gameIndex < gameKeys.length;
		j++, gameIndex++
	) {
		const key = gameKeys[gameIndex]
		games[key] = games[key].map(player => ({
			date,
			...player,
		}))
	}
}

// Сохраняем в новый файл
fs.writeFileSync(outputPath, JSON.stringify(games, null, 2), 'utf-8')

console.log(`✅ Даты успешно добавлены. Файл сохранён как: ${outputPath}`)

console.log(`Количество ключей: ${gameKeys.length}`)
