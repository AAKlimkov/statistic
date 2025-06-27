import * as React from 'react'
import { useMemo } from 'react'
import { CleanPick } from '../../../../api/fantasy/allPicksStage2'

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
								.map(([playerId, count]) => (
									<tr key={playerId}>
										<td>{playerNames[+playerId] || '???'}</td>
										<td>{count}</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			))}
		</div>
	)
}
