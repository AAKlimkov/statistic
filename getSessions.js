import { writeFileSync } from 'fs'
import puppeteer from 'puppeteer'

async function fetchSessions(page, tournament_url) {
	await page.goto(tournament_url, { waitUntil: 'networkidle2' })

	// Кликаем по вкладке "Результаты"
	const resultTab = await page.waitForSelector('#nav-tab-results')
	await resultTab.click()

	const sessions = await page.evaluate(url => {
		const sessionGroups = document.querySelectorAll('.btn-group')
		const result = []

		sessionGroups.forEach(session => {
			const button = session.querySelector('button[data-value]')
			const titleRaw = button?.innerText?.trim()
			const title = titleRaw?.replace('Toggle Dropdown', '').trim()
			const rawRelation = button?.getAttribute('data-value')
			const relationId = rawRelation?.split('-')[1]

			const sessionCards = document.querySelectorAll('.btn-secondary')
			sessionCards.forEach(session => {
				const title = session.querySelector('.game-title')?.innerText?.trim()
				const gameUrl = session.querySelector('a')?.getAttribute('href') // Ссылка на игру

				if (title && gameUrl) {
					result.push({
						title,
						url: `https://mediagame.by${gameUrl}`, // полная ссылка на игру
					})
				}
			})

			if (title && relationId) {
				result.push({
					title,
					url: `${url}?tab=results&series=${relationId}`,
				})
			}
		})

		return result
	}, tournament_url)

	return sessions
}

async function main() {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	const allSessions = []

	try {
		const sessions = await fetchSessions(
			page,
			'https://mediagame.by/tournament/otkrytaia-sreda-20'
		)
		allSessions.push(sessions)
	} catch (err) {
		console.error(`Ошибка при парсинге страницы ${1}:`, err)
	}

	await browser.close()

	writeFileSync(
		'tournaments-with-sessions-and-games.json',
		JSON.stringify(allSessions, null, 2),
		'utf-8'
	)
}

main()
