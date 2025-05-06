import { readFileSync, writeFileSync } from 'fs'
import puppeteer from 'puppeteer'

async function fetchSessions(page, tournament_url) {
	await page.goto(tournament_url, { waitUntil: 'networkidle2' })

	const resultTab = await page.$('#nav-tab-results')
	if (resultTab) await resultTab.click()

	const sessions = await page.evaluate(url => {
		const sessionGroups = document.querySelectorAll('.btn-group')
		const result = []

		sessionGroups.forEach(session => {
			const button = session.querySelector('button[data-value]')
			const titleRaw = button?.innerText?.trim()
			const title = titleRaw?.replace('Toggle Dropdown', '').trim()
			const rawRelation = button?.getAttribute('data-value')
			const relationId = rawRelation?.split('-')[1]
			const gamesArr = []
			const games = session.querySelectorAll('.btn-secondary')

			games.forEach(game => {
				const title = game.querySelector('small')?.innerText?.trim()
				let gameId = game?.getAttribute('data-value')
				gameId = gameId ? gameId.split('-')[1] : null
				const gameUrl = gameId ? `${url}?tab=results&game=${gameId}` : null

				if (title && gameUrl) {
					gamesArr.push({ title, gameId, gameUrl })
				}
			})

			if (title && relationId) {
				result.push({
					title,
					url: `${url}?tab=results&series=${relationId}`,
					games: gamesArr,
				})
			}
		})

		return result
	}, tournament_url)

	return sessions
}

async function fetchGameStats(page, url) {
	await page.goto(url, { waitUntil: 'networkidle2' })

	return await page.evaluate(() => {
		const rows = document.querySelectorAll('table tbody tr')
		const gameResults = []
		rows.forEach(row => {
			const columns = row.querySelectorAll('td')
			if (columns.length > 0) {
				const scoreFromJudges = columns[5]?.innerText.trim()
				if (scoreFromJudges) {
					gameResults.push({
						Игрок: columns[1]?.innerText.trim() || '',
						Роль: columns[2]?.innerText.trim() || '',
						Баллы: columns[3]?.innerText.trim() || '',
						'Баллы за победу': columns[4]?.innerText.trim() || '',
						'Баллы от судей': scoreFromJudges,
						ЛХ: columns[6]?.innerText.trim() || '',
						Си: columns[7]?.innerText.trim() || '',
						Инфо: columns[8]?.innerText.trim() || '',
						ППК: columns[9]?.innerText.trim() || '',
						Удаления: columns[10]?.innerText.trim() || '',
						ЖК: columns[11]?.innerText.trim() || '',
						СК: columns[12]?.innerText.trim() || '',
						'Дисц. штрафы': columns[13]?.innerText.trim() || '',
					})
				}
			}
		})
		return gameResults
	})
}

async function main() {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	let tournaments = []
	const dates = JSON.parse(
		readFileSync('transformed-tournament-data.json', 'utf-8')
	)

	function findDate(tournamentName, sessionTitle) {
		return (
			dates.find(
				entry =>
					entry.tournament.toLowerCase() === tournamentName.toLowerCase() &&
					entry.session.trim().toLowerCase() ===
						sessionTitle.trim().toLowerCase()
			)?.date || null
		)
	}

	// Массив для хранения новых игр
	const newGames = []

	try {
		tournaments = JSON.parse(
			readFileSync('tournaments_with_dates 05_05.json', 'utf-8')
		)
	} catch {
		console.error('⚠️ Файл прогресса не найден или повреждён.')
		return
	}

	for (const tournament of tournaments) {
		console.log(`🏁 Турнир: ${tournament.tournament_name}`)
		if (tournament.isFinished) {
			console.log(
				`✅ Турнир уже завершён: ${tournament.tournament_name}, пропускаем.`
			)
			continue
		}
		if (
			typeof tournament.url !== 'string' ||
			!tournament.url.startsWith('http')
		) {
			console.warn(
				`⚠️ Пропущен турнир из-за некорректного URL: ${tournament.tournament_name} (${tournament.url})`
			)
			continue
		}

		try {
			const fetchedSessions = await fetchSessions(page, tournament.url)
			if (!tournament.sessions) tournament.sessions = []

			for (const fetchedSession of fetchedSessions) {
				let session = tournament.sessions.find(
					s => s.title === fetchedSession.title
				)

				if (!session) {
					const sessionDate = findDate(
						tournament.tournament_name,
						fetchedSession.title
					)
					session = { ...fetchedSession, date: sessionDate }
					tournament.sessions.push(session)
				} else if (!session.date) {
					session.date = findDate(tournament.tournament_name, session.title)
				}

				if (!session.games) session.games = []

				// Обработка каждой игры внутри сессии
				for (const fetchedGame of fetchedSession.games) {
					let game = session.games.find(g => g.gameUrl === fetchedGame.gameUrl)

					if (!game) {
						game = { ...fetchedGame, date: session.date }
						session.games.push(game)
					} else if (!game.date) {
						game.date = session.date
					}

					if (game.stats?.length) {
						console.log(`⏭ Пропуск: ${game.title}`)
						continue
					}

					try {
						console.log(`🎯 Обработка игры: ${game.title}`)
						const stats = await fetchGameStats(page, game.gameUrl)
						game.stats = stats

						// Добавление игры в массив новых игр (с сохранением структуры сессий)
						newGames.push({
							tournament: tournament.tournament_name,
							session: session.title,
							date: session.date,
							game: {
								title: game.title,
								gameId: game.gameId,
								gameUrl: game.gameUrl,
								stats,
							},
						})

						writeFileSync(
							'tournaments_with_dates 05_05.json',
							JSON.stringify(tournaments, null, 2),
							'utf-8'
						)
						console.log(`💾 Сохранено: ${game.title}`)
					} catch (gameErr) {
						console.error(`❌ Ошибка в игре ${fetchedGame.title}:`, gameErr)
					}
				}
			}
		} catch (tErr) {
			console.error(`❌ Ошибка в турнире ${tournament.tournament_name}:`, tErr)
		}
	}

	// Сохранение нового файла с играми с текущей датой
	const today = new Date()
	const day = String(today.getDate()).padStart(2, '0')
	const month = String(today.getMonth() + 1).padStart(2, '0')
	const dateString = `${day}_${month}`

	const filename = `newGames_${dateString}.json`

	// Сохранение нового файла с играми
	if (newGames.length > 0) {
		writeFileSync(filename, JSON.stringify(newGames, null, 2), 'utf-8')
		console.log(`📄 Файл с новыми играми сохранён: ${filename}`)
	} else {
		console.log('ℹ️ Новых игр не найдено.')
	}

	await browser.close()
	console.log('✅ Все игры обработаны.')
}

main()
