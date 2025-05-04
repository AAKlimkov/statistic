import { readFileSync, writeFileSync } from 'fs'
import puppeteer from 'puppeteer'

async function fetchSessions(page, tournament_url) {
	await page.goto(tournament_url, { waitUntil: 'networkidle2' })

	// Кликаем по вкладке "Результаты"
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
					gamesArr.push({ title, gameUrl })
				} else {
					console.error('Ошибка при формировании URL игры', { title, gameId })
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

async function main() {
	const tournaments = JSON.parse(readFileSync('tournaments.json', 'utf-8'))

	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	for (const tournament of tournaments) {
		try {
			console.log(tournament.url)

			const sessions = await fetchSessions(page, tournament.url)
			tournament.sessions = sessions
			console.log(`✅ Сессии добавлены: ${tournament.tournament_name}`)
		} catch (err) {
			console.error(`❌ Ошибка в турнире ${tournament.tournament_name}:`, err)
		}
	}

	await browser.close()

	writeFileSync(
		'tournaments-with-sessions2.json',
		JSON.stringify(tournaments, null, 2),
		'utf-8'
	)
}

main()
