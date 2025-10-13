import * as React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gamesResult } from '../../modules/Fantasy/data/autumn/result'
import './FantasyTable.css'

interface Pick {
	playerId: number
	playerName: string
}

interface UserData {
	userId: number
	name: string
	picksByStage: Record<string, Pick[]>
}

interface PickDisplay {
	playerId: number
	playerName: string
	passed: boolean | null
}

interface PlayerRow {
	id: number
	name: string
	stages: PickDisplay[][] // массив этапов, каждый этап — массив пиков
	stagePassedCounts: number[] // число прошедших в каждом этапе
	total: number
	stageNames: string[]
}

const FantasyTable = () => {
	const [playersData, setPlayersData] = useState<PlayerRow[]>([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState<{
		key: keyof PlayerRow | string
		direction: 'asc' | 'desc'
	}>({
		key: 'total',
		direction: 'desc',
	})

	const playersPerPage = 25

	// Трансформация API-данных в формат таблицы
	const transformData = (data: UserData[]): PlayerRow[] => {
		return data.map(user => {
			const stageNames = Object.keys(user.picksByStage)
			const stages: PickDisplay[][] = []
			const stagePassedCounts: number[] = []
			let total = 0

			stageNames.forEach((stage, idx) => {
				const picks = user.picksByStage[stage].map(pick => ({
					playerId: pick.playerId,
					playerName: pick.playerName,
					passed: gamesResult[stage]?.includes(pick.playerId) ?? null,
				}))
				stages[idx] = picks
				const passedCount = picks.filter(p => p.passed).length
				stagePassedCounts[idx] = passedCount
				total += passedCount
			})

			return {
				id: user.userId,
				name: user.name,
				stages,
				stagePassedCounts,
				total,
				stageNames,
			}
		})
	}

	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch('/api/autumn/allPicks')
				if (!res.ok) throw new Error('Ошибка при загрузке игроков')
				const data: UserData[] = await res.json()
				const transformed = transformData(data)
				setPlayersData(transformed)
			} catch (err) {
				console.error('Ошибка при загрузке игроков фэнтези:', err)
			}
		}
		fetchPlayers()
	}, [])

	// Фильтрация по имени
	const filteredPlayers = playersData.filter(player =>
		player.name.toLowerCase().includes(search.toLowerCase())
	)

	// Сортировка
	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		const key = sortConfig.key
		if (key.startsWith('stage')) {
			const idx = parseInt(key.slice(5))
			return sortConfig.direction === 'asc'
				? a.stagePassedCounts[idx] - b.stagePassedCounts[idx]
				: b.stagePassedCounts[idx] - a.stagePassedCounts[idx]
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

	const handleSort = (key: keyof PlayerRow | string) => {
		setSortConfig(prev => ({
			key,
			direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
		}))
	}
	console.log(playersData)

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
						{playersData[0]?.stages.map((stage, idx) => (
							<th key={idx} onClick={() => handleSort(`stage${idx}`)}>
								{playersData[0].stageNames[idx]}
							</th>
						))}
						<th onClick={() => handleSort('total')}>Итого</th>
					</tr>
				</thead>
				<tbody>
					{currentPlayers.map(player => (
						<tr key={player.id}>
							<td>
								<Link to={`/fantasy/player/${player.id}`}>{player.name}</Link>
							</td>
							{player.stages.map((picks, stageIdx) => (
								<td key={stageIdx}>
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
											{i < picks.length - 1 ? ',' : ''}
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
