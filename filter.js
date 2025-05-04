import { readFile, writeFile } from 'fs/promises'

const inputPath = './players_with_game_names.json'
const outputPath = './filteredGames.json'

async function processGames() {
	const data = await readFile(inputPath, 'utf-8')
	const rawData = JSON.parse(data)

	const uniqueGames = Array.from(
		new Map(
			rawData.map(item => {
				const gameId = item.name.match(/\d+/)?.[0] || '' // извлекаем только число
				return [gameId, { date: item.date, gameId }]
			})
		).values()
	)

	await writeFile(outputPath, JSON.stringify(uniqueGames, null, 2), 'utf-8')
	console.log(`Saved ${uniqueGames.length} unique games to ${outputPath}`)
}

processGames().catch(console.error)
