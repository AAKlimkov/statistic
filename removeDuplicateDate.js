import { readFileSync, writeFileSync } from 'fs'

// Загрузка данных
const raw = readFileSync('transformed-tournament-data.json', 'utf-8')
const data = JSON.parse(raw)

// Удаление дубликатов
const seen = new Set()
const unique = []

for (const entry of data) {
	const key = `${entry.tournament.trim().toLowerCase()}|${entry.session
		.trim()
		.toLowerCase()}|${entry.date}`
	if (!seen.has(key)) {
		seen.add(key)
		unique.push(entry)
	}
}

// Фильтрация по дате > 06.05.2025
const thresholdDate = new Date(2025, 4, 6) // месяц — май (0-based)
const filtered = unique.filter(({ date }) => {
	const [day, month, year] = date.split('.').map(Number)
	const entryDate = new Date(year, month - 1, day)
	return entryDate > thresholdDate
})

// Перезапись файла
writeFileSync(
	'transformed-tournament-data.json',
	JSON.stringify(filtered, null, 2),
	'utf-8'
)

console.log(`✅ Очищено. Осталось записей: ${filtered.length}`)
