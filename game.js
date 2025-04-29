import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

// Путь к файлам с "Игра N"
const dataFolder = './with data'
// Файл с основным массивом игроков
const mainArrayFile = './allGames.json'
// Файл с результатом
const outputFile = './players_with_game_names.json'

// Сравнение двух игроков по ключевым полям
const isSamePlayer = (a, b) => {
	return (
		a['Игрок'] === b['Игрок'] &&
		a['Роль'] === b['Роль'] &&
		a['Баллы'] === b['Баллы'] &&
		a['Баллы за победу'] === b['Баллы за победу'] &&
		a['Баллы от судей'] === b['Баллы от судей'] &&
		a['date'] === b['date']
	)
}

const main = async () => {
	// Загружаем основной массив
	const rawMain = await readFile(mainArrayFile, 'utf-8')
	const mainArray = JSON.parse(rawMain)

	// Читаем все JSON-файлы из папки
	const files = await readdir(dataFolder)
	const jsonFiles = files.filter(f => f.endsWith('.json'))

	// Собираем все данные из файлов в формате [{ gameName, players }]
	const allGames = []

	for (const file of jsonFiles) {
		const filePath = path.join(dataFolder, file)
		const content = JSON.parse(await readFile(filePath, 'utf-8'))

		for (const [gameName, players] of Object.entries(content)) {
			allGames.push({ gameName, players })
		}
	}

	// Проходим по основному массиву игроков
	for (const player of mainArray) {
		for (const { gameName, players } of allGames) {
			const match = players.find(p => isSamePlayer(p, player))
			if (match) {
				player.name = gameName
				break
			}
		}
	}

	// Записываем результат
	await writeFile(outputFile, JSON.stringify(mainArray, null, 2), 'utf-8')
	console.log(`✅ Добавлено название игры для ${mainArray.length} игроков.`)
}

main().catch(console.error)
