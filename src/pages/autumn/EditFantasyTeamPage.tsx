import {
	Box,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { gamesResult } from '../../modules/Fantasy/data/autumn/result'

interface Pick {
	playerId: number
	playerName: string
}

interface UserPicks {
	userId: number
	name: string
	picks: Pick[]
}

interface PicksByStage {
	[stageName: string]: UserPicks[]
}

interface GroupedPicksResponse {
	userId: number
	name: string
	picksByStage: PicksByStage
}

const EditFantasyTeamPage: React.FC = () => {
	const { fantasy_user } = useParams<{ fantasy_user: string }>()
	const [groupedPicks, setGroupedPicks] = useState<GroupedPicksResponse | null>(
		null
	)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchPicks = async () => {
			if (!fantasy_user) return
			try {
				const res = await fetch(`/api/autumn/player/${fantasy_user}`)
				if (!res.ok) throw new Error('Ошибка при загрузке пиков')
				const data: GroupedPicksResponse = await res.json()
				setGroupedPicks(data)
			} catch (err: any) {
				console.error(err)
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		fetchPicks()
	}, [fantasy_user])

	if (loading) return <CircularProgress sx={{ mt: 4 }} />
	if (error) return <Typography color='error'>{error}</Typography>
	if (!groupedPicks) return <Typography>Нет данных для этого игрока</Typography>

	const { name, picksByStage } = groupedPicks

	return (
		<Box
			sx={{
				width: '100%',
				maxWidth: 1400,
				mx: 'auto',
				py: 4,
				px: 2,
				backgroundColor: '#f5f5f5',
			}}
		>
			<Typography variant='h4' sx={{ mb: 3 }}>
				Пики игрока {name}
			</Typography>

			{Object.entries(picksByStage).map(([stageName, users]) => (
				<Box key={stageName} sx={{ mb: 4 }}>
					<Typography variant='h6' sx={{ mb: 2 }}>
						{stageName}
					</Typography>

					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
						{users.map(user => (
							<Card
								key={`${stageName}-${user.userId}`}
								sx={{ flex: '1 1 300px' }}
							>
								<CardContent>
									<Typography variant='subtitle1' sx={{ mb: 1 }}>
										Игрок: {user.name}
									</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
										{user.picks.map(pick => {
											const passed = gamesResult[stageName]?.includes(
												pick.playerId
											)
											return (
												<Chip
													key={`${stageName}-${pick.playerId}`}
													label={pick.playerName}
													color={passed ? 'success' : 'default'}
													variant={passed ? 'filled' : 'outlined'}
												/>
											)
										})}
									</Box>
								</CardContent>
							</Card>
						))}
					</Box>
				</Box>
			))}
		</Box>
	)
}

export default EditFantasyTeamPage
