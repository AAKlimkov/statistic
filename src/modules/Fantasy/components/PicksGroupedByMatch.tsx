import * as React from 'react'
import { useMemo } from 'react'
import { CleanPick } from '../../../../api/fantasy/allPicksStage2'
import { tournamentResults } from '../data/result'
import './PicksGroupedByMatch.css'

interface Props {
	picks: CleanPick[]
	playerNames: Record<number, string>
}

export default function PicksGroupedByMatch({ picks, playerNames }: Props) {
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

	// Собираем всех выбывших из tournamentResults
	const eliminatedPlayerIds = useMemo(() => {
		const ids = new Set<number>()
		for (const result of Object.values(tournamentResults)) {
			result.losers?.forEach(id => ids.add(id))
		}
		return ids
	}, [])

	return (
		<div className='container'>
			<h1 className='heading'>Выбор игроков по матчам</h1>
			{Object.entries(grouped).map(([matchId, playerMap]) => (
				<div key={matchId} className='match-block'>
					<h2>Матч {matchId}</h2>
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
									const isEliminated = eliminatedPlayerIds.has(id)

									return (
										<tr key={id} className={isEliminated ? 'eliminated' : ''}>
											<td>{name}</td>
											<td>{count}</td>
										</tr>
									)
								})}
						</tbody>
					</table>
				</div>
			))}
		</div>
	)
}
