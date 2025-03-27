import {
	Avatar,
	Box,
	Card,
	CardContent,
	CircularProgress,
	Grid,
	List,
	ListItem,
	ListItemText,
	Tab,
	Tabs,
	Typography,
} from '@mui/material'
import React, { useState } from 'react'
import PlayerIntersection from './PlayerIntersection'
import RatingGraph from './RatingGraph'

const PlayerStats = ({ player, name }) => {
	const [selectedTab, setSelectedTab] = useState(0)

	const handleTabChange = (event, newValue) => {
		setSelectedTab(newValue)
	}

	const mockGameHistory = [
		{ date: '2025-03-10', result: 'Победа' },
		{ date: '2025-03-08', result: 'Поражение' },
		{ date: '2025-03-05', result: 'Победа' },
	]

	const mockInteractions = [
		{ playerName: 'Игрок1', interaction: 'Поддержка' },
		{ playerName: 'Игрок2', interaction: 'Поддержка' },
		{ playerName: 'Игрок3', interaction: 'Конфликт' },
	]

	return (
		<Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
			<Card sx={{ textAlign: 'center', padding: 3, mb: 3 }}>
				<Avatar sx={{ width: 80, height: 80, margin: 'auto' }}>
					{name[0]}
				</Avatar>
				<Typography variant='h6' fontWeight={600}>
					{name}
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					на сайте с 2022 года
				</Typography>
				<Tabs
					value={selectedTab}
					onChange={handleTabChange}
					centered
					sx={{ mt: 2 }}
				>
					<Tab label='Статистика' />
					<Tab label='Графики' />
					<Tab label='История игр' />
					<Tab label='Взаимодействие с игроками' />
				</Tabs>
			</Card>

			{selectedTab === 0 && (
				<Card>
					<CardContent>
						<Typography variant='h6'>Основная статистика</Typography>
						<Grid container spacing={2} alignItems='center' sx={{ mt: 2 }}>
							<Grid item xs={6}>
								<CircularProgress variant='determinate' value={61} size={60} />
								<Typography variant='body2'>
									62 (61%) Игры за мирного
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant='h6' align='center'>
									2707.83
								</Typography>
								<Typography variant='body2' align='center'>
									Общий ELO
								</Typography>
							</Grid>
						</Grid>
					</CardContent>
				</Card>
			)}

			{selectedTab === 1 && <RatingGraph player={player} />}

			{selectedTab === 2 && (
				<Card>
					<CardContent>
						<Typography variant='h6'>История игр</Typography>
						<List>
							{mockGameHistory.map((game, index) => (
								<ListItem key={index}>
									<ListItemText
										primary={`Дата: ${game.date}`}
										secondary={`Результат: ${game.result}`}
									/>
								</ListItem>
							))}
						</List>
					</CardContent>
				</Card>
			)}

			{selectedTab === 3 && <PlayerIntersection playerName={name} />}
		</Box>
	)
}

export default PlayerStats
