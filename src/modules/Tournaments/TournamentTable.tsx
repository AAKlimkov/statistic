import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './TournamentTable.css'
import * as React from 'react'

interface Session {
	session_id: number
	session_name: string
}

interface Player {
	player_id: number
	player_name: string
	games_played: number
	red_games_win: number
	black_games_total: number
	red_games_total: number
	black_games_win: number
	avg_points: number
	avg_judge_points: number
	rating_start: number
	rating_end: number
}

type SortKey = keyof Player

const TournamentTable: React.FC = () => {
	const { id } = useParams<{ id: string }>()

	const [sessions, setSessions] = useState<Session[]>([])
	const [players, setPlayers] = useState<Player[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	const [search, setSearch] = useState<string>('')
	const [sortConfig, setSortConfig] = useState<{
		key: SortKey
		direction: 'asc' | 'desc'
	}>({
		key: 'player_name',
		direction: 'asc',
	})

	useEffect(() => {
		const fetchTournamentStats = async () => {
			try {
				setLoading(true)
				const res = await fetch(
					`https://mafia-server-cyan.vercel.app/api/tournament/${id}/statistics`
				)
				if (!res.ok) throw new Error('Ошибка при загрузке данных турнира')
				const data = await res.json()
				setSessions(data.sessions)
				setPlayers(data.players)
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message)
				} else {
					setError('Неизвестная ошибка')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchTournamentStats()
	}, [id])

	// Фильтрация игроков по нику
	const filteredPlayers = players.filter(player =>
		player.player_name.toLowerCase().includes(search.toLowerCase())
	)

	// Сортировка игроков по ключу и направлению
	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		const { key, direction } = sortConfig
		let compare = 0

		if (typeof a[key] === 'string' && typeof b[key] === 'string') {
			compare = a[key].localeCompare(b[key])
		} else if (typeof a[key] === 'number' && typeof b[key] === 'number') {
			compare = a[key] - b[key]
		}

		return direction === 'asc' ? compare : -compare
	})

	// Обработчик клика по заголовку столбца
	const handleSort = (key: SortKey) => {
		setSortConfig(prevConfig => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === 'asc'
					? 'desc'
					: 'asc',
		}))
	}

	if (loading) return <p>Загрузка...</p>
	if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>

	return (
		<div className='container'>
			<h2>Сессии турнира</h2>

			{/* Dropdown для сессий */}
			{sessions.length === 0 ? (
				<p>Нет сессий</p>
			) : (
				<select onChange={e => alert(`Выбрана сессия: ${e.target.value}`)}>
					{sessions.map(session => (
						<option key={session.session_id} value={session.session_id}>
							{session.session_name}
						</option>
					))}
				</select>
			)}

			<h2>Статистика игроков</h2>

			<input
				type='text'
				placeholder='Поиск по нику игрока...'
				value={search}
				onChange={e => setSearch(e.target.value)}
				style={{
					marginBottom: 12,
					padding: 6,
					fontSize: 16,
					width: '100%',
					maxWidth: 400,
				}}
			/>

			<table>
				<thead>
					<tr>
						<th
							onClick={() => handleSort('player_name')}
							style={{ cursor: 'pointer' }}
						>
							Игрок{' '}
							{sortConfig.key === 'player_name'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
						<th
							onClick={() => handleSort('games_played')}
							style={{ cursor: 'pointer' }}
						>
							Игр{' '}
							{sortConfig.key === 'games_played'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
						<th
							onClick={() => handleSort('red_games_win')}
							style={{ cursor: 'pointer' }}
						>
							Победы красных{' '}
							{sortConfig.key === 'red_games_win'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
						<th
							onClick={() => handleSort('black_games_win')}
							style={{ cursor: 'pointer' }}
						>
							Победы черных{' '}
							{sortConfig.key === 'black_games_win'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
						<th
							onClick={() => handleSort('avg_points')}
							style={{ cursor: 'pointer' }}
						>
							Средние очки{' '}
							{sortConfig.key === 'avg_points'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
						<th
							onClick={() => handleSort('avg_judge_points')}
							style={{ cursor: 'pointer' }}
						>
							Средние очки судей{' '}
							{sortConfig.key === 'avg_judge_points'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
						<th
							onClick={() => handleSort('rating_start')}
							style={{ cursor: 'pointer' }}
						>
							Рейтинг в начале{' '}
							{sortConfig.key === 'rating_start'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
						<th
							onClick={() => handleSort('rating_end')}
							style={{ cursor: 'pointer' }}
						>
							Рейтинг в конце{' '}
							{sortConfig.key === 'rating_end'
								? sortConfig.direction === 'asc'
									? '▲'
									: '▼'
								: ''}
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedPlayers.length === 0 ? (
						<tr>
							<td colSpan={8}>Нет данных по игрокам</td>
						</tr>
					) : (
						sortedPlayers.map(p => (
							<tr key={p.player_id}>
								<td>{p.player_name}</td>
								<td>{p.games_played}</td>
								<td>
									{p.red_games_win}/{p.red_games_total} ({' '}
									{((p.red_games_win / p.red_games_total) * 100).toFixed(2)}%)
								</td>
								<td>
									{p.black_games_win}/{p.black_games_total}({' '}
									{((p.black_games_win / p.black_games_total) * 100).toFixed(2)}
									%)
								</td>
								<td>{p.avg_points.toFixed(2)}</td>
								<td>{p.avg_judge_points.toFixed(2)}</td>
								<td>{p.rating_start.toFixed(2)}</td>
								<td>{p.rating_end.toFixed(2)}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}

export default TournamentTable
