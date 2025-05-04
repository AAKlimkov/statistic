import { readFileSync, writeFileSync } from 'fs'
import { launch } from 'puppeteer'

const tournaments = JSON.parse(
	readFileSync('tournaments-with-sessions-and-games.json', 'utf-8')
)
;(async () => {
	const browser = await launch({ headless: true })
	const fullResults = []

	for (const tournament of tournaments) {
		const tournamentBlock = {
			tournament_name: tournament.tournament_name,
			url: tournament.url,
			sessions: [],
		}

		for (const session of tournament.sessions) {
			const sessionBlock = {
				title: session.title,
				url: session.url,
				games: [],
			}

			for (const game of session.games) {
				const gameIdMatch = game.url.match(/game=(\d+)/)
				if (!gameIdMatch) continue

				const gameId = gameIdMatch[1]
				const gamePage = await browser.newPage()
				await gamePage.goto(game.url, { waitUntil: 'networkidle2' })

				const extractData = async () => {
					return await gamePage.evaluate(() => {
						const rows = document.querySelectorAll('table tbody tr')
						const result = []

						rows.forEach(row => {
							const cells = row.querySelectorAll('td')
							if (cells.length > 0 && cells[5]?.innerText.trim()) {
								result.push({
									Игрок: cells[1]?.innerText.trim() || '',
									Роль: cells[2]?.innerText.trim() || '',
									Баллы: cells[3]?.innerText.trim() || '',
									'Баллы за победу': cells[4]?.innerText.trim() || '',
									'Баллы от судей': cells[5]?.innerText.trim() || '',
									ЛХ: cells[6]?.innerText.trim() || '',
									Си: cells[7]?.innerText.trim() || '',
									Инфо: cells[8]?.innerText.trim() || '',
									ППК: cells[9]?.innerText.trim() || '',
									Удаления: cells[10]?.innerText.trim() || '',
									ЖК: cells[11]?.innerText.trim() || '',
									СК: cells[12]?.innerText.trim() || '',
									'Дисц. штрафы': cells[13]?.innerText.trim() || '',
								})
							}
						})

						return result
					})
				}

				let players = []
				for (let attempt = 1; attempt <= 3; attempt++) {
					players = await extractData()
					if (players.length > 0) break
					console.log(`Повторная попытка ${attempt} для игры ${gameId}`)
					await gamePage.reload({ waitUntil: 'networkidle2' })
				}

				await gamePage.close()

				if (players.length > 0) {
					sessionBlock.games.push({
						title: game.title,
						url: game.url,
						gameId,
						players,
					})
					console.log(`✅ Сохранил игру ${gameId}`)
				} else {
					console.log(`⚠️ Пропущена пустая игра ${gameId}`)
				}
			}

			tournamentBlock.sessions.push(sessionBlock)
		}

		fullResults.push(tournamentBlock)
	}

	await browser.close()
	writeFileSync(
		'full_game_stats.json',
		JSON.stringify(fullResults, null, 2),
		'utf-8'
	)
	console.log(`🎉 Данные успешно сохранены в full_game_stats.json`)
})()
