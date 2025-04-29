import { readFile, writeFile } from 'fs/promises'

const inputFile = './players_with_game_names.json'
const outputFile = './players_final.json'

const main = async () => {
	const raw = await readFile(inputFile, 'utf-8')
	const data = JSON.parse(raw)

	let minusOneCount = 0

	const updated = data.map(player => {
		const updatedPlayer = { ...player }

		// Добавляем дату, если отсутствует
		if (!updatedPlayer.date || updatedPlayer.date.trim() === '') {
			updatedPlayer.date = '07.12.2024'
		}

		// Заменяем "Неизвестная сессия" на "Финал"
		if (updatedPlayer.session === 'Неизвестная сессия') {
			updatedPlayer.session = 'Финал'
		}

		// Заменяем number: -1 последовательно на 19...24
		if (updatedPlayer.number === -1 && minusOneCount < 60) {
			const group = Math.floor(minusOneCount / 10) // 0...5
			updatedPlayer.number = 19 + group
			minusOneCount++
		}

		return updatedPlayer
	})

	await writeFile(outputFile, JSON.stringify(updated, null, 2), 'utf-8')
	console.log(
		`✅ Обновлено ${updated.length} записей. Обработано ${minusOneCount} записей с number: -1. Сохранено в ${outputFile}`
	)
}

main().catch(console.error)
