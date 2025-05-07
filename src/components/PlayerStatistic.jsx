import { Box, Card, Typography } from '@mui/material'
import React from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts'
import RoleCard from './RoleCard'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#ff5733'] // Добавлен дополнительный цвет для новой категории

const roles = ['Черные', 'Дон', 'Мирный', 'Шериф']
const rolesAll = [
	'Общее',
	'Дон',
	'Черные',
	'Дон+Черные',
	'Мирный',
	'Шериф',
	'Мирный+Шериф',
]

export default function PlayerStatistic({ statistic }) {
	const totalGames =
		statistic.find(item => item.category === 'Общее')?.games_count || 0

	// Составляем данные для распределения по ролям
	const roleData = roles.map(role => {
		const roleStat = statistic.find(item => item.category === role) || {}
		return {
			name: role,
			value: roleStat.games_count || 0,
			wins: roleStat.wins || 0,
			winRate: roleStat.win_rate || '0',
			avgPoints: roleStat.avg_total || '0',
			avgJudgePoints: roleStat.avg_judge?.total || '0',
		}
	})
	const roleDataAll = rolesAll.map(role => {
		const roleStat = statistic.find(item => item.category === role) || {}
		return {
			name: role,
			value: roleStat.games_count || 0,
			wins: roleStat.wins || 0,
			winRate: roleStat.win_rate || '0',
			avgPoints: roleStat.avg_total || '0',
			avgPointsFull: roleStat,
			avgJudgePoints: roleStat.avg_judge?.total || '0',
		}
	})

	// Определяем общие данные
	const winRate =
		(statistic.find(item => item.category === 'Общее') || {}).win_rate || 0
	const avgPoints =
		(statistic.find(item => item.category === 'Общее') || {}).avg_total || 0
	const avgJudgePoints =
		(statistic.find(item => item.category === 'Общее') || {}).avg_judge
			?.total || 0

	const renderLabel = entry => {
		const totalGames = roleData.reduce((acc, role) => acc + role.value, 0) // Подсчитаем общее количество игр
		const percent = ((entry.value / totalGames) * 100).toFixed(1) // Процент от общего числа игр
		return ` ${percent}% (${entry.value} игр)` // Показываем и процент, и количество
	}

	return (
		<Box p={2}>
			{/* Верхний блок (Общая статистика и первая карточка Дополнительные баллы на одной строке) */}
			<Box
				display='flex'
				flexWrap='wrap'
				gap={2}
				mb={2}
				justifyContent='space-between'
			>
				{/* Блок "Общая статистика" */}
				<Box
					flex='1 1 100%' // ширина 100% для всех экранов
					maxWidth='100%' // максимально 100%
				>
					<Typography variant='h5' gutterBottom>
						Общая статистика
					</Typography>
					<Card sx={{ p: 3, height: 300 }}>
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
									label={renderLabel} // Используем кастомный лейбл
								>
									{roleData.map((entry, index) => (
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
						<Typography>Игр сыграно: {totalGames}</Typography>
					</Card>
				</Box>

				{/* Первая карточка блока "Дополнительные баллы" */}
				<Box
					flex='1 1 100%' // ширина 100% для всех экранов
					maxWidth='100%' // максимально 100%
				>
					<RoleCard role={roleDataAll[0]} />
				</Box>
			</Box>

			{/* Блок с остальными карточками "Дополнительные баллы" */}
			<Card sx={{ p: 2 }}>
				<Typography variant='h6'>Дополнительные баллы</Typography>

				<Box
					display='flex'
					flexDirection='column'
					gap={2}
					justifyContent='center'
				>
					{/* Остальные карточки, каждая на новом ряду */}
					{roleDataAll.slice(1).map(role => (
						<Box
							key={role.name}
							sx={{
								width: '100%', // Каждый Box будет занимать 100% ширины
							}}
						>
							<RoleCard role={role} />
						</Box>
					))}
				</Box>
			</Card>
		</Box>
	)
}
