import fs from 'fs'

// Загружаем данные
const tournaments = JSON.parse(fs.readFileSync('updatedGames.json', 'utf-8'))
const dates = JSON.parse(
	fs.readFileSync('transformed-tournament-data.json', 'utf-8')
)

const dateLog = []

// Функция поиска даты
function findDate(tournamentName, sessionTitle) {
	console.log(tournamentName)
	return (
		dates.find(
			entry =>
				entry.tournament.toLowerCase() === tournamentName.toLowerCase() &&
				sessionTitle.includes(entry.session)
		)?.date || null
	)
}

// Основной цикл обработки
for (const tournament of tournaments) {
	for (const session of tournament.sessions) {
		const date = findDate(tournament.tournament_name, session.title)
		if (date) {
			for (const game of session.games) {
				game.date = date

				// Логируем добавление
				dateLog.push({
					tournament: tournament.tournament_name,
					session: session.title,
					gameTitle: game.title,
					gameId: game.gameId,
					addedDate: date,
				})
			}
		}
	}
}

// Сохраняем основной файл
fs.writeFileSync(
	'tournaments_with_dates.json',
	JSON.stringify(tournaments, null, 2),
	'utf-8'
)

// Сохраняем лог
fs.writeFileSync('date_log.json', JSON.stringify(dateLog, null, 2), 'utf-8')

console.log('✅ Даты добавлены.')
console.log('📄 Результат сохранён в tournaments_with_dates.json')
console.log('📝 Лог сохранён в date_log.json')
