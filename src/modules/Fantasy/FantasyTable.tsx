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

interface PickDisplay {
	playerId: number
	playerName: string
	passed: boolean
}

interface PlayerRow {
	id: number
	name: string
	kvals: PickDisplay[][] // [Pick, Pick, Pick, Pick]
	kvalPassedCounts: number[] // [число прошедших в квале 1..4]
	total: number
}

const kvalCount = 4

const FantasyTable = () => {
	const [playersData, setPlayersData] = useState<PlayerRow[]>([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState<{
		key: keyof PlayerRow | 'name' | 'kval0' | 'kval1' | 'kval2' | 'kval3'
		direction: 'asc' | 'desc'
	}>({
		key: 'total', // по умолчанию сортировка по ИТОГО
		direction: 'desc',
	})

	const playersPerPage = 25

	// Функция для трансформации API-данных в формат таблицы
	const transformData = (data: ApiData): PlayerRow[] => {
		const passedPlayersByQual: Record<string, number[]> = {
			'0': [51, 109, 77, 193],
			'1': [90, 71, 105, 74],
			'2': [7, 229, 125, 146],
			'3': [],
		}

		const usersMap: Record<number, PlayerRow> = {}

		Object.entries(data).forEach(([kvalIndex, users]) => {
			users.forEach(user => {
				if (!usersMap[user.userId]) {
					usersMap[user.userId] = {
						id: user.userId,
						name: user.name,
						kvals: Array(kvalCount).fill([]),
						kvalPassedCounts: Array(kvalCount).fill(0),
						total: 0,
					}
				}

				const passed = passedPlayersByQual[kvalIndex]
				const isDefined = passed && passed.length > 0

				const kvalPicks = user.picks.map(pick => ({
					playerId: pick.playerId,
					playerName: pick.playerName,
					passed: isDefined ? passed.includes(pick.playerId) : null,
				}))

				usersMap[user.userId].kvals[+kvalIndex] = kvalPicks

				if (isDefined) {
					const passedCount = kvalPicks.filter(p => p.passed).length
					usersMap[user.userId].kvalPassedCounts[+kvalIndex] = passedCount
					usersMap[user.userId].total += passedCount
				}
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

		if (key.startsWith('kval')) {
			const idx = parseInt(key.slice(4))
			return sortConfig.direction === 'asc'
				? a.kvalPassedCounts[idx] - b.kvalPassedCounts[idx]
				: b.kvalPassedCounts[idx] - a.kvalPassedCounts[idx]
		}

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

	const handleSort = (
		key: keyof PlayerRow | 'name' | 'kval0' | 'kval1' | 'kval2' | 'kval3'
	) => {
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
						<th onClick={() => handleSort('kval0')}>Квал 1</th>
						<th onClick={() => handleSort('kval1')}>Квал 2</th>
						<th onClick={() => handleSort('kval2')}>Квал 3</th>
						<th onClick={() => handleSort('kval3')}>Квал 4</th>
						<th onClick={() => handleSort('total')}>Итого</th>
					</tr>
				</thead>
				<tbody>
					{currentPlayers.map(player => (
						<tr key={player.id}>
							<td>
								<Link to={`/fantasy/player/${player.id}`}>{player.name}</Link>
							</td>
							{player.kvals.map((picks, kvalIdx) => (
								<td key={kvalIdx}>
									{picks.map((pick, i) => (
										<span
											key={pick.playerId}
											style={{
												color:
													pick.passed === true
														? 'green'
														: pick.passed === false
														? 'red'
														: 'black',
												marginRight: '0.3em',
												display: 'inline-block',
											}}
										>
											{pick.playerName}
											{i < 3 ? ',' : ''}
										</span>
									))}
								</td>
							))}
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
