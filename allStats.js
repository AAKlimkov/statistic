import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataDir = join(__dirname, 'rawData')
const outputDir = join(__dirname, 'src', 'assets', 'data') // Папка для статистики

if (!existsSync(outputDir)) {
	mkdirSync(outputDir)
}

const processFile = (filePath, fileName) => {
	const gameData = JSON.parse(readFileSync(filePath, 'utf-8'))
	const playerStats = {}

	for (const game in gameData) {
		const results = gameData[game]
		results.forEach(player => {
			const name = player['Игрок']
			const role = player['Роль']
			const points = parseFloat(player['Баллы']) || 0
			const judgePoints = parseFloat(player['Баллы от судей']) || 0
			const win = player['Баллы за победу'] > 0
			const lh = parseInt(player['ЛХ']) || 0
			const si = parseInt(player['Си']) || 0
			const penalties =
				(parseInt(player['Удаления']) || 0) +
				(parseInt(player['ЖК']) || 0) +
				(parseInt(player['СК']) || 0)

			const ratingOld = parseInt(player['RatingOld']) || 1000
			const ratingNew = parseInt(player['RatingNew']) || ratingOld
			const ratingChange = ratingNew - ratingOld // Разница рейтинга

			if (!playerStats[name]) {
				playerStats[name] = {
					totalGames: 0,
					totalWins: 0,
					roleStats: {
						Мирный: {
							games: 0,
							wins: 0,
							points: [],
							judgePoints: [],
							bestWinStreak: 0,
							currentStreak: 0,
							ratingChanges: [],
						},
						Мафия: {
							games: 0,
							wins: 0,
							points: [],
							judgePoints: [],
							bestWinStreak: 0,
							currentStreak: 0,
							ratingChanges: [],
						},
						Дон: {
							games: 0,
							wins: 0,
							points: [],
							judgePoints: [],
							bestWinStreak: 0,
							currentStreak: 0,
							ratingChanges: [],
						},
						Шериф: {
							games: 0,
							wins: 0,
							points: [],
							judgePoints: [],
							bestWinStreak: 0,
							currentStreak: 0,
							ratingChanges: [],
						},
					},
					totalPoints: [],
					totalJudgePoints: [],
					totalLH: 0,
					totalSI: 0,
					totalPenalties: 0,
					ratingHistory: [], // История рейтинга
				}
			}

			playerStats[name].totalGames++
			playerStats[name].totalPoints.push(points)
			playerStats[name].totalJudgePoints.push(judgePoints)
			playerStats[name].totalLH += lh
			playerStats[name].totalSI += si
			playerStats[name].totalPenalties += penalties
			playerStats[name].ratingHistory.push(ratingNew) // Добавляем новый рейтинг в историю

			if (playerStats[name].roleStats[role]) {
				playerStats[name].roleStats[role].games++
				playerStats[name].roleStats[role].points.push(points)
				playerStats[name].roleStats[role].judgePoints.push(judgePoints)
				playerStats[name].roleStats[role].ratingChanges.push(ratingChange) // Добавляем изменение рейтинга по роли

				if (win) {
					playerStats[name].totalWins++
					playerStats[name].roleStats[role].wins++
					playerStats[name].roleStats[role].currentStreak++
					if (
						playerStats[name].roleStats[role].currentStreak >
						playerStats[name].roleStats[role].bestWinStreak
					) {
						playerStats[name].roleStats[role].bestWinStreak =
							playerStats[name].roleStats[role].currentStreak
					}
				} else {
					playerStats[name].roleStats[role].currentStreak = 0
				}
			}
		})
	}

	// Подсчёт средних значений и винрейтов
	for (const player in playerStats) {
		for (const role in playerStats[player].roleStats) {
			const stats = playerStats[player].roleStats[role]

			stats.winRate = stats.games
				? ((stats.wins / stats.games) * 100).toFixed(2)
				: 0
			stats.avgPoints = stats.points.length
				? (
						stats.points.reduce((a, b) => a + b, 0) / stats.points.length
				  ).toFixed(2)
				: 0
			stats.avgJudgePoints = stats.judgePoints.length
				? (
						stats.judgePoints.reduce((a, b) => a + b, 0) /
						stats.judgePoints.length
				  ).toFixed(2)
				: 0
		}
		playerStats[player].name = player
		playerStats[player].winRate = (
			(playerStats[player].totalWins / playerStats[player].totalGames) *
			100
		).toFixed(2)
		playerStats[player].avgPoints = (
			playerStats[player].totalPoints.reduce((a, b) => a + b, 0) /
			playerStats[player].totalPoints.length
		).toFixed(2)
		playerStats[player].avgJudgePoints = (
			playerStats[player].totalJudgePoints.reduce((a, b) => a + b, 0) /
			playerStats[player].totalJudgePoints.length
		).toFixed(2)
	}

	const outputFilePath = join(outputDir, `${fileName}`)
	writeFileSync(outputFilePath, JSON.stringify(playerStats, null, 2), 'utf-8')
	console.log(`✅ Статистика для ${fileName} сохранена в ${outputFilePath}`)
}

readdirSync(dataDir).forEach(file => {
	if (file.endsWith('.json')) {
		const filePath = join(dataDir, file)
		processFile(filePath, file)
	}
})
