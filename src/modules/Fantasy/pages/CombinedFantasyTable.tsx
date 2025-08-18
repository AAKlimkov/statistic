import { Paper } from '@mui/material'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { tournamentResults } from '../data/result'
import { bracketData, Match, Stage } from '../data/summerLeagueData'
import './FantasyTableStage2.css' // Можно объединить стили в один файл

// --- 1. ОПРЕДЕЛЯЕМ СТРУКТУРЫ ДАННЫХ ---

// Типы данных из API для Квалификации
interface QualPick {
	playerId: number
	playerName: string
}
interface QualUserData {
	userId: number
	name: string
	picks: QualPick[]
}
type QualApiData = Record<string, QualUserData[]>

// Типы данных из API для Основной сетки
interface BracketApiPick {
	match_id: string
	player_id: number
	pick_type: 'winner' | 'loser' | 'place'
	place_value: number | null
}
interface BracketApiUserData {
	fantasy_user_id: number
	fantasy_user_name: string
	picks: BracketApiPick[]
}

// Универсальные типы для отображения в таблице
interface PickDisplay {
	playerId: number
	awardedPoints: number
	playerName: string
	partial: boolean
	passed: boolean | null
	displaySuffix?: string
}
interface MatchPicksGroup {
	matchId: string
	matchTitle: string
	picks: PickDisplay[]
}

// Единая структура для строки пользователя
interface UserRow {
	id: number
	name: string
	stages: MatchPicksGroup[][] // Массив для каждого этапа, включая квал.
	stagePassedCounts: number[] // Массив очков за каждый этап
	total: number
	potentialPicks: number // Потенциал только для основной сетки
}

// --- 2. ДИНАМИЧЕСКАЯ КОНФИГУРАЦИЯ ЭТАПОВ ---

// Объединенная конфигурация всех этапов турнира
const STAGE_CONFIG: { title: string; matchIds: Set<string> }[] = [
	{ title: 'Квалификация', matchIds: new Set() }, // Этап 0
	{ title: '1/8 Финала', matchIds: new Set() }, // Этап 1
	{ title: '1/4 Финала \n(желтый + 0,5)', matchIds: new Set() }, // Этап 2
	{ title: '1/2 Финала', matchIds: new Set() }, // Этап 3
	{ title: 'Финал', matchIds: new Set() }, // Этап 4
]
const STAGE_COUNT = STAGE_CONFIG.length

// Вспомогательные карты для быстрой обработки данных
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
const matchIdToStageIndex = new Map<string, number>()

