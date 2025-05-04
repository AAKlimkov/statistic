import { writeFileSync } from 'fs'
import { launch } from 'puppeteer'
;(async () => {
	const browser = await launch({ headless: true })
	let results = {}

	for (let gameId = 1623; gameId <= 1634; gameId++) {
		console.log(gameId)

		const url = `https://mediagame.by/tournament/reitingovyi-kubok?tab=results&game=${gameId}`
		const page = await browser.newPage()
		await page.goto(url, { waitUntil: 'networkidle2' })

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
			console.log(
				`Попытка ${attempt} загрузить данные для игры ${gameId} не удалась. Повтор...`
			)
			await page.reload({ waitUntil: 'networkidle2' })
		}

		if (data.length > 0) {
			results[`Игра ${gameId}`] = data
		}
		await page.close()
	}

	await browser.close()

	const filteredResults = Object.fromEntries(
		Object.entries(results).filter(([_, data]) => data.length > 0)
	)
	writeFileSync(
		'game_results.json',
		JSON.stringify(filteredResults, null, 2),
		'utf-8'
	)
	console.log(
		`Данные успешно сохранены в game_results.json. Количество записанных игр: ${
			Object.keys(filteredResults).length
		}`
	)
})()
