// /components/fantasy/FantasyBracketTable.tsx (или ваш путь)

import { Paper } from '@mui/material'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { tournamentResults } from '../data/result'
import { bracketData, Match, Stage } from '../data/summerLeagueData' // Убедитесь, что путь к данным верный
import './FantasyTableStage2.css' // Убедитесь, что путь к стилям верный

// --- 1. ОПРЕДЕЛЯЕМ СТРУКТУРЫ ДАННЫХ (без изменений) ---
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
	partial: boolean
	awardedPoints: number
	displaySuffix?: string
}
interface MatchPicksGroup {
	matchId: string
	matchTitle: string
	picks: PickDisplay[]
}
interface UserRow {
	id: number
	name: string
	stages: MatchPicksGroup[][]
	stagePassedCounts: number[]
	total: number
	potentialPicks: number
}

// --- 2. ДИНАМИЧЕСКАЯ КОНФИГУРАЦИЯ (без изменений) ---
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
const allMatches = [
	...bracketData.upperBracket.left.flatMap(s => s.matches),
	...bracketData.upperBracket.right.flatMap(s => s.matches),
	...bracketData.lowerBracket.left.flatMap(s => s.matches),
	...bracketData.lowerBracket.right.flatMap(s => s.matches),
	...bracketData.finalStage.matches,
]
const matchInfoMap = new Map<string, Match>(allMatches.map(m => [m.id, m]))
const STAGE_CONFIG: { title: string; matchIds: Set<string> }[] = [
	{ title: '1/8 Финала', matchIds: new Set() },
	{ title: '1/4 Финала', matchIds: new Set() },
	{ title: '1/2 Финала', matchIds: new Set() },
	{ title: 'Финал', matchIds: new Set() },
]
const matchIdToStageIndex = new Map<string, number>()
const processStage = (stage: Stage) => {
	let stageIndex = -1
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
bracketData.upperBracket.left.forEach(s => processStage(s))
bracketData.upperBracket.right.forEach(s => processStage(s))
bracketData.lowerBracket.left.forEach(s => processStage(s))
bracketData.lowerBracket.right.forEach(s => processStage(s))
processStage(bracketData.finalStage)

// --- 3. ИСТИННЫЕ ДАННЫЕ (без изменений) ---
interface MatchResult {
	winners?: number[]
	places?: Record<number, number[]>
}

const FantasyBracketTable = () => {
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

	// --- 4. ГЛАВНАЯ ФУНКЦИЯ ТРАНСФОРМАЦИИ ДАННЫХ ---
	const transformData = (data: ApiUserData[]): UserRow[] => {
		const usersMap: Record<number, UserRow> = {}

		data.forEach(user => {
			const currentUserRow: UserRow = {
				id: user.fantasy_user_id,
				name: user.fantasy_user_name,
				stages: Array(STAGE_CONFIG.length)
					.fill(0)
					.map(() => []),
				stagePassedCounts: Array(STAGE_CONFIG.length).fill(0),
				total: 0,
				potentialPicks: 0,
			}
			usersMap[user.fantasy_user_id] = currentUserRow

			const picksByMatch = new Map<string, ApiPick[]>()
			user.picks.forEach(pick => {
				if (!picksByMatch.has(pick.match_id))
					picksByMatch.set(pick.match_id, [])
				picksByMatch.get(pick.match_id)!.push(pick)
			})

			const eliminatedPlayerIds = new Set<number>()

			STAGE_CONFIG.forEach((stageConfig, stageIdx) => {
				stageConfig.matchIds.forEach(matchId => {
					const matchPicks = picksByMatch.get(matchId)
					if (!matchPicks) return

					const matchResult = tournamentResults[matchId]
					const hasResults = !!matchResult
					const displayPicks: PickDisplay[] = []

					matchPicks.forEach(pick => {
						// Логика внутри этого цикла уже корректно пропускает 'loser'
						// благодаря `else { return }`
						if (pick.pick_type !== 'winner' && pick.pick_type !== 'place') {
							return
						}
						let partial = false
						let isCorrect = false
						let displaySuffix = ''
						let passed: boolean | null
						let awardedPoints = 0

						if (eliminatedPlayerIds.has(pick.player_id)) {
							passed = false
						} else {
							if (pick.pick_type === 'winner') {
								isCorrect =
									hasResults &&
									(matchResult.winners?.includes(pick.player_id) ?? false)
								if (isCorrect) {
									awardedPoints = 1
								}
							} else if (pick.pick_type === 'place' && pick.place_value) {
								const actualPlaces = matchResult?.places ?? {}
								const predictedPlace = pick.place_value
								const playerId = pick.player_id

								for (const [actualPlaceStr, players] of Object.entries(
									actualPlaces
								)) {
									const actualPlace = Number(actualPlaceStr)
									if (actualPlace < 5 || actualPlace > 8) continue
									if (!players.includes(playerId)) continue

									if (
										actualPlace === predictedPlace ||
										Math.abs(actualPlace - predictedPlace) === 2
									) {
										awardedPoints = 1
									} else if (
										[1, 3].includes(Math.abs(actualPlace - predictedPlace)) &&
										predictedPlace >= 5 &&
										predictedPlace <= 8
									) {
										awardedPoints = 0.5
									}
									break
								}

								if (awardedPoints > 0) {
									isCorrect = true
									currentUserRow.total += awardedPoints
									currentUserRow.stagePassedCounts[stageIdx] += awardedPoints
								}
								partial = awardedPoints === 0.5
								displaySuffix = ` (${predictedPlace} место)`
							}

							passed = hasResults ? isCorrect : null
						}

						const playerName = allPlayersMap.get(pick.player_id)
						if (!playerName) {
							console.warn(`Не найдено имя для игрока с ID: ${pick.player_id}.`)
						}
						displayPicks.push({
							playerId: pick.player_id,
							playerName: playerName || `ID:${pick.player_id}`,
							passed: passed,
							partial: partial,
							awardedPoints: awardedPoints,
							displaySuffix: displaySuffix,
						})

						if (awardedPoints) {
							currentUserRow.stagePassedCounts[stageIdx] += awardedPoints
							currentUserRow.total += awardedPoints
						}
					})

					if (displayPicks.length > 0) {
						currentUserRow.stages[stageIdx].push({
							matchId: matchId,
							matchTitle: matchInfoMap.get(matchId)?.title || matchId,
							picks: displayPicks,
						})
					}

					if (hasResults) {
						const allPlayersInMatch =
							matchInfoMap
								.get(matchId)
								?.players.filter(p => !p.isPlaceholder)
								.map(p => p.id) ?? []
						const advancingPlayerIds = new Set([
							...(matchResult.winners || []),
							...Object.values(matchResult.places || {}).flat(),
						])
						allPlayersInMatch.forEach(playerId => {
							if (!advancingPlayerIds.has(playerId)) {
								eliminatedPlayerIds.add(playerId)
							}
						})
					}
				})
			})

			// *** ИЗМЕНЕНИЕ: Добавлена фильтрация пиков типа 'loser' при подсчете потенциала ***
			currentUserRow.potentialPicks = user.picks.filter(
				pick =>
					(pick.pick_type === 'winner' || pick.pick_type === 'place') && // Условие 1: пик должен быть на победителя или место
					!eliminatedPlayerIds.has(pick.player_id) // Условие 2: игрок еще не выбыл
			).length
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
			if (key === 'potential')
				return (a.potentialPicks - b.potentialPicks) * dir
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
					padding: { xs: 1, sm: 2 },
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
							{/* <th onClick={() => handleSort('potential')}>Потенциал</th> */}
							<th onClick={() => handleSort('total')}>Итого</th>
						</tr>
					</thead>
					<tbody>
						{currentUsers.map(user => (
							<tr key={user.id}>
								<td>
									<Link to={`/fantasy/player/${user.id}`}>{user.name}</Link>
								</td>
								{user.stages.map((stageGroups, stageIdx) => (
									<td key={stageIdx}>
										{stageGroups.map((matchGroup, groupIndex) => (
											<div key={matchGroup.matchId}>
												<div className='picks-cell'>
													{matchGroup.picks.map(pick => (
														<span
															key={`${pick.playerId}-${pick.displaySuffix}`}
															className={
																pick.awardedPoints === 0.5
																	? 'pick-partial' // Желтый цвет
																	: pick.passed === true
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
												{groupIndex < stageGroups.length - 1 && (
													<hr className='pick-separator' />
												)}
											</div>
										))}
										{user.stagePassedCounts[stageIdx] > 0 && (
											<div className='picks-count'>
												{user.stagePassedCounts[stageIdx]}
											</div>
										)}
									</td>
								))}
								{/* <td className='potential-cell'>{user.potentialPicks}</td> */}
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
