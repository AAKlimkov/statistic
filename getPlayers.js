import { writeFileSync } from 'fs'
import puppeteer from 'puppeteer'

async function fetchAllPlayers(page, url) {
	const players = []
	await page.goto(url, { waitUntil: 'networkidle2' })

	let hasNextPage = true
	let pageIndex = 1

	while (hasNextPage) {
		console.log(`📄 Обрабатывается страница ${pageIndex}`)

		await page.waitForSelector('table tbody tr')

		// Получаем HTML текущей таблицы, чтобы потом сравнивать
		const previousTableHtml = await page.$eval(
			'table tbody',
			el => el.innerHTML
		)

		// Забираем игроков с текущей страницы
		const currentPlayers = await page.evaluate(() => {
			const rows = document.querySelectorAll('table tbody tr')
			const result = []

			rows.forEach(row => {
				const cells = row.querySelectorAll('td')
				if (cells.length >= 7) {
					const nickname = cells[1]?.innerText.trim()
					const games = parseInt(cells[3]?.innerText.trim(), 10)
					const wins = parseInt(cells[4]?.innerText.trim(), 10)
					const avgBonus = parseFloat(
						cells[6]?.innerText.trim().replace(',', '.')
					)

					result.push({
						nickname,
						games,
						wins,
						avgBonus,
					})
				}
			})

			return result
		})

		players.push(...currentPlayers)

		// Проверка, активна ли кнопка "Следующая"
		const nextButtonDisabled = await page.$eval('.page-link.next', el =>
			el.closest('li')?.classList.contains('disabled')
		)

		if (nextButtonDisabled) {
			hasNextPage = false
		} else {
			await page.click('.page-link.next')

			// Ждём, пока таблица обновится
			await page.waitForFunction(
				prev => document.querySelector('table tbody')?.innerHTML !== prev,
				{},
				previousTableHtml
			)

			pageIndex++
		}
	}

	return players
}

async function main() {
	const url = 'https://mediagame.by/rating'
	const browser = await puppeteer.launch({ headless: 'new' })
	const page = await browser.newPage()

	try {
		const players = await fetchAllPlayers(page, url)
		console.log(`✅ Всего игроков собрано: ${players.length}`)

		writeFileSync(
			'players-rating.json',
			JSON.stringify(players, null, 2),
			'utf-8'
		)
		console.log('💾 Данные сохранены в players-rating.json')
	} catch (err) {
		console.error('❌ Ошибка при сборе данных:', err)
	}

	await browser.close()
}

main()
