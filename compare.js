import XLSX from 'xlsx'

// Нормализация: убираем все пробелы и приводим к нижнему регистру
function normalize(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/\s+/g, '')
}

// Перевод номера колонки в Excel-стиль (например, 1 → A, 27 → AA)
function columnToLetter(col) {
	let letter = ''
	while (col > 0) {
		let mod = (col - 1) % 26
		letter = String.fromCharCode(65 + mod) + letter
		col = Math.floor((col - mod - 1) / 26)
	}
	return letter
}

function loadSheets(filePath) {
	const workbook = XLSX.readFile(filePath)
	const sheets = {}

	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName]
		const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
		sheets[sheetName] = json.slice(4) // Удаляем первые 4 строки
	}

	return sheets
}

function compareSheets(sheet1, sheet2, sheetName) {
	const maxRows = Math.max(sheet1.length, sheet2.length)
	const differences = []

	for (let i = 0; i < maxRows; i++) {
		const row1 = sheet1[i] || []
		const row2 = sheet2[i] || []
		const maxCols = Math.max(row1.length, row2.length)

		for (let j = 0; j < maxCols; j++) {
			const val1 = normalize(row1[j])
			const val2 = normalize(row2[j])

			if (val1 !== val2) {
				differences.push([
					sheetName,
					i + 5, // строка (учитывая удалённые 4)
					columnToLetter(j + 1), // колонка в буквах
					row1[j] || '',
					row2[j] || '',
				])
			}
		}
	}

	return differences
}

const file1 = './Серия 4. medium.xlsx'
const file2 = './Серия 4. faceless.xlsx'

const sheets1 = loadSheets(file1)
const sheets2 = loadSheets(file2)

let allDifferences = [
	['Лист', 'Строка', 'Колонка', 'Значение из файла 1', 'Значение из файла 2'],
]

const allSheetNames = new Set([
	...Object.keys(sheets1),
	...Object.keys(sheets2),
])

for (const name of allSheetNames) {
	const sheet1 = sheets1[name] || []
	const sheet2 = sheets2[name] || []
	const diffs = compareSheets(sheet1, sheet2, name)
	allDifferences.push(...diffs)
}

// Создание Excel с результатами
const workbook = XLSX.utils.book_new()
const sheet = XLSX.utils.aoa_to_sheet(allDifferences)
XLSX.utils.book_append_sheet(workbook, sheet, 'Differences')
XLSX.writeFile(workbook, './differences.xlsx')

console.log('✅ Различия сохранены в differences.xlsx')
