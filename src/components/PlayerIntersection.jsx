import React, { useState } from 'react'
import gamesData from '../../rawData/updated_game_results_rating.json'

function aggregatePlayerData(playerName) {
	const result = {}

	// Функция для определения победы
	const isVictory = points => {
		const parsedPoints = parseFloat(points)
		return parsedPoints > 0
	}

	// Проходим по всем играм
	for (const gameKey in gamesData) {
		gamesData[gameKey].forEach(game => {
			if (game.Игрок === playerName) {
				const role =
					game.Роль === 'Мафия' || game.Роль === 'Дон' ? 'черный' : 'мирный'

				// Ищем, с кем и в какой роли игрок играл
				gamesData[gameKey].forEach(otherGame => {
					if (otherGame.Игрок !== playerName) {
						const otherRole =
							otherGame.Роль === 'Мафия' || otherGame.Роль === 'Дон'
								? 'черный'
								: 'мирный'

						const opponentName = otherGame.Игрок

						// Инициализируем объект для противника, если еще не существует
						if (!result[opponentName]) {
							result[opponentName] = {
								мирные: { игры: 0, победы: 0 },
								черные: { игры: 0, победы: 0 },
								разноцвет_мирный: { игры: 0, победы: 0 },
								разноцвет_черный: { игры: 0, победы: 0 },
								общее: { игры: 0, победы: 0 }, // Общее количество игр и побед
							}
						}

						let isVictoryForThisGame = false
						// Логика для подсчета типов игр
						if (role === 'мирный' && otherRole === 'мирный') {
							result[opponentName].мирные.игры += 1
							result[opponentName].общее.игры += 1
							isVictoryForThisGame = isVictory(game['Баллы за победу'])
						} else if (role === 'черный' && otherRole === 'черный') {
							result[opponentName].черные.игры += 1
							result[opponentName].общее.игры += 1
							isVictoryForThisGame = isVictory(game['Баллы за победу'])
						} else if (role === 'мирный' && otherRole === 'черный') {
							result[opponentName].разноцвет_мирный.игры += 1
							result[opponentName].общее.игры += 1
							isVictoryForThisGame = isVictory(game['Баллы за победу'])
						} else if (role === 'черный' && otherRole === 'мирный') {
							result[opponentName].разноцвет_черный.игры += 1
							result[opponentName].общее.игры += 1
							isVictoryForThisGame = isVictory(game['Баллы за победу'])
						}

						// Обновляем данные побед
						if (isVictoryForThisGame) {
							if (role === 'мирный' && otherRole === 'мирный') {
								result[opponentName].мирные.победы += 1
								result[opponentName].общее.победы += 1
							} else if (role === 'черный' && otherRole === 'черный') {
								result[opponentName].черные.победы += 1
								result[opponentName].общее.победы += 1
							} else if (role === 'мирный' && otherRole === 'черный') {
								result[opponentName].разноцвет_мирный.победы += 1
								result[opponentName].общее.победы += 1
							} else if (role === 'черный' && otherRole === 'мирный') {
								result[opponentName].разноцвет_черный.победы += 1
								result[opponentName].общее.победы += 1
							}
						}
					}
				})
			}
		})
	}

	// Преобразуем данные в массив
	const aggregatedData = Object.keys(result).map(opponent => {
		const formatGamesData = (games, wins) => {
			const winPercentage = games > 0 ? ((wins / games) * 100).toFixed(2) : 0
			return `${games}/${wins} (${winPercentage}%)`
		}

		return {
			Противник: opponent,
			Общее: formatGamesData(
				result[opponent].общее.игры,
				result[opponent].общее.победы
			),
			ВместеМирные: formatGamesData(
				result[opponent].мирные.игры,
				result[opponent].мирные.победы
			),
			ВместеЧерные: formatGamesData(
				result[opponent].черные.игры,
				result[opponent].черные.победы
			),
			РазноцветМирный: formatGamesData(
				result[opponent].разноцвет_мирный.игры,
				result[opponent].разноцвет_мирный.победы
			),
			РазноцветЧерный: formatGamesData(
				result[opponent].разноцвет_черный.игры,
				result[opponent].разноцвет_черный.победы
			),
		}
	})

	return aggregatedData
}

const PlayerIntersection = ({ playerName }) => {
	const [tableData, setTableData] = useState(aggregatePlayerData(playerName))
	const [sortConfig, setSortConfig] = useState({
		column: 'Общее',
		direction: 'asc',
	})

	// Функция сортировки
	const sortedData = [...tableData].sort((a, b) => {
		const aValue = parseInt(a[sortConfig.column].split('/')[0])
		const bValue = parseInt(b[sortConfig.column].split('/')[0])
		if (sortConfig.direction === 'asc') {
			return aValue - bValue
		} else {
			return bValue - aValue
		}
	})

	const handleSort = column => {
		let direction = 'asc'
		if (sortConfig.column === column && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ column, direction })
	}

	return (
		<div>
			<h1>Таблица для игрока</h1>

			{sortedData.length > 0 && (
				<table border='1'>
					<thead>
						<tr>
							<th onClick={() => handleSort('Противник')}>Противник</th>
							<th onClick={() => handleSort('Общее')}>Общее</th>
							<th onClick={() => handleSort('ВместеМирные')}>Вместе мирные</th>
							<th onClick={() => handleSort('ВместеЧерные')}>Вместе черные</th>
							<th onClick={() => handleSort('РазноцветМирный')}>
								Разноцвет игрок мирный
							</th>
							<th onClick={() => handleSort('РазноцветЧерный')}>
								Разноцвет игрок черный
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedData.map((row, index) => (
							<tr key={index}>
								<td>{row.Противник}</td>
								<td>{row.Общее}</td>
								<td>{row.ВместеМирные}</td>
								<td>{row.ВместеЧерные}</td>
								<td>{row.РазноцветМирный}</td>
								<td>{row.РазноцветЧерный}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}

export default PlayerIntersection
