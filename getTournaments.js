import { writeFileSync } from 'fs'
import puppeteer from 'puppeteer'

const BASE_URL = 'https://mediagame.by'

const data = []

async function fetchTournaments(page,pageNumber) {
	await page.goto(`${BASE_URL}/tournaments?page=${pageNumber}`)

	const tournaments = await page.evaluate(() => {
		const cards = document.querySelectorAll('.card-vertical')
		const result = []

		cards.forEach(card => {
			const titleEl = card.querySelector('.card-title')
			const url = card?.getAttribute('href')

			const title = titleEl?.innerText.trim()

			if (title && url) {
				result.push({ tournament_name: title, url })
			}
		})

		return result
	})
	return tournaments
}

async function main() {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	const allTournaments = []

	for (let index = 1; index < 4; index++) {
		try {
			const tournaments = await fetchTournaments(page, index)
			allTournaments.push(...tournaments)
		} catch (err) {
			console.error(`Ошибка при парсинге страницы ${index}:`, err)
		}
	}
	await browser.close()
	writeFileSync(
		'tournaments.json',
		JSON.stringify(allTournaments, null, 2),
		'utf-8'
	)
}

main()
