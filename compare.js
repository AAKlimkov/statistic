import XLSX from 'xlsx-js-style'

// Нормализация значения
function normalize(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/\s+/g, '')
}

// Загрузка данных с листов
function loadSheets(filePath) {
	const workbook = XLSX.readFile(filePath)
	const sheets = {}
	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName]
		const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
		sheets[sheetName] = json
	}
	return sheets
}

// Параметры
const file1 = './Серия 4. medium.xlsx'
const file2 = './Серия 4. faceless.xlsx'

const sheets1 = loadSheets(file1)
const sheets2 = loadSheets(file2)

const workbook = XLSX.utils.book_new()

// Стили
const highlightStyle = {
	fill: {
		patternType: 'solid',
		fgColor: { rgb: 'FFFF00' }, // жёлтый фон
	},
}

const borderStyle = {
	top: { style: 'thin', color: { rgb: '000000' } },
	bottom: { style: 'thin', color: { rgb: '000000' } },
	left: { style: 'thin', color: { rgb: '000000' } },
	right: { style: 'thin', color: { rgb: '000000' } },
}

const startRow = 4 // A5
const endRow = 14 // 15-я строка
const startCol = 0 // A
const endCol = 37 // AL

// Обработка каждого листа
const allSheetNames = new Set([
	...Object.keys(sheets1),
	...Object.keys(sheets2),
])

for (const sheetName of allSheetNames) {
	const data1 = sheets1[sheetName] || []
	const data2 = sheets2[sheetName] || []
	const maxRows = Math.max(data1.length, data2.length)

	const resultSheet = []

	for (let i = 0; i < maxRows; i++) {
		const row1 = data1[i] || []
		const row2 = data2[i] || []
		const maxCols = Math.max(row1.length, row2.length)
		const resultRow = []

		for (let j = 0; j < maxCols; j++) {
			const val1 = row1[j] ?? ''
			const val2 = row2[j] ?? ''

			if (normalize(val1) !== normalize(val2)) {
				resultRow[j] = {
					v: `${val1} (${val2})`,
					s: highlightStyle,
				}
			} else {
				resultRow[j] = {
					v: val1,
				}
			}
		}

		resultSheet.push(resultRow)
	}

	const sheet = XLSX.utils.aoa_to_sheet(resultSheet)

	// Добавляем границы к A5:AL15
	for (let r = startRow; r <= endRow; r++) {
		for (let c = startCol; c <= endCol; c++) {
			const cellRef = XLSX.utils.encode_cell({ r, c })
			if (!sheet[cellRef]) sheet[cellRef] = { v: '' }

			const existingStyle = sheet[cellRef].s || {}
			sheet[cellRef].s = {
				...existingStyle,
				border: borderStyle,
			}
		}
	}

	XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
}

XLSX.writeFile(workbook, './differences.xlsx')
console.log('✅ Итоговый файл differences.xlsx создан.')
