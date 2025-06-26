// /components/fantasy/FantasyBracketTable.tsx (пример пути)

import { Paper } from '@mui/material'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './FantasyTableStage2.css'
import { bracketData, Stage } from './data/summerLeagueData'

// --- 1. ИНТЕРФЕЙСЫ ---
interface ApiPick {
	match_id: string
	player_id: number
	pick_type: 'winner' | 'loser' | 'place'
	place_value: number | null
}
interface ApiUserData {
	fantasy_user_id: number
	fantasy_user_name: string
	picks: ApiPick[]
}
interface PickDisplay {
	playerId: number
	playerName: string
	passed: boolean | null
	displaySuffix?: string
}
interface UserRow {
	id: number
	name: string
	stages: PickDisplay[][]
	stagePassedCounts: number[]
	total: number
}

// --- 2. ДИНАМИЧЕСКАЯ КОНФИГУРАЦИЯ ---

const allPlayersList = [
	...bracketData.upperBracket.left.flatMap(s => s.matches),
	...bracketData.upperBracket.right.flatMap(s => s.matches),
	...bracketData.lowerBracket.left.flatMap(s => s.matches),
	...bracketData.lowerBracket.right.flatMap(s => s.matches),
	...bracketData.finalStage.matches,
]
	.flatMap(match => match.players)
	.filter(player => !player.isPlaceholder)
	.filter(
		(player, index, self) => index === self.findIndex(p => p.id === player.id)
	)

const allPlayersMap = new Map(allPlayersList.map(p => [p.id, p.name]))

const STAGE_CONFIG: { title: string; matchIds: Set<string> }[] = [
	{ title: '1/8 Финала', matchIds: new Set() },
	{ title: '1/4 Финала', matchIds: new Set() },
	{ title: '1/2 Финала', matchIds: new Set() },
	{ title: 'Финал', matchIds: new Set() },
]

const matchIdToStageIndex = new Map<string, number>()

// *** ВОТ ИСПРАВЛЕНИЕ: Добавлена недостающая функция ***
const processStage = (stage: Stage) => {
	let stageIndex = -1
	// Определяем индекс по названию
	if (stage.name.includes('1/8')) stageIndex = 0
	else if (stage.name.includes('1/4')) stageIndex = 1
	else if (stage.name.includes('1/2')) stageIndex = 2
	else if (stage.name.includes('Финал')) stageIndex = 3

	if (stageIndex !== -1) {
		stage.matches.forEach(match => {
			STAGE_CONFIG[stageIndex].matchIds.add(match.id)
			matchIdToStageIndex.set(match.id, stageIndex)
		})
	}
}

// Теперь эти вызовы будут работать
bracketData.upperBracket.left.forEach(s => processStage(s))
bracketData.upperBracket.right.forEach(s => processStage(s))
bracketData.lowerBracket.left.forEach(s => processStage(s))
bracketData.lowerBracket.right.forEach(s => processStage(s))
processStage(bracketData.finalStage)

// --- 3. ИСТИННЫЕ ДАННЫЕ ---
interface MatchResult {
	winners?: number[]
	places?: Record<number, number[]>
}

const tournamentResults: Record<string, MatchResult> = {
	'U-1/8-1': {
		winners: [35, 131, 259, 193],
		places: {
			6: [114],
		},
	},
}

