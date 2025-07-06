import { readFile, writeFile } from 'fs/promises'
import { read, utils } from 'xlsx'

async function parseExcelToJson(filePath) {
	const fileBuffer = await readFile(filePath)
	const workbook = read(fileBuffer)

	const games = [] // Все игры


	// Проходим по ВСЕМ листам (всего их 40)
	for (let sheetIndex = 1; sheetIndex < 23; sheetIndex++) {
		const sheetName = workbook.SheetNames[sheetIndex]

		const sheet = workbook.Sheets[sheetName]
		const rawData = utils.sheet_to_json(sheet, { header: 1 })

		const startIndex = 0 // Начало таблицы (фиксированное)
		if (!rawData[startIndex]) continue // Если данных нет, пропускаем лист
		const baseCol = 3
		// const gameData = rawData.slice(startIndex + 1, startIndex + 3)
		const dateRegex = /\d{2}\.\d{2}\.\d{4}/

		console.log(rawData[1])

		const match = rawData[1][0] ? rawData[1][0].match(dateRegex) : 'не найдено'

		if (match) {
			const date = match[0] // Извлекаем дату
			games.push(match[0])
			// console.log(date) // Выводим дату
		} else {
			games.push(sheetName)
			// console.log('Дата не найдена')
		}
		// console.log(rawData[0][0].match(dateRegex))

		// Собираем 5 игр с текущего листа
		// for (let gameNumber = 1; gameNumber <= 5; gameNumber++) {
		// 	const gameKey = `Игра ${730 + gameCounter++}`
		// 	games[gameKey] = []

		// 	const baseCol = 3 + (gameNumber - 1) * 6 // Смещение столбцов

		// 	const playersData = rawData.slice(startIndex + 1, startIndex + 11) // Берем 10 игроков

		// 	playersData.forEach(row => {
		// 		games[gameKey].push({
		// 			Игрок: row[1],
		// 			Роль: row[baseCol + 3],
		// 			'Баллы за победу': row[baseCol + 4] || 0,
		// 			'Баллы от судей': row[baseCol + 5] || 0,
		// 			ЛХ: row[baseCol + 7] || '—',
		// 			Си: row[baseCol + 8] || '—',
		// 			Инфо: row[baseCol + 6] || '—',
		// 			ППК: '—',
		// 			Удаления: '—',
		// 			ЖК: '—',
		// 			СК: '—',
		// 			'Дисц. штрафы': '—',
		// 		})
		// 	})
		// }
		// games.push(match[0] || 'не найден')
	}

	console.log(games)

	return games
}

// Запускаем парсинг
const filePath = 'Рейтинговый кубок 3 этап. Турнирная таблица.xlsx'

parseExcelToJson(filePath)
	.then(jsonData =>
		writeFile('output.json', JSON.stringify(jsonData, null, 2), 'utf8')
	)
	.then(() => console.log('JSON сохранен в output.json'))
	.catch(err => console.error('Ошибка:', err))
