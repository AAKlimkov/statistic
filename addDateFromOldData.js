import { readFile, writeFile } from 'fs/promises'

const datesPath = './filteredGames.json'
const tournamentPath = './tournaments-with-sessions-and-stats.json'

const updatedOutput = './updatedGames.json'
const notMatchedOutput = './notMatchedGames.json'
const unusedDatesOutput = './unusedDates.json'

async function enrichGamesWithDates() {
	const [datesRaw, tournamentRaw] = await Promise.all([
		readFile(datesPath, 'utf-8'),
		readFile(tournamentPath, 'utf-8'),
	])

	const gameDates = JSON.parse(datesRaw)
	const tournamentData = JSON.parse(tournamentRaw)

	const dateMap = new Map(gameDates.map(g => [g.gameId, g.date]))
	const usedGameIds = new Set()
	const unmatchedGames = []

	for (const tournament of tournamentData) {
		for (const session of tournament.sessions) {
			for (const game of session.games) {
				const date = dateMap.get(game.gameId)
				if (date) {
					game.date = date
					usedGameIds.add(game.gameId)
				} else {
					unmatchedGames.push(game)
				}
			}
		}
	}

	// Найти gameId из даты, которые не были использованы
	const unusedDates = gameDates.filter(g => !usedGameIds.has(g.gameId))

	await Promise.all([
		writeFile(updatedOutput, JSON.stringify(tournamentData, null, 2)),
		writeFile(notMatchedOutput, JSON.stringify(unmatchedGames, null, 2)),
		writeFile(unusedDatesOutput, JSON.stringify(unusedDates, null, 2)),
	])

	console.log('Файлы успешно созданы.')
}

enrichGamesWithDates().catch(console.error)
