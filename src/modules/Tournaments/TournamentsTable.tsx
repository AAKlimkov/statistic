import * as React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './TournamentsTable.css' // Можно переименовать файл или использовать общий стиль

const TournamentTable = () => {
	const [tournamentsData, setTournamentsData] = useState([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState({
		key: 'tournament_name',
		direction: 'asc',
	})

	const tournamentsPerPage = 10

	useEffect(() => {
		const fetchTournaments = async () => {
			try {
				const res = await fetch(
					'https://mafia-server-cyan.vercel.app/api/tournaments/statistics'
				)
				const data = await res.json()
				setTournamentsData(data)
			} catch (err) {
				console.error('Ошибка при загрузке турниров:', err)
			}
		}
		fetchTournaments()
	}, [])

	const filteredTournaments = tournamentsData.filter(tournament =>
		tournament.tournament_name.toLowerCase().includes(search.toLowerCase())
	)

	const sortedTournaments = [...filteredTournaments].sort((a, b) => {
		if (typeof a[sortConfig.key] === 'string') {
			return sortConfig.direction === 'asc'
				? a[sortConfig.key].localeCompare(b[sortConfig.key])
				: b[sortConfig.key].localeCompare(a[sortConfig.key])
		}
		// Числовая сортировка
		return sortConfig.direction === 'asc'
			? a[sortConfig.key] - b[sortConfig.key]
			: b[sortConfig.key] - a[sortConfig.key]
	})

	const indexOfLastTournament = currentPage * tournamentsPerPage
	const indexOfFirstTournament = indexOfLastTournament - tournamentsPerPage
	const currentTournaments = sortedTournaments.slice(
		indexOfFirstTournament,
		indexOfLastTournament
	)

	const totalPages = Math.ceil(sortedTournaments.length / tournamentsPerPage)

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
			<h1>Статистика турниров</h1>

			<div className='filters'>
				<input
					type='text'
					placeholder='Поиск по имени турнира...'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>

			<table>
				<thead>
					<tr>
						<th onClick={() => handleSort('tournament_name')}>Турнир</th>
						<th onClick={() => handleSort('uniq_players')}>
							Уникальные игроки
						</th>
						<th onClick={() => handleSort('total_games')}>Всего игр</th>
						<th onClick={() => handleSort('red_win_count')}>Победы красных</th>
						<th onClick={() => handleSort('black_win_count')}>Победы черных</th>
						<th onClick={() => handleSort('avg_player_start_rating')}>
							Средний рейтинг. Начало
						</th>
						<th onClick={() => handleSort('avg_player_end_rating')}>
							Средний рейтинг. Окончание
						</th>
					</tr>
				</thead>
				<tbody>
					{currentTournaments.map(t => (
						<tr key={t.tournament_id}>
							<td>
								<Link to={`/tournament/${t.tournament_id}`}>
									{t.tournament_name}
								</Link>
							</td>
							<td>{t.uniq_players}</td>
							<td>{t.total_games}</td>
							<td>
								{t.red_win_count}(
								{((t.red_win_count / t.total_games) * 100).toFixed(2)}%)
							</td>
							<td>
								{t.black_win_count}(
								{(100 - (t.red_win_count / t.total_games) * 100).toFixed(2)}%)
							</td>
							<td>{t.avg_player_start_rating.toFixed(2)}</td>
							<td>{t.avg_player_end_rating.toFixed(2)}</td>
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

export default TournamentTable
