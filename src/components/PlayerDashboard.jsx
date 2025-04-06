import { Box, Card, Grid, Typography } from '@mui/material'
import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50']

const roles = ['Мирный', 'Мафия', 'Дон', 'Шериф']

export default function PlayerStatsDashboard({ data }) {
	const totalGames = data.totalGames
	const roleData = roles.map(role => ({
		name: role,
		value: data.roleStats[role]?.games || 0,
		wins: data.roleStats[role]?.wins || 0,
		winRate: data.roleStats[role]?.winRate || '0',
		avgPoints: data.roleStats[role]?.avgPoints || '0',
		avgJudgePoints: data.roleStats[role]?.avgJudgePoints || '0',
	}))

	const winRate = data.winRate
	const avgPoints = data.avgPoints
	const avgJudgePoints = data.avgJudgePoints
	const bestStreaks = roles.map(role => ({
		role,
		streak: data.roleStats[role]?.bestWinStreak || 0,
	}))

	return (
		<Box p={2}>
			<Typography variant='h5' gutterBottom>
				Общая статистика
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} md={4}>
					<Card sx={{ p: 2 }}>
						<Typography variant='h6'>Распределение ролей</Typography>
						<ResponsiveContainer width='100%' height={200}>
							<PieChart>
								<Pie
									data={roleData}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={60}
									label
								>
									{roleData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
						<Typography>Игр сыграно: {totalGames}</Typography>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ p: 2 }}>
						<Typography variant='h6'>Винрейт</Typography>
						<Typography>Общий винрейт: {winRate}%</Typography>
						{roleData.map((r, i) => (
							<Typography key={i}>
								{r.name}: {r.winRate}%
							</Typography>
						))}
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ p: 2 }}>
						<Typography variant='h6'>Средние баллы</Typography>
						<Typography>Общие: {avgPoints}</Typography>
						<Typography>Судейские: {avgJudgePoints}</Typography>
						<Box mt={2}>
							{roleData.map((r, i) => (
								<Box key={i} mb={1}>
									<Typography variant='subtitle2'>{r.name}</Typography>
									<Typography variant='body2'>
										Основные: {r.avgPoints}
									</Typography>
									<Typography variant='body2'>
										Судейские: {r.avgJudgePoints}
									</Typography>
								</Box>
							))}
						</Box>
					</Card>
				</Grid>

				<Grid item xs={12}>
					<Card sx={{ p: 2 }}>
						<Typography variant='h6'>Лучшие серии побед</Typography>
						<Box display='flex' gap={4} flexWrap='wrap'>
							{bestStreaks.map((b, i) => (
								<Box key={i}>
									<Typography>{b.role}</Typography>
									<Typography>{b.streak}</Typography>
								</Box>
							))}
						</Box>
					</Card>
				</Grid>
			</Grid>
		</Box>
	)
}
