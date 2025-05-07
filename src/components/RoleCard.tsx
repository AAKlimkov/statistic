import { Card, Typography } from '@mui/material'
import React from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#ff5733']

export default function RoleCard({ role }) {
	const {
		name,
		value: games,
		wins,
		winRate,
		avgJudgePoints,
		avgPoints,
		avgPointsFull,
		puPercent,
		judgeDistribution,
	} = role

	// Преобразуем данные для pie chart из avg_judge
	const judgeData = Object.keys(avgPointsFull.avg_judge)
		.filter(key => key !== 'total') // Исключаем 'total'
		.map(key => {
			const percent = avgPointsFull.avg_judge[key].percent
			const count = avgPointsFull.avg_judge[key].count // Добавляем количество
			return {
				name: key,
				value: percent,
				count, // Добавляем количество
			}
		})

	// Кастомный лейбл для отображения процента и количества
	const renderLabel = entry => {
		return `${entry.value.toFixed(1)}% (${entry.count})`
	}

	return (
		<Card variant='outlined' sx={{ p: 2, height: 450 }}>
			<Typography variant='subtitle1' gutterBottom>
				{name}
			</Typography>
			<Typography variant='body2'>Игр: {games}</Typography>
			<Typography variant='body2'>Побед: {wins}</Typography>
			<Typography variant='body2'>Винрейт: {winRate}%</Typography>
			<Typography variant='body2'>
				Ср. доп. от судей: {avgJudgePoints}
			</Typography>
			<Typography variant='body2'>Ср. доп: {avgPoints}</Typography>
			{/* <Typography variant='body2'>
				% ПУ: {puPercent ? puPercent : 'Не задано'}
			</Typography> */}

			<ResponsiveContainer width='100%' height={300}>
				<PieChart>
					<Pie
						data={judgeData}
						dataKey='value'
						nameKey='name'
						cx='50%'
						cy='50%'
						outerRadius={60}
						label={renderLabel} // Используем кастомный лейбл
					>
						{judgeData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
					</Pie>
					<Legend
						iconSize={12}
						layout='horizontal'
						align='center'
						verticalAlign='bottom'
					/>
				</PieChart>
			</ResponsiveContainer>
		</Card>
	)
}
