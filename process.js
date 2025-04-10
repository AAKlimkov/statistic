import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

const dataFolder = './data'
const outputFile = './combined_games.json'

const getSessionName = gameIndex => {
	if (gameIndex < 112) {
		return `Отбор ${Math.floor(gameIndex / 7) + 1}`
	} else if (gameIndex < 128) {
		return `Полуфинал ${Math.floor((gameIndex - 112) / 8) + 1}`
	} else {
		return 'Финал'
	}
}

const getGameNumber = gameIndex => {
	const qualifierTotalGames = 112
	const semifinalTotalGames = 16

	if (gameIndex < qualifierTotalGames) {
		return (gameIndex % 7) + 1
	} else if (gameIndex < qualifierTotalGames + semifinalTotalGames) {
		return ((gameIndex - qualifierTotalGames) % 8) + 1
	} else {
		return ((gameIndex - qualifierTotalGames - semifinalTotalGames) % 14) + 1
	}
}

const processFile = async fileName => {
	const filePath = path.join(dataFolder, fileName)
	const rawData = await readFile(filePath, 'utf-8')
	const json = JSON.parse(rawData)

	const allGames = []

	const gameKeys = Object.keys(json)
	let gameCounter = 0

	for (const gameKey of gameKeys) {
		const players = json[gameKey]

		const session = getSessionName(gameCounter)
		const number = getGameNumber(gameCounter)

		const updatedPlayers = players.map(player => ({
			...player,
			tournament: fileName.replace('.json', ''),
			session,
			number,
		}))

		allGames.push(...updatedPlayers)
		gameCounter++
	}

	return allGames
}

const main = async () => {
	const files = await readdir(dataFolder)
	const jsonFiles = files.filter(f => f.endsWith('.json'))

	const allGames = []

	for (const file of jsonFiles) {
		const tournamentGames = await processFile(file)
		allGames.push(...tournamentGames)
	}

	await writeFile(outputFile, JSON.stringify(allGames, null, 2), 'utf-8')
	console.log(
		`✅ Объединено ${allGames.length} записей из ${jsonFiles.length} турниров.`
	)
}

main().catch(console.error)