const FantasyBracketTable = () => {
	// ... остальной код компонента без изменений ...
	const [usersData, setUsersData] = useState<UserRow[]>([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState<{
		key: string
		direction: 'asc' | 'desc'
	}>({
		key: 'total',
		direction: 'desc',
	})

	const playersPerPage = 25

	const transformData = (data: ApiUserData[]): UserRow[] => {
		const usersMap: Record<number, UserRow> = {}

		data.forEach(user => {
			if (!usersMap[user.fantasy_user_id]) {
				usersMap[user.fantasy_user_id] = {
					id: user.fantasy_user_id,
					name: user.fantasy_user_name,
					stages: Array(STAGE_CONFIG.length)
						.fill(0)
						.map(() => []),
					stagePassedCounts: Array(STAGE_CONFIG.length).fill(0),
					total: 0,
				}
			}

			user.picks.forEach(pick => {
				const stageIdx = matchIdToStageIndex.get(pick.match_id)
				if (stageIdx === undefined) return

				const matchResult = tournamentResults[pick.match_id]
				const hasResults = matchResult !== undefined

				let isCorrect = false
				let displaySuffix = ''

				if (pick.pick_type === 'winner') {
					isCorrect =
						hasResults &&
						(matchResult.winners?.includes(pick.player_id) ?? false)
				} else if (pick.pick_type === 'place' && pick.place_value) {
					isCorrect =
						hasResults &&
						(matchResult.places?.[pick.place_value]?.includes(pick.player_id) ??
							false)
					displaySuffix = ` (${pick.place_value} место)`
				} else {
					return
				}

				const pickForDisplay: PickDisplay = {
					playerId: pick.player_id,
					playerName:
						allPlayersMap.get(pick.player_id) || `ID:${pick.player_id}`,
					passed: hasResults ? isCorrect : null,
					displaySuffix: displaySuffix,
				}

				const currentUserRow = usersMap[user.fantasy_user_id]
				currentUserRow.stages[stageIdx].push(pickForDisplay)

				if (isCorrect) {
					currentUserRow.stagePassedCounts[stageIdx] += 1
					currentUserRow.total += 1
				}
			})
		})

		return Object.values(usersMap)
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch('/api/fantasy/allPicksStage2')
				if (!res.ok) throw new Error('Ошибка при загрузке данных')
				const data: ApiUserData[] = await res.json()
				const transformed = transformData(data)
				setUsersData(transformed)
			} catch (err) {
				console.error('Ошибка при загрузке данных для таблицы:', err)
			}
		}
		fetchData()
	}, [])

	const sortedAndFilteredUsers = useMemo(() => {
		const filtered = usersData.filter(user =>
			user.name.toLowerCase().includes(search.toLowerCase())
		)

		return [...filtered].sort((a, b) => {
			const { key, direction } = sortConfig
			const dir = direction === 'asc' ? 1 : -1

			if (key.startsWith('stage')) {
				const idx = parseInt(key.slice(5))
				return (a.stagePassedCounts[idx] - b.stagePassedCounts[idx]) * dir
			}
			if (key === 'total') return (a.total - b.total) * dir
			if (key === 'name') return a.name.localeCompare(b.name) * dir
			return 0
		})
	}, [usersData, search, sortConfig])

	const handleSort = (key: string) => {
		setSortConfig(prev => ({
			key,
			direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
		}))
	}

	const totalPages = Math.ceil(sortedAndFilteredUsers.length / playersPerPage)
	const currentUsers = sortedAndFilteredUsers.slice(
		(currentPage - 1) * playersPerPage,
		currentPage * playersPerPage
	)

	return (
		<div className='fantasy-table-container'>
			<h1>Рейтинг игроков фэнтези-сетки</h1>
			<div className='filters'>
				<input
					type='text'
					placeholder='Поиск по имени...'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>
			<Paper
				sx={{
					bgcolor: 'rgba(255, 255, 255, 0.9)',
					padding: 2,
					borderRadius: 2,
				}}
			>
				<table>
					<thead>
						<tr>
							<th onClick={() => handleSort('name')}>Имя участника</th>
							{STAGE_CONFIG.map(({ title }, idx) => (
								<th key={title} onClick={() => handleSort(`stage${idx}`)}>
									{title}
								</th>
							))}
							<th onClick={() => handleSort('total')}>Итого</th>
						</tr>
					</thead>
					<tbody>
						{currentUsers.map(user => (
							<tr key={user.id}>
								<td>
									<Link to={`/fantasy/bracket-viewer/${user.id}`}>
										{user.name}
									</Link>
								</td>
								{user.stages.map((picks, stageIdx) => (
									<td key={stageIdx}>
										<div className='picks-cell'>
											{picks.map(pick => (
												<span
													key={`${pick.playerId}-${pick.displaySuffix}`}
													className={
														pick.passed === true
															? 'pick-correct'
															: pick.passed === false
															? 'pick-incorrect'
															: 'pick-pending'
													}
												>
													{pick.playerName}
													{pick.displaySuffix}
												</span>
											))}
										</div>
										<div className='picks-count'>
											{user.stagePassedCounts[stageIdx]}
										</div>
									</td>
								))}
								<td className='total-cell'>{user.total}</td>
							</tr>
						))}
					</tbody>
				</table>
			</Paper>

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

export default FantasyBracketTable
