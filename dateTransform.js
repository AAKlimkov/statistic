import fs from 'fs/promises'

// Чтение данных из файла
async function processData() {
	try {
		const data = await fs.readFile('tournament-data.json', 'utf8')

		// Парсинг данных
		const parsedData = JSON.parse(data)

		// Преобразование данных
		const transformedData = parsedData.map(item => {
			const event = item.event
			const tournamentMatch = event.match(/«(.+)»/) // Находим турнир в кавычках
			const roundMatch = event.match(/(\d+)\s*(Раунд)/) // Находим номер раунда

			let tournament = ''
			let session = ''

			if (tournamentMatch) {
				// Если есть турнир в кавычках
				tournament = tournamentMatch[1].replace(/\.$/, '') // Убираем точку в конце
				session = event.replace(tournamentMatch[0], '').trim() // Получаем оставшуюся часть как сессию
			} else {
				// Если нет турнира в кавычках, используем название до первой точки
				tournament = event.split('.')[0].trim().replace(/\.$/, '')
				session = event.split('.')[1] ? event.split('.')[1].trim() : ''
			}

			// Специальная обработка для "5 элемент"
			if (tournament.toLowerCase() === '5 элемент' && roundMatch) {
				const roundNumber = roundMatch[1]
				tournament = `5 ЭЛЕМЕНТ. РАУНД ${roundNumber}`
			} else {
				tournament = tournament.toUpperCase()
			}

			// Форматирование session
			if (session) {
				session = session.replace(/\.\s*/, '').trim()
				session = session.replace(/\s+\./, '').trim()
				if (session.includes('серия') && session.includes('Раунд')) {
					session = session.replace(/(\d+)\s*серия.*(\d+)\s*Раунд/, '$1 серия.')
				}
				if (session.endsWith('..')) {
					session = session.slice(0, -2)
				}
				if (session.endsWith('.')) {
					session = session.slice(0, -1)
				}
			}

			return {
				date: item.date,
				session,
				tournament,
			}
		})

		// Запись в новый файл
		await fs.writeFile(
			'transformed-tournament-data.json',
			JSON.stringify(transformedData, null, 2),
			'utf8'
		)

		console.log('✅ Данные успешно записаны в transformed-tournament-data.json')
	} catch (err) {
		console.error('❌ Ошибка:', err)
	}
}

processData()
