import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Paper,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { qualData } from '../modules/Fantasy/data/qualData'

const FantasyPlayerView = () => {
	const { playerId } = useParams()
	const [player, setPlayer] = useState(null)
	const [picks, setPicks] = useState({})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)
				setError('')

				// Получаем данные игрока (имя, секрет и т.п.)
				const playerRes = await fetch(`/api/fantasy_players/${playerId}`)
				if (!playerRes.ok) throw new Error('Ошибка при загрузке данных игрока')
				const playerData = await playerRes.json()
				setPlayer(playerData)

				// Получаем пики игрока (выбранные игроки по квалификациям)
				const picksRes = await fetch(`/api/fantasy_picks?player_id=${playerId}`)
				if (!picksRes.ok) throw new Error('Ошибка при загрузке пиков игрока')
				const picksData = await picksRes.json()

				// Формируем структуру { kvalIndex: [tournament_player_id, ...], ... }
				const picksByQual = {}
				picksData.forEach(pick => {
					const kvalIndex = pick.qualification_index
					if (!picksByQual[kvalIndex]) picksByQual[kvalIndex] = []
					picksByQual[kvalIndex].push(pick.tournament_player_id)
				})
				setPicks(picksByQual)
			} catch (err: any) {
				setError(err.message || 'Ошибка загрузки')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [playerId])

	if (loading) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<CircularProgress />
			</Box>
		)
	}

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Alert severity='error'>{error}</Alert>
				<Button component={Link} to='/fantasy' sx={{ mt: 2 }}>
					Вернуться к списку
				</Button>
			</Box>
		)
	}

	return (
		<Box sx={{ p: 4 }}>
			<Typography variant='h4' gutterBottom>
				Просмотр участника: {player?.name}
			</Typography>
			<Typography variant='subtitle1' gutterBottom>
				Кодовое слово: {player?.secret}
			</Typography>

			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
				{qualData.map((qual, kvalIndex) => (
					<Paper
						key={kvalIndex}
						elevation={3}
						sx={{
							p: 2,
							flex: '1 1 45%',
							minWidth: 300,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<Typography variant='h6'>
							{qual.title} — {qual.date}
						</Typography>

						<Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							{qual.players.map((playerName, i) => {
								const isPicked = (picks[kvalIndex] || []).includes(playerName)
								return (
									<Button
										key={i}
										variant={isPicked ? 'contained' : 'outlined'}
										color={isPicked ? 'primary' : 'inherit'}
										disabled
										sx={{ flexBasis: '48%', whiteSpace: 'nowrap' }}
									>
										{playerName}
									</Button>
								)
							})}
						</Box>
					</Paper>
				))}
			</Box>

			<Button component={Link} to='/fantasy' sx={{ mt: 4 }}>
				Назад к списку участников
			</Button>
		</Box>
	)
}

export default FantasyPlayerView
