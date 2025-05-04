import { readFileSync, writeFileSync } from 'fs'
import puppeteer from 'puppeteer'

async function fetchGames(page, sessionUrl, tournamentUrl) {
	// Переходим по ссылке на сессию
	await page.goto(sessionUrl, { waitUntil: 'networkidle2' })

	// Собираем игры с текущей страницы
	const games = await page.evaluate(tournamentUrl => {
		const gameButtons = document.querySelectorAll(
			'.dropdown-menu .btn-secondary'
		)
		const result = []

		gameButtons.forEach(button => {
			const title = button.querySelector('small')?.innerText?.trim()
			let gameId = button?.getAttribute('data-value')
			gameId = gameId ? gameId.split('-')[1] : null

			const url = gameId ? `${tournamentUrl}?tab=results&game=${gameId}` : null

			if (title && url) {
				result.push({ title, url })
			} else {
				console.error('Ошибка при формировании URL игры', { title, gameId })
			}
		})

		return result
	}, tournamentUrl) // Передаем tournamentUrl внутрь evaluate

	return games
}

async function main() {
	// Читаем файл с турнирами и сессиями
	const tournaments = JSON.parse(
		readFileSync('tournaments-with-sessions.json', 'utf-8')
	)
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	for (const tournament of tournaments) {
		for (const session of tournament.sessions) {
			try {
				// ✅ Передаём tournament.url
				const games = await fetchGames(page, session.url, tournament.url)
				session.games = games
				console.log(`✅ Игры добавлены для сессии: ${session.title}`)
			} catch (err) {
				console.error(
					`❌ Ошибка в сессии ${session.title} турнира ${tournament.tournament_name}:`,
					err
				)
			}
		}
	}

	await browser.close()

	// Сохраняем обновлённый файл
	writeFileSync(
		'tournaments-with-sessions-and-games.json',
		JSON.stringify(tournaments, null, 2),
		'utf-8'
	)
}

main()
