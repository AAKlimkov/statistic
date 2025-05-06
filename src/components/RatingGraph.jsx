import { Card, CardContent } from '@mui/material'
import React from 'react'
import {
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

const RatingGraph = ({ player }) => {
	if (!player || player.length === 0) {
		return <div>Нет данных</div>
	}

	// Сортируем по дате
	const sorted = [...player].sort(
		(a, b) => new Date(a.session_date) - new Date(b.session_date)
	)

	// Форматируем данные для графика
	const graphData = sorted.map(item => ({
		date: item.session_date,
		rating: Math.round(item.ratingPoints),
		position: item.position,
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
					<h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
						Рейтинг и Позиция для {player[0].name}
					</h2>
					<ResponsiveContainer width='100%' height={400}>
						<LineChart data={graphData}>
							<XAxis dataKey='date' />
							<YAxis
								yAxisId='left'
								orientation='left'
								reversed
								label={{ value: 'Место', angle: -90, position: 'insideLeft' }}
							/>
							<YAxis
								yAxisId='right'
								orientation='right'
								domain={['dataMin - 10', 'dataMax + 10']}
								label={{
									value: 'Рейтинг',
									angle: -90,
									position: 'insideRight',
								}}
							/>
							<Tooltip />
							<Legend />
							<Line
								yAxisId='right'
								type='monotone'
								dataKey='rating'
								stroke='#8884d8'
								strokeWidth={2}
								dot={{ r: 1 }}
								name='Рейтинг'
							/>
							<Line
								yAxisId='left'
								type='monotone'
								dataKey='position'
								stroke='#82ca9d'
								strokeWidth={2}
								dot={{ r: 1 }}
								name='Место'
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	)
}

export default RatingGraph
