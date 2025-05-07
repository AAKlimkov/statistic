import {
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
import PlayerStatistic from './PlayerStatistic'
// import PlayerIntersection from './PlayerIntersection'
import RatingGraph from './RatingGraph'

const PlayerStats = ({ id, name }) => {
	const [player, setPlayer] = useState(null)
	const [statistic, setStatistic] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [selectedTab, setSelectedTab] = useState(0)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				// Выполняем два запроса параллельно
				const [ratingHistoryRes, statisticRes] = await Promise.all([
					fetch(
						`https://mafia-server-cyan.vercel.app/api/player/${id}/ratingHistory`
					),
					fetch(
						`https://mafia-server-cyan.vercel.app/api/player/${id}/statistic`
					),
				])

				const ratingHistoryData = await ratingHistoryRes.json()
				const statisticData = await statisticRes.json()

				// Сохраняем оба набора данных
				setPlayer(ratingHistoryData)
				setStatistic(statisticData)
			} catch (err) {
				setError('Ошибка при загрузке данных.')
				console.error('Ошибка при загрузке:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [id])

	console.log(player)

	if (loading) {
		return <div>Загрузка...</div>
	}

	if (error) {
		return <div>{error}</div>
	}

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
		<Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3 }}>
			<Card sx={{ textAlign: 'center', padding: 3, mb: 3 }}>
				{/* <Avatar sx={{ width: 80, height: 80, margin: 'auto' }}>
					{player[0].name[0]}
				</Avatar> */}
				<Typography variant='h6' fontWeight={600}>
					{player[0].name}
				</Typography>
				{/* <Typography variant='body2' color='text.secondary'>
					на сайте с 2022 года
				</Typography> */}
				<Tabs
					value={selectedTab}
					onChange={handleTabChange}
					centered
					sx={{ mt: 2 }}
				>
					<Tab label='Статистика' />
					<Tab label='Графики' />
					{/* <Tab label='История игр' />
					<Tab label='Взаимодействие с игроками' /> */}
				</Tabs>
			</Card>

			{selectedTab === 0 && <PlayerStatistic statistic={statistic} />}

			{selectedTab === 1 && (
				<Box sx={{ maxHeight: 'calc(50vh )', overflowY: 'hidden' }}>
					<RatingGraph player={player} />
				</Box>
			)}

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
