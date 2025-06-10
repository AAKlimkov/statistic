import * as React from 'react'
import './PicksGroupedByQualification.css'

interface PlayerPick {
	playerId: number
	playerName: string
}

interface UserPick {
	userId: number
	name: string
	picks: PlayerPick[]
}

interface Props {
	picks: {
		[qualificationIndex: string]: UserPick[]
	}
}

export default function PicksGroupedByQualification({ picks }: Props) {
	const qualificationIndexes = Object.keys(picks).sort(
		(a, b) => Number(a) - Number(b)
	)

	return (
		<div className='container'>
			<h1 className='heading'>Статистика выборов игроков по квалификациям</h1>

			{qualificationIndexes.map(qualIndex => {
				const users = picks[qualIndex]
				const playerCountMap: Record<number, { name: string; count: number }> =
					{}

				users.forEach(user => {
					user.picks.forEach(({ playerId, playerName }) => {
						if (!playerCountMap[playerId]) {
							playerCountMap[playerId] = { name: playerName, count: 0 }
						}
						playerCountMap[playerId].count++
					})
				})

				const sortedPlayers = Object.entries(playerCountMap).sort(
					(a, b) => b[1].count - a[1].count
				)

				return (
					<div key={qualIndex} className='qualification-block'>
						<h2>Квалификация {+qualIndex + 1}</h2>
						<table className='table'>
							<thead>
								<tr>
									<th className='th'>Игрок</th>
									<th className='th'>Выбран</th>
								</tr>
							</thead>
							<tbody>
								{sortedPlayers.map(([playerId, { name, count }]) => (
									<tr key={playerId}>
										<td className='td'>{name}</td>
										<td className='td'>{count}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)
			})}
		</div>
	)
}
