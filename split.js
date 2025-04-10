import { readFile, writeFile } from 'fs'
import { join } from 'path'

const inputPath = join(__dirname, '73second2nd.json')
const outputPath = join(__dirname, 'output2.json')

// Читаем файл
readFile(inputPath, 'utf8', (err, data) => {
	if (err) {
		console.error('Ошибка при чтении файла:', err)
		return
	}

	try {
		const json = JSON.parse(data)
		const updatedJson = splitGames(json)

		// Записываем результат
		writeFile(outputPath, JSON.stringify(updatedJson, null, 2), 'utf8', err => {
			if (err) {
				console.error('Ошибка при записи файла:', err)
			} else {
				console.log('Файл успешно записан в output.json')
			}
		})
	} catch (e) {
		console.error('Ошибка при парсинге JSON:', e)
	}
})

// Функция обработки
function splitGames(data) {
	const result = {}

	Object.entries(data).forEach(([key, players]) => {
		if (players.length > 10) {
			result[key] = players.slice(0, 10)
			result[`Игра f${key.replace('Игра ', '')}`] = players.slice(10)
		} else {
			result[key] = players
		}
	})

	return result
}
