import fetch from 'node-fetch'
import readline from 'readline'


const BASE_URL = 'https://api.trello.com/1'
const AUTH_QUERY = `key=${API_KEY}&token=${TOKEN}`
// Функция для получения всех списков на доске
async function getLists(boardId) {
	const url = `${BASE_URL}/boards/${boardId}/lists?${AUTH_QUERY}`
	const response = await fetch(url)
	if (!response.ok)
		throw new Error(`Ошибка получения списков: ${response.statusText}`)
	return await response.json()
}

// Функция для получения всех карточек в списке
async function getCardsInList(listId) {
	const url = `${BASE_URL}/lists/${listId}/cards?${AUTH_QUERY}`
	const response = await fetch(url)
	if (!response.ok)
		throw new Error(
			`Ошибка получения карточек из списка: ${response.statusText}`
		)
	return await response.json()
}

// Функция для удаления карточки
async function deleteCard(cardId) {
	const url = `${BASE_URL}/cards/${cardId}?${AUTH_QUERY}`
	const response = await fetch(url, { method: 'DELETE' })
	if (!response.ok) {
		console.error(`- ❌ Ошибка удаления карточки с ID ${cardId}`)
	} else {
		console.log(`- ✅ Карточка с ID ${cardId} удалена.`)
	}
}

// Функция для запроса подтверждения у пользователя
function askConfirmation(question) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	return new Promise(resolve =>
		rl.question(question, ans => {
			rl.close()
			resolve(ans.trim().toUpperCase() === 'YES')
		})
	)
}

// --- ОСНОВНОЙ СКРИПТ ---
async function main() {
	try {
		console.log('Поиск списка для очистки...')
		const lists = await getLists(BOARD_ID)
		const targetList = lists.find(
			list => list.name.toLowerCase() === LIST_NAME_TO_CLEAN.toLowerCase()
		)

		if (!targetList) {
			console.error(
				`❌ Ошибка: Список с названием "${LIST_NAME_TO_CLEAN}" не найден на доске.`
			)
			return
		}

		console.log(`Найден список "${targetList.name}". Получение карточек...`)
		const cards = await getCardsInList(targetList.id)

		if (cards.length === 0) {
			console.log('✅ Список уже пуст. Делать нечего.')
			return
		}

		console.log(`\n🚨 ВНИМАНИЕ! 🚨`)
		console.log(
			`Найдено ${cards.length} карточек в списке "${targetList.name}".`
		)
		console.log('Это действие безвозвратно удалит их ВСЕ.')

		const confirmed = await askConfirmation(
			'Вы уверены, что хотите продолжить? Введите "YES" для подтверждения: '
		)

		if (confirmed) {
			console.log('\nНачинаю удаление...')
			for (const card of cards) {
				await deleteCard(card.id)
				// Добавим небольшую задержку, чтобы не перегружать API Trello
				await new Promise(resolve => setTimeout(resolve, 100))
			}
			console.log('\n🎉 Очистка завершена!')
		} else {
			console.log('\nОперация отменена.')
		}
	} catch (error) {
		console.error('\n--- ПРОИЗОШЛА ОШИБКА ---')
		console.error(error.message)
	}
}

main()
