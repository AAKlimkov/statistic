import * as React from 'react'
import { useMemo, useState } from 'react'
import { CleanPick } from '../../../../api/fantasy/allPicksStage2'
import { tournamentResults } from '../data/result'
import './PicksGroupedByMatch.css'

interface Props {
	picks: CleanPick[]
	playerNames: Record<number, string>
	eliminatedPlayerMap: Record<number, string>
	activePlayerIds: Set<number>
}

export default function PicksGroupedByMatch({
	picks,
	playerNames,
	eliminatedPlayerMap,
	activePlayerIds,
}: Props) {
	const grouped = useMemo(() => {
		const map: Record<string, Record<number, number>> = {}

		picks.forEach(pick => {
			if (!map[pick.match_id]) {
				map[pick.match_id] = {}
			}
			map[pick.match_id][pick.player_id] =
				(map[pick.match_id][pick.player_id] || 0) + 1
		})

		return map
	}, [picks])

	// Инициализируем открытые дропдауны: открыты только для матчей, которых нет в tournamentResults (будущие)
	const [openMatches, setOpenMatches] = useState<Record<string, boolean>>(
		() => {
			const initialState: Record<string, boolean> = {}
			Object.keys(grouped).forEach(matchId => {
				initialState[matchId] = !tournamentResults[matchId]
			})
			return initialState
		}
	)

	const toggleMatch = (matchId: string) => {
		setOpenMatches(prev => ({
			...prev,
			[matchId]: !prev[matchId],
		}))
	}

	return (
		<div className='container'>
			<h1 className='heading'>Выбор игроков по матчам</h1>
			{Object.entries(grouped).map(([matchId, playerMap]) => {
				const isOpen = openMatches[matchId] ?? false
				const hasActivePlayers = Object.keys(playerMap).some(id =>
					activePlayerIds.has(+id)
				)

				return (
					<div key={matchId} className='match-block'>
						<h2
							className='match-header'
							style={{ cursor: 'pointer' }}
							onClick={() => toggleMatch(matchId)}
						>
							{isOpen ? '▼' : '▶'} Матч {matchId}
							{!hasActivePlayers && (
								<span
									style={{ fontSize: '0.9em', color: '#888', marginLeft: 8 }}
								>
									(завершён)
								</span>
							)}
						</h2>

						{isOpen && (
							<table className='table'>
								<thead>
									<tr>
										<th>Игрок</th>
										<th>Выбран</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(playerMap)
										.sort((a, b) => b[1] - a[1])
										.map(([playerId, count]) => {
											const id = +playerId
											const name = playerNames[id] || '???'
											const eliminatedStage = eliminatedPlayerMap[id]

											// Зачеркиваем, если игрок вылетел и не принёс очков
											const shouldStrikeThrough = eliminatedStage && count === 0

											return (
												<tr
													key={id}
													className={shouldStrikeThrough ? 'eliminated' : ''}
												>
													<td>
														<span
															style={
																eliminatedStage
																	? {
																			textDecoration: 'line-through',
																			color: '#999',
																	  }
																	: undefined
															}
														>
															{name}
														</span>

														{eliminatedStage && (
															<span
																style={{
																	color: '#999',
																	marginLeft: 6,
																}}
															>
																(вылетел(а): {eliminatedStage})
															</span>
														)}
													</td>
													<td>
														{' '}
														<span
															style={
																eliminatedStage
																	? {
																			color: '#999',
																			textDecoration: 'line-through',
																	  }
																	: undefined
															}
														>
															{count}
														</span>
													</td>
												</tr>
											)
										})}
								</tbody>
							</table>
						)}
					</div>
				)
			})}
		</div>
	)
}
