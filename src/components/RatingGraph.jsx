import { Button, Card, CardContent } from '@mui/material'
import React from 'react'
import {
	Bar,
	BarChart,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

const RatingGraph = ({ player }) => {
	if (!player || !player.ratingHistory) return <div>Нет данных</div>

	const ratingHistory = player.ratingHistory
	const recentChanges = ratingHistory.slice(-10).map((value, index, arr) => ({
		game: `Игра ${index + 1}`,
		change: index === 0 ? 0 : value - arr[index - 1],
		color:
			index === 0
				? '#82ca9d'
				: value - arr[index - 1] > 0
				? '#82ca9d'
				: '#ff4d4d',
	}))

	const fullHistory = ratingHistory.map((value, index) => ({
		game: `Игра ${index + 1}`,
		rating: value,
	}))

	return (
		<div
			style={{
				padding: '24px',
				backgroundColor: '#f5f5f5',
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				gap: '12px',
			}}
		>
			<Card>
				<CardContent>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Рейтинг</h2>
					</div>
					<ResponsiveContainer width='100%' height={300}>
						<LineChart data={fullHistory}>
							<XAxis dataKey='game' hide />
							<YAxis domain={[900, 1100]} />
							<Tooltip />
							<Line
								type='monotone'
								dataKey='rating'
								stroke='#8884d8'
								strokeWidth={3}
								dot={{ r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
						Изменение Рейтинга
					</h2>
					<ResponsiveContainer width='100%' height={300}>
						<BarChart data={recentChanges}>
							<XAxis dataKey='game' hide />
							<YAxis />
							<Tooltip />
							<Bar dataKey='change' fill={({ payload }) => payload.color} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	)
}

export default RatingGraph
