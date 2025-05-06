import {
	Avatar,
	Box,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemText,
	Tab,
	Tabs,
	Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
// import PlayerDashboard from './PlayerDashboard'
// import PlayerIntersection from './PlayerIntersection'
import RatingGraph from './RatingGraph'

const PlayerStats = ({ id, name }) => {
	console.log(id)
	const [player, setPlayer] = useState()
	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch(
					`https://mafia-server-cyan.vercel.app/api/player/${id}/ratingHistory`
				)
				const data = await res.json()

				setPlayer(data)
			} catch (err) {
				console.error('Ошибка при загрузке игроков:', err)
			}
		}

		fetchPlayers()
	}, [])

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
				<Avatar sx={{ width: 80, height: 80, margin: 'auto' }}>{name}</Avatar>
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

			{/* {selectedTab === 0 && <PlayerDashboard data={player} />} */}

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

			{/* {selectedTab === 3 && <PlayerIntersection playerName={name} />} */}
		</Box>
	)
}

export default PlayerStats
