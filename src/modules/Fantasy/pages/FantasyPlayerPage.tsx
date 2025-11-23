import { Box, Button, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gamesResult } from '../data/autumn/result'

interface Pick {
	playerId: number
	playerName: string
	place: number | null
}

interface StageGroup {
	userId: number
	name: string
	picks: Pick[]
}

interface PlayerData {
	userId: number
	name: string
	picksByStage: Record<string, StageGroup[]>
}

const FantasyPlayerPage: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const [player, setPlayer] = useState<PlayerData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadData = async () => {
			try {
				const res = await fetch(`/api/autumn/player/${id}`)
				const data = await res.json()
				setPlayer(data)
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [id])

	if (loading)
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
				<CircularProgress />
			</Box>
		)

	if (!player)
		return (
			<Box sx={{ textAlign: 'center', mt: 5, color: '#333' }}>
				<Typography variant='h6'>Игрок не найден</Typography>
				<Button
					component={Link}
					to='/fantasyTable'
					sx={{ mt: 2, color: '#333', borderColor: '#333' }}
				>
					Назад к таблице
				</Button>
			</Box>
		)

	const kvalStages = [
		'Квалификация 1',
		'Квалификация 2',
		'Квалификация 3',
		'Квалификация 4',
	]
	const round16Stages = ['1/8 #1', '1/8 #2', '1/8 #3', '1/8 #4']
	const round8Stages = ['1/4 #1', '1/4 #2', '1/4 #3', '1/4 #4']
	const lastChanceStages = ['ПШ 1', 'ПШ 2']
	const round4Stages = ['1/2 #1', '1/2 #2']

	// порядок: сначала 1/4 → 1/8 → квалификации
	const stageGroups = [
		{ title: '1/2 финала', stages: round4Stages },
		{ title: 'Последний шанс', stages: lastChanceStages },
		{ title: '1/4 финала', stages: round8Stages },
		{ title: '1/8 финала', stages: round16Stages },
		{ title: 'Квалификация', stages: kvalStages },
	]

	const tableCellStyle: React.CSSProperties = {
		border: '1px solid #ddd',
		padding: '12px',
		textAlign: 'center',
		verticalAlign: 'top',
		color: '#333',
		wordBreak: 'break-word',
		backgroundColor: '#fff',
	}

	const tableHeaderStyle: React.CSSProperties = {
		...tableCellStyle,
		fontWeight: 600,
		backgroundColor: '#f5f5f5',
	}

	// Логика подсветки
	const getPlayerColor = (stage: string, pick: Pick) => {
		const stageData = gamesResult[stage]
		if (!stageData) return '#333'

		if (pick.place === null && stageData.passed?.includes(pick.playerId))
			return 'green'
		if (pick.place !== null && stageData.place?.includes(pick.playerId))
			return '#F1C905'
		return 'rgba(255,0,0,0.6)'
	}

	return (
		<Box
			sx={{
				maxWidth: 1200,
				mx: 'auto',
				p: 3,
				color: '#333',
				bgcolor: '#f0f0f0',
				minHeight: '100vh',
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Typography variant='h4' fontWeight={600}>
					{player.name}
				</Typography>
				<Button
					component={Link}
					to='/fantasyTable'
					variant='outlined'
					sx={{ color: '#333', borderColor: '#333' }}
				>
					Назад к таблице
				</Button>
			</Box>

			{stageGroups.map(group => (
				<Box key={group.title} sx={{ mb: 4 }}>
					<Typography variant='h5' sx={{ mb: 1, color: '#333' }}>
						{group.title}
					</Typography>

					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						{group.stages.map(stage => {
							const stageData = player.picksByStage[stage]
							return (
								<Box
									key={stage}
									style={{ ...tableCellStyle, flex: '1 1 calc(25% - 16px)' }}
								>
									<Typography style={tableHeaderStyle}>{stage}</Typography>
									{stageData && stageData[0]?.picks.length > 0 ? (
										stageData[0].picks.map(p => (
											<Typography
												key={p.playerId}
												sx={{ mt: 0.5, color: getPlayerColor(stage, p) }}
											>
												• {p.playerName}
											</Typography>
										))
									) : (
										<Typography sx={{ color: '#888' }}>нет данных</Typography>
									)}
								</Box>
							)
						})}
					</Box>
				</Box>
			))}
		</Box>
	)
}

export default FantasyPlayerPage
