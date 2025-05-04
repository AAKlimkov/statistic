import fs from 'fs/promises'
import puppeteer from 'puppeteer'

const months = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto('https://mediagame.by/calendar', { waitUntil: 'networkidle0' })

const currentMonthIndex = new Date().getMonth()
const allEvents = []

for (let i = 0; i <= currentMonthIndex; i++) {
	const monthName = months[i]

	// Клик по месяцу
	await page.evaluate(monthName => {
		const el = [...document.querySelectorAll('.nav-link')].find(
			a => a.innerText.trim() === monthName
		)
		if (el) el.click()
	}, monthName)

	const events = await page.evaluate(() => {
		const results = []

		document.querySelectorAll('tr').forEach(tr => {
			tr.querySelectorAll('td').forEach(td => {
				const items = td.querySelectorAll('div.calendar-event-name')

				items.forEach(div => {
					const src = div.getAttribute('data-src')
					const dateMatch = src?.match(/#day-(\d{4})-(\d{2})-(\d{2})/)
					if (!dateMatch) return

					const [, year, month, day] = dateMatch
					const formattedDate = `${day}.${month}.${year}`

					results.push({
						date: formattedDate,
						event: div.innerText.trim(),
					})
				})
			})
		})

		return results
	})

	allEvents.push(...events)
}

await browser.close()
await fs.writeFile('tournament-data.json', JSON.stringify(allEvents, null, 2))
console.log('✅ Готово: сохранено в tournament-data.json')
