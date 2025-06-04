import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './FantasyTable.css'

const FantasyTable = () => {
	const [playersData, setPlayersData] = useState([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState({
		key: 'name',
		direction: 'asc',
	})

	const playersPerPage = 25

	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch(
					'https://mafia-server-cyan.vercel.app/api/fantasy/players' // замените на актуальный эндпоинт
				)
				if (!res.ok) throw new Error('Ошибка при загрузке игроков')
				const data = await res.json()
				setPlayersData(data)
			} catch (err) {
				console.error('Ошибка при загрузке игроков фэнтези:', err)
			}
		}
		fetchPlayers()
	}, [])

	// Фильтрация по поиску
	const filteredPlayers = playersData.filter(player =>
		player.name.toLowerCase().includes(search.toLowerCase())
	)

	// Сортировка
	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		if (typeof a[sortConfig.key] === 'string') {
			return sortConfig.direction === 'asc'
				? a[sortConfig.key].localeCompare(b[sortConfig.key])
				: b[sortConfig.key].localeCompare(a[sortConfig.key])
		}
		return sortConfig.direction === 'asc'
			? a[sortConfig.key] - b[sortConfig.key]
			: b[sortConfig.key] - a[sortConfig.key]
	})

	// Пагинация
	const indexOfLastPlayer = currentPage * playersPerPage
	const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
	const currentPlayers = sortedPlayers.slice(
		indexOfFirstPlayer,
		indexOfLastPlayer
	)

	const totalPages = Math.ceil(sortedPlayers.length / playersPerPage)

	const handleSort = key => {
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
			<h1>Фэнтези-таблица игроков</h1>

			<div className='filters'>
				<input
					type='text'
					placeholder='Поиск по имени игрока...'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>

			<table>
				<thead>
					<tr>
						<th onClick={() => handleSort('name')}>Имя</th>
						<th onClick={() => handleSort('games_count')}>Количество игр</th>
						<th onClick={() => handleSort('last_ratingPoints')}>Баллы</th>
					</tr>
				</thead>
				<tbody>
					{currentPlayers.map(player => (
						<tr key={player.id}>
							<td>
								<Link to={`/fantasy/player/${player.id}`}>{player.name}</Link>
							</td>
							<td>{player.games_count}</td>
							<td>{player.last_ratingPoints.toFixed(2)}</td>
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

export default FantasyTable
