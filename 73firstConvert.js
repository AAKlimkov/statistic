import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Пути к файлам
const mainDataPath = path.join(__dirname, '73first.json')
const statsDataPath = path.join(__dirname, '73second1st_with_date.json')
const outputPath = path.join(__dirname, 'mainData_fixed.json')

// Чтение и парсинг файлов
const mainDataRaw = await readFile(mainDataPath, 'utf-8')
const statsDataRaw = await readFile(statsDataPath, 'utf-8')

const mainData = JSON.parse(mainDataRaw)
const statsData = JSON.parse(statsDataRaw)

// Обработка и исправление дат
for (const tournament of mainData) {
	for (const session of tournament.sessions) {
		for (const game of session.games) {
			const gameId = game.gameId
			const statsKey = `Игра ${gameId}`
			const stats = statsData[statsKey]

			if (!stats || stats.length === 0) {
				console.warn(`Нет статистики для Игра №${gameId}`)
				continue
			}

			const correctDate = stats[0].date

			if (game.date !== correctDate) {
				console.log(
					`Исправлена дата для Игра №${gameId}: ${game.date} → ${correctDate}`
				)
				game.date = correctDate
			}
		}
	}
}

// Запись исправленного файла
await writeFile(outputPath, JSON.stringify(mainData, null, 2), 'utf-8')
console.log('✅ Даты обновлены и сохранены в mainData_fixed.json')
