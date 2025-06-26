import * as React from 'react'
import { useEffect, useState } from 'react'

export default function FantasyPicksStage2Table() {
	const [picks, setPicks] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		fetch('/api/fantasy/allPicksStage2') // сюда подставь путь к твоему API
			.then(res => {
				if (!res.ok) {
					throw new Error(`Ошибка загрузки: ${res.statusText}`)
				}
				return res.json()
			})
			.then(data => {
				setPicks(data)
				setLoading(false)
			})
			.catch(err => {
				setError(err.message)
				setLoading(false)
			})
	}, [])

	if (loading) return <div>Загрузка данных...</div>
	if (error) return <div style={{ color: 'red' }}>Ошибка: {error}</div>

	if (picks.length === 0) {
		return <div>Данные отсутствуют</div>
	}

	return (
		<div style={{ padding: '1rem' }}>
			<h2>Fantasy Picks Stage 2</h2>
			<table
				style={{
					width: '100%',
					borderCollapse: 'collapse',
					textAlign: 'center',
				}}
			>
				<thead>
					<tr style={{ backgroundColor: '#eee' }}>
						<th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
						<th style={{ border: '1px solid #ccc', padding: '8px' }}>
							User ID
						</th>
						<th style={{ border: '1px solid #ccc', padding: '8px' }}>
							Match ID
						</th>
						<th style={{ border: '1px solid #ccc', padding: '8px' }}>
							Player ID
						</th>
						<th style={{ border: '1px solid #ccc', padding: '8px' }}>
							Pick Type
						</th>
						<th style={{ border: '1px solid #ccc', padding: '8px' }}>
							Place Value
						</th>
					</tr>
				</thead>
				<tbody>
					{picks.map(pick => (
						<tr key={pick.id}>
							<td style={{ border: '1px solid #ccc', padding: '8px' }}>
								{pick.id}
							</td>
							<td style={{ border: '1px solid #ccc', padding: '8px' }}>
								{pick.fantasy_user_id}
							</td>
							<td style={{ border: '1px solid #ccc', padding: '8px' }}>
								{pick.match_id}
							</td>
							<td style={{ border: '1px solid #ccc', padding: '8px' }}>
								{pick.player_id}
							</td>
							<td style={{ border: '1px solid #ccc', padding: '8px' }}>
								{pick.pick_type}
							</td>
							<td style={{ border: '1px solid #ccc', padding: '8px' }}>
								{pick.place_value !== null ? pick.place_value : '-'}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