// Заполняем карты конфигурации этапов (индексы сдвинуты на 1)
const processStage = (stage: Stage) => {
	let stageIndex = -1
	if (stage.name.includes('1/8')) stageIndex = 1
	else if (stage.name.includes('1/4')) stageIndex = 2
	else if (stage.name.includes('1/2')) stageIndex = 3
	else if (stage.name.includes('Финал')) stageIndex = 4

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

const CombinedFantasyTable = () => {
	const [usersData, setUsersData] = useState<UserRow[]>([])
	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState<{
		key: string
		direction: 'asc' | 'desc'
	}>({
		key: 'total', // Сортировка по умолчанию
		direction: 'desc',
	})
	const playersPerPage = 25

	// --- 3. ГЛАВНАЯ ФУНКЦИЯ ТРАНСФОРМАЦИИ ДАННЫХ ---
	const transformCombinedData = (
		qualApiData: QualApiData,
		bracketApiData: BracketApiUserData[]
	): UserRow[] => {
		const usersMap: Record<number, UserRow> = {}

		// --- ШАГ 1: Обработка данных Квалификации ---
		const passedPlayersByQual: Record<string, number[]> = {
			'0': [51, 109, 77, 193],
			'1': [90, 71, 105, 74],
			'2': [7, 229, 125, 146],
			'3': [192, 225, 55, 231],
		}
		const allQualPassedPlayerIds = new Set(
			Object.values(passedPlayersByQual).flat()
		)

		// Собираем всех пользователей и их пики из всех квалов
		const qualUsersPicks: Record<number, { name: string; picks: QualPick[] }> =
			{}
		Object.values(qualApiData)
			.flat()
			.forEach(user => {
				if (!qualUsersPicks[user.userId]) {
					qualUsersPicks[user.userId] = { name: user.name, picks: [] }
				}
				qualUsersPicks[user.userId].picks.push(...user.picks)
			})

		Object.entries(qualUsersPicks).forEach(([userIdStr, userData]) => {
			const userId = +userIdStr

			// Создаем запись для пользователя
			const newUserRow: UserRow = {
				id: userId,
				name: userData.name,
				stages: Array(STAGE_COUNT)
					.fill(0)
					.map(() => []),
				stagePassedCounts: Array(STAGE_COUNT).fill(0),
				total: 0,
				potentialPicks: 0, // Будет посчитан позже
			}

			const qualPicksDisplay = userData.picks.map(pick => ({
				playerId: pick.playerId,
				playerName: pick.playerName,
				passed: allQualPassedPlayerIds.has(pick.playerId),
			}))

			const passedCount = qualPicksDisplay.filter(p => p.passed).length
			newUserRow.stagePassedCounts[0] = passedCount
			newUserRow.total += passedCount

			// Группируем все пики квалификации в одну группу
			if (qualPicksDisplay.length > 0) {
				newUserRow.stages[0].push({
					matchId: 'qualification-stage',
					matchTitle: 'Пики на квалификацию',
					picks: qualPicksDisplay,
				})
			}

			usersMap[userId] = newUserRow
		})

		// --- ШАГ 2: Обработка данных Основной сетки ---
		bracketApiData.forEach(user => {
			const userId = user.fantasy_user_id

			// Находим существующего пользователя или создаем нового (на случай если он не участвовал в квалах)
			if (!usersMap[userId]) {
				usersMap[userId] = {
					id: userId,
					name: user.fantasy_user_name,
					stages: Array(STAGE_COUNT)
						.fill(0)
						.map(() => []),
					stagePassedCounts: Array(STAGE_COUNT).fill(0),
					total: 0,
					potentialPicks: 0,
				}
			}
			const currentUserRow = usersMap[userId]

			const picksByMatch = new Map<string, BracketApiPick[]>()
			user.picks.forEach(pick => {
				if (!picksByMatch.has(pick.match_id))
					picksByMatch.set(pick.match_id, [])
				picksByMatch.get(pick.match_id)!.push(pick)
			})

			const eliminatedPlayerIds = new Set<number>()

			// Итерация по этапам ОСНОВНОЙ СЕТКИ (индексы 1-4)
			for (let stageIdx = 1; stageIdx < STAGE_COUNT; stageIdx++) {
				STAGE_CONFIG[stageIdx].matchIds.forEach(matchId => {
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

						if (pick.match_id === 'L-1/2-B' || pick.match_id === 'L-1/2-C') {
							if (pick.pick_type === 'place') {
								isCorrect =
									hasResults &&
									(matchResult.winners?.includes(pick.player_id) ?? false)
								if (isCorrect) {
									awardedPoints = 1
									passed = true
								} else {
									awardedPoints = 0
									passed = false
								}
							}
						} else if (
							eliminatedPlayerIds.has(pick.player_id) &&
							pick.player_id !== 23 &&
							pick.player_id !== 22 &&
							pick.player_id !== 3
						) {
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
									// currentUserRow.total += awardedPoints
									// currentUserRow.stagePassedCounts[stageIdx] += awardedPoints
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
					console.log(displayPicks)
					if (displayPicks.length > 0) {
						currentUserRow.stages[stageIdx].push({
							matchId: matchId,
							matchTitle: matchInfoMap.get(matchId)?.title || matchId,
							picks: displayPicks,
						})
					}

					// Обновляем список выбывших игроков после матча
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
			}

			// Считаем потенциал только для пиков основной сетки
			currentUserRow.potentialPicks = user.picks.filter(
				pick =>
					(pick.pick_type === 'winner' || pick.pick_type === 'place') &&
					!eliminatedPlayerIds.has(pick.player_id)
			).length
		})

		return Object.values(usersMap)
	}

	useEffect(() => {
		const fetchAllData = async () => {
			try {
				// Загружаем данные из обоих источников параллельно
				const [qualRes, bracketRes] = await Promise.all([
					fetch('/api/fantasy/allPicks'),
					fetch('/api/fantasy/allPicksStage2'),
				])

				if (!qualRes.ok || !bracketRes.ok) {
					throw new Error('Ошибка при загрузке данных с одного из источников')
				}

				const qualData = await qualRes.json()
				const bracketData = await bracketRes.json()

				const transformed = transformCombinedData(qualData, bracketData)
				setUsersData(transformed)
			} catch (err) {
				console.error('Ошибка при загрузке и обработке фэнтези-данных:', err)
			}
		}
		fetchAllData()
	}, [])

	// --- 4. СОРТИРОВКА, ФИЛЬТРАЦИЯ И РЕНДЕРИНГ (в основном без изменений) ---
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
			<h1>Общий рейтинг фэнтези</h1>
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
															style={
																pick.playerName === 'Зверюга' ||
																pick.playerName === 'NLIP' ||
																pick.playerName === 'Юрия'
																	? { color: 'orange', textDecoration: 'none' }
																	: undefined
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

export default CombinedFantasyTable
