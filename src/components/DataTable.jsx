import React, { useState } from 'react'

const App = () => {
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState({
		minGames: 0,
		maxGames: 1000,
		minELO: 0,
		maxELO: 5000,
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [playersData, setPlayersData] = useState()
	const playersPerPage = 10

	const filteredPlayers = Object.entries(playersData)
		.map(([name, player]) => ({ name, ...player }))
		.filter(
			player =>
				player.name.toLowerCase().includes(search.toLowerCase()) &&
				player.totalGames >= filter.minGames &&
				player.totalGames <= filter.maxGames &&
				player.ELO >= filter.minELO &&
				player.ELO <= filter.maxELO
		)

	const indexOfLastPlayer = currentPage * playersPerPage
	const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
	const currentPlayers = filteredPlayers.slice(
		indexOfFirstPlayer,
		indexOfLastPlayer
	)
	const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)

	return (
		<div className='container'>
			<h1>Статистика игроков</h1>

			<div className='filters'>
				<input
					type='text'
					placeholder='Поиск по имени...'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<input
					type='number'
					placeholder='Мин. игр'
					onChange={e =>
						setFilter({ ...filter, minGames: Number(e.target.value) })
					}
				/>
				<input
					type='number'
					placeholder='Макс. игр'
					onChange={e =>
						setFilter({ ...filter, maxGames: Number(e.target.value) })
					}
				/>
				<input
					type='number'
					placeholder='Мин. ELO'
					onChange={e =>
						setFilter({ ...filter, minELO: Number(e.target.value) })
					}
				/>
				<input
					type='number'
					placeholder='Макс. ELO'
					onChange={e =>
						setFilter({ ...filter, maxELO: Number(e.target.value) })
					}
				/>
			</div>

			<table>
				<thead>
					<tr>
						<th>Игрок</th>
						<th>Игр</th>
						<th>Винрейт</th>
						<th>Средний балл</th>
						<th>ELO</th>
					</tr>
				</thead>
				<tbody>
					{currentPlayers.map((player, index) => (
						<tr key={index}>
							<td>{player.name}</td>
							<td>{player.totalGames}</td>
							<td>{player.winRate}%</td>
							<td>{player.avgPoints}</td>
							<td>{player.ELO}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className='pagination'>
				{Array.from({ length: totalPages }, (_, i) => (
					<button
						key={i}
						onClick={() => setCurrentPage(i + 1)}
						className={currentPage === i + 1 ? 'active' : ''}
					>
						{i + 1}
					</button>
				))}
			</div>
		</div>
	)
}

export default App
