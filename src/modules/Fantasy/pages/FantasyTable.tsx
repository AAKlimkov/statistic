import * as React from 'react'
import { useEffect, useState } from 'react'
import { gamesResult } from '../data/autumn/result'
import './FantasyTable.css'

interface Pick {
	playerId: number
	playerName: string
	place?: number | null
}

interface PickWithPoints extends Pick {
	passed: boolean
	point: number
}

interface UserData {
	userId: number
	name: string
	picksByStage: Record<string, Pick[]>
}

interface PlayerRow {
	id: number
	name: string
	kvals: Record<string, PickWithPoints[]> // все пики с очками
	kvalPassedCounts: Record<string, number> // очки по этапам
	total: number
	kvalTotal?: number
	round16Total?: number
	round8Total?: number
}

const SUM_KEYS = {
	kvalTotal: 'kvalTotal',
	round16Total: 'round16Total',
	round8Total: 'round8Total',
}

const FantasyTable = () => {
	const [playersData, setPlayersData] = useState<PlayerRow[]>([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState<{
		key: string
		direction: 'asc' | 'desc'
	}>({ key: 'total', direction: 'desc' })
	const [showKvals, setShowKvals] = useState(false)
	const playersPerPage = 25

	const kvalStages = [
		'Квалификация 1',
		'Квалификация 2',
		'Квалификация 3',
		'Квалификация 4',
	]
	const round16Stages = ['1/8 #1', '1/8 #2', '1/8 #3', '1/8 #4']
	const round8Stages = ['1/4 #1', '1/4 #2', '1/4 #3', '1/4 #4']

	const transformData = (data: UserData[]): PlayerRow[] => {
		const usersMap: Record<number, PlayerRow> = {}

		data.forEach(user => {
			if (!usersMap[user.userId]) {
				usersMap[user.userId] = {
					id: user.userId,
					name: user.name,
					kvals: {},
					kvalPassedCounts: {},
					total: 0,
					kvalTotal: 0,
					round16Total: 0,
					round8Total: 0,
				}
			}

			Object.entries(user.picksByStage).forEach(([stage, picks]) => {
				const stageData = gamesResult[stage]
				const passedIds = stageData?.passed ?? []
				const placeIds = stageData?.place ?? []

				const kvalPicks: PickWithPoints[] = picks.map(p => {
					let point = 0
					let passed = false

					if (p.place === null && passedIds.includes(p.playerId)) {
						point = 1
						passed = true
					} else if (p.place != null && placeIds.includes(p.playerId)) {
						point = 1
						passed = false
					}

					return { ...p, passed, point }
				})

				usersMap[user.userId].kvals[stage] = kvalPicks
				const stagePoints = kvalPicks.reduce((sum, p) => sum + p.point, 0)
				usersMap[user.userId].kvalPassedCounts[stage] = stagePoints
				usersMap[user.userId].total += stagePoints
			})

			// Считаем суммы по группам этапов
			usersMap[user.userId].kvalTotal = kvalStages.reduce(
				(sum, s) => sum + (usersMap[user.userId].kvalPassedCounts[s] || 0),
				0
			)
			usersMap[user.userId].round16Total = round16Stages.reduce(
				(sum, s) => sum + (usersMap[user.userId].kvalPassedCounts[s] || 0),
				0
			)
			usersMap[user.userId].round8Total = round8Stages.reduce(
				(sum, s) => sum + (usersMap[user.userId].kvalPassedCounts[s] || 0),
				0
			)
		})

		return Object.values(usersMap)
	}

	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch('/api/autumn/allPicks')
				if (!res.ok) throw new Error('Ошибка при загрузке игроков')
				const data = await res.json()
				setPlayersData(transformData(data))
			} catch (err) {
				console.error(err)
			}
		}
		fetchPlayers()
	}, [])

	const filteredPlayers = playersData.filter(player =>
		player.name.toLowerCase().includes(search.toLowerCase())
	)

	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		const key = sortConfig.key

		let aVal: number | string = 0
		let bVal: number | string = 0

		if (key === 'total') {
			aVal = a.total
			bVal = b.total
		} else if (key === 'name') {
			aVal = a.name.toLowerCase()
			bVal = b.name.toLowerCase()
		} else if (key === SUM_KEYS.kvalTotal) {
			aVal = a.kvalTotal
			bVal = b.kvalTotal
		} else if (key === SUM_KEYS.round16Total) {
			aVal = a.round16Total
			bVal = b.round16Total
		} else if (key === SUM_KEYS.round8Total) {
			aVal = a.round8Total
			bVal = b.round8Total
		} else {
			// Сортируем по отдельной стадии
			aVal = a.kvalPassedCounts[key] || 0
			bVal = b.kvalPassedCounts[key] || 0
		}

		if (typeof aVal === 'string' && typeof bVal === 'string') {
			return sortConfig.direction === 'asc'
				? aVal.localeCompare(bVal)
				: bVal.localeCompare(aVal)
		}

		return sortConfig.direction === 'asc'
			? (aVal as number) - (bVal as number)
			: (bVal as number) - (aVal as number)
	})

	const indexOfLastPlayer = currentPage * playersPerPage
	const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
	const currentPlayers = sortedPlayers.slice(
		indexOfFirstPlayer,
		indexOfLastPlayer
	)
	const totalPages = Math.ceil(sortedPlayers.length / playersPerPage)

	const handleSort = (key: string) => {
		setSortConfig(prev => ({
			key,
			direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
		}))
	}

	const renderStageCell = (stage: string, picks: Pick[] = []) => {
		return (
			<td>
				{picks.map((p, i) => {
					const stageData = gamesResult[stage]
					const placeIds = stageData?.place ?? []
					const isPlacePassed = p.place != null && placeIds.includes(p.playerId)

					let color = 'red'
					if (p.place != null)
						color = isPlacePassed ? '#F1C905' : 'rgba(255,0,0,0.6)'
					else if (p.passed) color = 'green'

					return (
						<span key={p.playerId} style={{ color, marginRight: '0.3em' }}>
							{p.playerName}
							{i < picks.length - 1 ? ',' : ''}
						</span>
					)
				})}
			</td>
		)
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
				<label style={{ marginLeft: '1em' }}>
					<input
						type='checkbox'
						checked={showKvals}
						onChange={() => setShowKvals(prev => !prev)}
					/>
					Показывать пики квалификаций
				</label>
			</div>

			<div className='table-wrapper'>
				<table>
					<thead>
						<tr>
							<th onClick={() => handleSort('name')}>Имя пикера</th>

							{showKvals &&
								kvalStages.map(stage => (
									<th key={stage} onClick={() => handleSort(stage)}>
										{stage}
									</th>
								))}

							<th onClick={() => handleSort(SUM_KEYS.kvalTotal)}>Рез квал</th>

							{showKvals &&
								round16Stages.map(stage => (
									<th key={stage} onClick={() => handleSort(stage)}>
										{stage}
									</th>
								))}

							<th onClick={() => handleSort(SUM_KEYS.round16Total)}>Рез 1/8</th>

							{round8Stages.map(stage => (
								<th
									key={stage}
									className='round8-column'
									onClick={() => handleSort(stage)}
								>
									{stage}
								</th>
							))}
							<th onClick={() => handleSort(SUM_KEYS.round8Total)}>Рез 1/4</th>
							<th onClick={() => handleSort('total')}>Итого</th>
						</tr>
					</thead>

					<tbody>
						{currentPlayers.map(player => {
							const kvalResult = kvalStages.reduce(
								(sum, s) => sum + (player.kvalPassedCounts[s] || 0),
								0
							)
							const round16Result = round16Stages.reduce(
								(sum, s) => sum + (player.kvalPassedCounts[s] || 0),
								0
							)
							const round8Result = round8Stages.reduce(
								(sum, s) => sum + (player.kvalPassedCounts[s] || 0),
								0
							)

							return (
								<tr key={player.id}>
									<td>{player.name}</td>
									{/* Квалификации */}
									{showKvals &&
										kvalStages.map(stage =>
											renderStageCell(stage, player.kvals[stage])
										)}
									<td>{kvalResult}</td>
									{/* 1/8 финала */}
									{showKvals
										? round16Stages.map(stage =>
												renderStageCell(stage, player.kvals[stage])
										  )
										: null}
									{showKvals && <td>{round16Result}</td>}
									{!showKvals && <td>{round16Result}</td>}{' '}
									{/* всегда показываем результат 1/8 */}
									{/* 1/4 финала */}
									{round8Stages.map(stage =>
										renderStageCell(stage, player.kvals[stage]) ? (
											<td key={stage} className='round8-column'>
												{
													renderStageCell(stage, player.kvals[stage]).props
														.children
												}
											</td>
										) : null
									)}
									<td>{round8Result}</td>
									<td>{player.total}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

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
