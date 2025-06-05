import * as React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './FantasyTable.css'

interface Pick {
	playerId: number
	playerName: string
}

interface UserData {
	userId: number
	name: string
	picks: Pick[]
}

type ApiData = Record<string, UserData[]>

interface PlayerRow {
	id: number
	name: string
	kvals: string[] // ники игроков через запятую для каждой квалификации
	total: number // сумма пиков (прошедших)
}

const FantasyTable = () => {
	const [playersData, setPlayersData] = useState<PlayerRow[]>([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState<{
		key: keyof PlayerRow | 'name'
		direction: 'asc' | 'desc'
	}>({
		key: 'name',
		direction: 'asc',
	})

	const playersPerPage = 25

	// Функция для трансформации API-данных в формат таблицы
	const transformData = (data: ApiData): PlayerRow[] => {
		const usersMap: Record<number, PlayerRow> = {}

		Object.entries(data).forEach(([kvalIndex, users]) => {
			users.forEach(user => {
				if (!usersMap[user.userId]) {
					usersMap[user.userId] = {
						id: user.userId,
						name: user.name,
						kvals: ['', '', '', ''],
						total: 0,
					}
				}
				const playersNames = user.picks.map(p => p.playerName).join(', ')
				usersMap[user.userId].kvals[+kvalIndex] = playersNames
			})
		})

		return Object.values(usersMap)
	}

	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch('/api/fantasy/allPicks')
				if (!res.ok) throw new Error('Ошибка при загрузке игроков')
				const data = await res.json()
				const transformed = transformData(data)
				setPlayersData(transformed)
			} catch (err) {
				console.error('Ошибка при загрузке игроков фэнтези:', err)
			}
		}
		fetchPlayers()
	}, [])

	// Фильтрация по имени пользователя
	const filteredPlayers = playersData.filter(player =>
		player.name.toLowerCase().includes(search.toLowerCase())
	)

	// Сортировка
	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		const key = sortConfig.key
		if (typeof a[key] === 'string') {
			return sortConfig.direction === 'asc'
				? (a[key] as string).localeCompare(b[key] as string)
				: (b[key] as string).localeCompare(a[key] as string)
		}
		return sortConfig.direction === 'asc'
			? (a[key] as number) - (b[key] as number)
			: (b[key] as number) - (a[key] as number)
	})

	// Пагинация
	const indexOfLastPlayer = currentPage * playersPerPage
	const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
	const currentPlayers = sortedPlayers.slice(
		indexOfFirstPlayer,
		indexOfLastPlayer
	)

	const totalPages = Math.ceil(sortedPlayers.length / playersPerPage)

	const handleSort = (key: keyof PlayerRow | 'name') => {
		setSortConfig(prevConfig => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === 'asc'
					? 'desc'
					: 'asc',
		}))
	}

	return (
		<div className='fantasy-table-container'>
			<h1>Фэнтези-таблица игроков</h1>

			<div className='filters'>
				<input
					type='text'
					placeholder='Поиск по имени пикера...'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>

			<table>
				<thead>
					<tr>
						<th onClick={() => handleSort('name')}>Имя пикера</th>
						<th onClick={() => handleSort('kvals')}>Квал 1</th>
						<th onClick={() => handleSort('kvals')}>Квал 2</th>
						<th onClick={() => handleSort('kvals')}>Квал 3</th>
						<th onClick={() => handleSort('kvals')}>Квал 4</th>
						<th onClick={() => handleSort('total')}>Итого</th>
					</tr>
				</thead>
				<tbody>
					{currentPlayers.map(player => (
						<tr key={player.id}>
							<td>
								<Link to={`/fantasy/player/${player.id}`}>{player.name}</Link>
							</td>
							<td>{player.kvals[0]}</td>
							<td>{player.kvals[1]}</td>
							<td>{player.kvals[2]}</td>
							<td>{player.kvals[3]}</td>
							<td>{player.total}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className='fantasy-table-pagination'>
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
