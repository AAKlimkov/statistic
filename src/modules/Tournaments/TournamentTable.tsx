import * as React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './TournamentTable.css'

interface Session {
	session_id: number
	session_name: string
}

interface Game {
	game_id: number
	game_name: string
}

interface Player {
	player_id: number
	player_name: string
	games_played?: number
	red_games_win?: number
	black_games_total?: number
	red_games_total?: number
	black_games_win?: number
	avg_points?: number
	avg_judge_points?: number
	rating_start?: number
	rating_end?: number
	rating_change?: number

	// Для структуры игры
	role_name?: string
	points?: number
	judge_points?: number
	win_points?: number | null
	rating?: number
	deltaRating?: number
	lh?: number | null
}

type SortKey = keyof Player

const TournamentTable: React.FC = () => {
	const { id } = useParams<{ id: string }>()

	const [sessions, setSessions] = useState<Session[]>([])
	const [players, setPlayers] = useState<Player[]>([])
	const [games, setGames] = useState<Game[]>([])

	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
		null
	)
	const [selectedGameId, setSelectedGameId] = useState<number | null>(null)

	const [search, setSearch] = useState<string>('')

	const [sortConfig, setSortConfig] = useState<{
		key: SortKey
		direction: 'asc' | 'desc'
	}>({
		key: 'player_name',
		direction: 'asc',
	})

	const [viewMode, setViewMode] = useState<'tournament' | 'game'>('tournament')

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
				setViewMode('tournament')
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
			} finally {
				setLoading(false)
			}
		}
		fetchTournamentStats()
	}, [id])

	useEffect(() => {
		if (selectedSessionId === null) return

		const fetchSessionStats = async () => {
			try {
				setLoading(true)
				const res = await fetch(
					`https://mafia-server-cyan.vercel.app/api/session/${selectedSessionId}/statistics`
				)
				if (!res.ok) throw new Error('Ошибка при загрузке данных сессии')
				const data = await res.json()
				setPlayers(data.players)
				setGames(data.games || [])
				setSelectedGameId(null)
				setViewMode('tournament')
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
			} finally {
				setLoading(false)
			}
		}
		fetchSessionStats()
	}, [selectedSessionId])

	useEffect(() => {
		if (selectedGameId === null) return

		const fetchGameStats = async () => {
			try {
				setLoading(true)
				const res = await fetch(
					`https://mafia-server-cyan.vercel.app/api/game/${selectedGameId}/statistics`
				)
				if (!res.ok) throw new Error('Ошибка при загрузке данных игры')
				const data = await res.json()
				setPlayers(data.players)
				setViewMode('game')
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
			} finally {
				setLoading(false)
			}
		}
		fetchGameStats()
	}, [selectedGameId])

	const filteredPlayers = players.filter(player =>
		player.player_name.toLowerCase().includes(search.toLowerCase())
	)

	const handleSort = (key: SortKey) => {
		setSortConfig(prevConfig => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === 'asc'
					? 'desc'
					: 'asc',
		}))
	}

	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		const { key, direction } = sortConfig
		const valA = a[key]
		const valB = b[key]

		let compare = 0

		if (typeof valA === 'number' && typeof valB === 'number') {
			compare = valA - valB
		} else if (typeof valA === 'string' && typeof valB === 'string') {
			compare = valA.localeCompare(valB)
		}

		return direction === 'asc' ? compare : -compare
	})

	const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const sessionId = parseInt(e.target.value, 10)
		setSelectedSessionId(sessionId)
	}

	const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const gameId = parseInt(e.target.value, 10)
		setSelectedGameId(gameId)
	}

	if (loading) return <p>Загрузка...</p>
	if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>

	return (
		<div className='container'>
			<h2>Сессии турнира</h2>

			<div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
				<select value={selectedSessionId ?? ''} onChange={handleSessionChange}>
					<option value=''>Выберите сессию</option>
					{sessions.map(session => (
						<option key={session.session_id} value={session.session_id}>
							{session.session_name}
						</option>
					))}
				</select>

				<select
					value={selectedGameId ?? ''}
					onChange={handleGameChange}
					disabled={selectedSessionId === null || games.length === 0}
				>
					<option value=''>Выберите игру</option>
					{games.map(game => (
						<option key={game.game_id} value={game.game_id}>
							{game.game_name}
						</option>
					))}
				</select>
			</div>

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
						{viewMode === 'tournament' ? (
							<>
								<th onClick={() => handleSort('player_name')}>Игрок</th>
								<th onClick={() => handleSort('games_played')}>Игр</th>
								<th>Победы красных</th>
								<th>Победы черных</th>
								<th onClick={() => handleSort('avg_points')}>Средние очки</th>
								<th onClick={() => handleSort('avg_judge_points')}>
									Средние очки судей
								</th>
								<th>Рейтинг в начале</th>
								<th>Рейтинг в конце</th>
								<th>Изменение рейтинга</th>
							</>
						) : (
							<>
								<th>Игрок</th>
								<th>Роль</th>
								<th>Очки</th>
								<th>Очки судей</th>
								<th>Рейтинг</th>
								<th>Изменение рейтинга</th>
							</>
						)}
					</tr>
				</thead>
				<tbody>
					{sortedPlayers.length === 0 ? (
						<tr>
							<td colSpan={viewMode === 'tournament' ? 9 : 6}>Нет данных</td>
						</tr>
					) : viewMode === 'tournament' ? (
						sortedPlayers.map(p => (
							<tr key={p.player_id}>
								<td>{p.player_name}</td>
								<td>{p.games_played}</td>
								<td>
									{p.red_games_win}/{p.red_games_total} (
									{p.red_games_total
										? ((p.red_games_win! / p.red_games_total) * 100).toFixed(2)
										: '0.00'}
									%)
								</td>
								<td>
									{p.black_games_win}/{p.black_games_total} (
									{p.black_games_total
										? (
												(p.black_games_win! / p.black_games_total) *
												100
										  ).toFixed(2)
										: '0.00'}
									%)
								</td>
								<td>{p.avg_points?.toFixed(2)}</td>
								<td>{p.avg_judge_points?.toFixed(2)}</td>
								<td>{p.rating_start?.toFixed(2)}</td>
								<td>{p.rating_end?.toFixed(2)}</td>
								<td>
									{p.rating_start !== undefined && p.rating_end !== undefined
										? (p.rating_end - p.rating_start).toFixed(2)
										: '—'}
								</td>
							</tr>
						))
					) : (
						sortedPlayers.map(p => (
							<tr key={p.player_id}>
								<td>{p.player_name}</td>
								<td>{p.role_name}</td>
								<td>{p.points?.toFixed(2)}</td>
								<td>{p.judge_points?.toFixed(2)}</td>
								<td>{p.rating?.toFixed(2)}</td>
								<td>{p.deltaRating?.toFixed(2)}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}

export default TournamentTable
