import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

const dataFolder = './data'
const outputFile = './combined_games_array.json'

const main = async () => {
	const files = await readdir(dataFolder)
	const jsonFiles = files.filter(f => f.endsWith('.json'))

	const allData = []

	for (const file of jsonFiles) {
		const filePath = path.join(dataFolder, file)
		const rawData = await readFile(filePath, 'utf-8')
		const json = JSON.parse(rawData)

		// Добавляем массив данных из каждого файла в общий массив
		allData.push(...json) // Здесь json — это массив объектов
	}

	await writeFile(outputFile, JSON.stringify(allData, null, 2), 'utf-8')
	console.log(`✅ Объединено ${jsonFiles.length} файлов в один массив.`)
}

main().catch(console.error)
