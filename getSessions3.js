import { readFileSync, writeFileSync } from 'fs'
import puppeteer from 'puppeteer'

async function fetchSessions(page, tournament_url) {
	await page.goto(tournament_url, { waitUntil: 'networkidle2' })

	const resultTab = await page.$('#nav-tab-results')
	if (resultTab) {
		await resultTab.click()
	}

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
					gamesArr.push({ title, gameUrl, gameId })
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

async function fetchGameStats(page, gameUrl) {
	await page.goto(gameUrl, { waitUntil: 'networkidle2' })

	const extractData = async () => {
		return await page.evaluate(() => {
			const rows = document.querySelectorAll('table tbody tr')
			let gameResults = []
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

	let data = []
	for (let attempt = 1; attempt <= 3; attempt++) {
		data = await extractData()
		if (data.length > 0) break
		await page.reload({ waitUntil: 'networkidle2' })
	}
	return data
}

async function main() {
	const tournaments = JSON.parse(readFileSync('tournaments.json', 'utf-8'))
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	for (const tournament of tournaments) {
		try {
			console.log(`🔎 Обработка турнира: ${tournament.url}`)
			const sessions = await fetchSessions(page, tournament.url)

			for (const session of sessions) {
				for (const game of session.games) {
					const stats = await fetchGameStats(page, game.gameUrl)
					game.stats = stats
					console.log(
						`  ✅ Данные игры ${game.title} собраны (${stats.length} записей)`
					)
				}
			}

			tournament.sessions = sessions
			console.log(
				`✅ Сессии и статистика добавлены: ${tournament.tournament_name}`
			)
		} catch (err) {
			console.error(`❌ Ошибка в турнире ${tournament.tournament_name}:`, err)
		}
	}

	await browser.close()

	writeFileSync(
		'tournaments-with-sessions-and-stats.json',
		JSON.stringify(tournaments, null, 2),
		'utf-8'
	)
	console.log('🎉 Данные сохранены в tournaments-with-sessions-and-stats.json')
}

main()
