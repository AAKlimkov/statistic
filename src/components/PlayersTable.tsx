import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './PlayersTable.css'

const PlayersTable = () => {
	const [playersData, setPlayersData] = useState<Record<string, any>>({})
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState({ minGames: 0, maxGames: 1000 })
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState({
		key: 'totalGames',
		direction: 'desc',
	})

	const playersPerPage = 10

	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch(
					'https://mafia-server-cyan.vercel.app/api/players'
				)
				const data = await res.json()
				setPlayersData(data)
			} catch (err) {
				console.error('Ошибка при загрузке игроков:', err)
			}
		}

		fetchPlayers()
	}, [])

	const filteredPlayers = Object.values(playersData).filter(
		player =>
			player.name.toLowerCase().includes(search.toLowerCase()) &&
			player.games_count >= filter.minGames &&
			player.games_count <= filter.maxGames
	)

	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		if (a[sortConfig.key] < b[sortConfig.key])
			return sortConfig.direction === 'asc' ? -1 : 1
		if (a[sortConfig.key] > b[sortConfig.key])
			return sortConfig.direction === 'asc' ? 1 : -1
		return 0
	})

	const indexOfLastPlayer = currentPage * playersPerPage
	const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
	const currentPlayers = sortedPlayers.slice(
		indexOfFirstPlayer,
		indexOfLastPlayer
	)
	const totalPages = Math.ceil(sortedPlayers.length / playersPerPage)

	const handleSort = (key: string) => {
		setSortConfig(prevConfig => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === 'asc'
					? 'desc'
					: 'asc',
		}))
	}

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
			</div>

			<table>
				<thead>
					<tr>
						<th onClick={() => handleSort('name')}>Игрок</th>
						<th onClick={() => handleSort('games_count')}>Игр</th>
						<th onClick={() => handleSort('last_ratingPoints')}>Рейтинг</th>
						<th onClick={() => handleSort('last_position')}>Позиция</th>
					</tr>
				</thead>
				<tbody>
					{currentPlayers.map(player => (
						<tr key={player.id}>
							<td>
								<Link to={`/player/${player.id}`}>{player.name}</Link>
							</td>
							<td>{player.games_count}</td>
							<td>{player.last_ratingPoints.toFixed(2)}</td>
							<td>{player.last_position}</td>
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

export default PlayersTable
