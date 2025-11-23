import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mainStage } from '../../modules/Fantasy/data/autumn/autumnQualData'

type PickItem = { player_id: number; place: number | null }

const SubmitFantasyTeamPageFull: React.FC = () => {
	const [name, setName] = useState('')
	const [secret, setSecret] = useState('')
	const [selected, setSelected] = useState<Record<number, PickItem[]>>({})
	const [toast, setToast] = useState({
		open: false,
		message: '',
		severity: 'success',
	})
	const [playerId, setPlayerId] = useState<number | null>(null)

	// 🔹 Правила выбора для разных этапов
	const getLimits = (stageIndex: number) => {
		// 1/4 финалы: 4 прошедших + 3 с place = 7
		if (stageIndex >= 8 && stageIndex <= 11) {
			return { winners: 4, places: 3, placeValue: 5 }
		}
		if (stageIndex >= 12 && stageIndex <= 11) {
			return { winners: 2, places: 0, placeValue: 0 }
		}
		if (stageIndex >= 14 && stageIndex <= 15) {
			return { winners: 5, places: 0, placeValue: 0 }
		}
		// можно добавить другие этапы позже
		return { winners: 5, places: 2, placeValue: 6 }
	}

	const handleSelect = (stageIndex: number, playerId: number) => {
		const current = selected[stageIndex] || []
		const isSelected = current.some(p => p.player_id === playerId)
		const { winners, places, placeValue } = getLimits(stageIndex)

		const currentWinners = current.filter(p => p.place === null)
		const currentPlaces = current.filter(p => p.place === placeValue)

		if (isSelected) {
			const updated = current.filter(p => p.player_id !== playerId)
			setSelected({ ...selected, [stageIndex]: updated })
		} else {
			if (currentWinners.length < winners) {
				setSelected({
					...selected,
					[stageIndex]: [...current, { player_id: playerId, place: null }],
				})
			} else if (currentPlaces.length < places) {
				setSelected({
					...selected,
					[stageIndex]: [
						...current,
						{ player_id: playerId, place: placeValue },
					],
				})
			}
		}
	}

	const getSelectedCount = (stageIndex: number) =>
		(selected[stageIndex] || []).length

	const isSubmitDisabled = () => {
		const allPicked = [14, 15].every(i => (selected[i]?.length || 0) === 5)
		const nameOk = name.trim().length >= 2
		const secretOk = secret.trim().length > 5
		return !(nameOk && secretOk && allPicked)
	}

	const handleSubmit = async () => {
		if (isSubmitDisabled()) return

		try {
			const playerRes = await fetch('/api/fantasy_users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, secret }),
			})
			const playerData = await playerRes.json()
			if (!playerRes.ok)
				throw new Error(playerData?.error || 'Ошибка при сохранении игрока')
			setPlayerId(playerData.id ?? playerData.user?.id)

			const stageNames: Record<number, string> = {
				14: '1/2 #1',
				15: '1/2 #2',
			}

			const picksPayload = Object.entries(selected).flatMap(
				([stageIndexStr, picks]) => {
					const stageIndex = Number(stageIndexStr)
					return picks.map(p => ({
						fantasy_user_id: playerData.id ?? playerData.user?.id,
						qualification_index: stageIndex,
						player_id: p.player_id,
						place: p.place,
						stage_name: stageNames[stageIndex] || null,
					}))
				}
			)

			const picksRes = await fetch('/api/autumn/autumn_fantasy_picks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(picksPayload),
			})
			const picksData = await picksRes.json()
			if (!picksRes.ok)
				throw new Error(picksData?.error || 'Ошибка при отправке пиков')

			setToast({
				open: true,
				severity: 'success',
				message: 'Пики успешно отправлены!',
			})
		} catch (err: any) {
			setToast({
				open: true,
				severity: 'error',
				message: err.message || 'Ошибка при сохранении игрока',
			})
		}
	}

	return (
		<Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', py: 4, px: 2 }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Typography variant='h4' color='white'>
					Добавление участника фэнтези-лиги (последние шанс)
				</Typography>
				<Button component={Link} to='/fantasyTable' variant='outlined'>
					Общая таблица
				</Button>
			</Box>

			<Card sx={{ mb: 3 }}>
				<CardContent
					sx={{
						display: 'flex',
						gap: 2,
						flexWrap: 'wrap',
						alignItems: 'center',
					}}
				>
					<TextField
						label='Имя'
						value={name}
						onChange={e => setName(e.target.value)}
						sx={{ minWidth: 240 }}
					/>
					<TextField
						label='Кодовое слово'
						value={secret}
						onChange={e => setSecret(e.target.value)}
						type='password'
						sx={{ minWidth: 240 }}
						helperText='Больше 5 символов'
					/>
					{/* <Box sx={{ ml: 'auto' }}>
						<Button
							variant='contained'
							onClick={handleSubmit}
							disabled={isSubmitDisabled()}
						>
							Отправить пики
						</Button>
					</Box> */}
				</CardContent>
			</Card>

			{/* 🔹 Контейнер всех этапов */}
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 2,
				}}
			>
				{mainStage.map((qual, kvalIdx) => {
					const realIdx = kvalIdx + 14
					const { winners, places, placeValue } = getLimits(realIdx)

					return (
						<Card
							key={realIdx}
							sx={{
								flex: '1 1 45%', // 2 карточки в ряд на мобилке
								minWidth: 240,
								'@media (min-width: 900px)': { flex: '1 1 22%' }, // 4 в ряд на десктопе
							}}
						>
							<CardContent>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										mb: 1,
									}}
								>
									<Typography variant='h6'>{qual.title}</Typography>
									<Typography variant='caption'>{qual.date}</Typography>
								</Box>

								<Typography variant='body2' sx={{ mb: 1 }}>
									Выбрано: {getSelectedCount(realIdx)} / {winners + places}
								</Typography>

								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{qual.players.map(player => {
										const sel = (selected[realIdx] || []).find(
											p => p.player_id === player.id
										)
										const isSelected = Boolean(sel)
										const isPlace = sel?.place === placeValue
										const currentWinners = (selected[realIdx] || []).filter(
											p => p.place === null
										).length
										const currentPlaces = (selected[realIdx] || []).filter(
											p => p.place === placeValue
										).length
										const alreadyFull =
											currentWinners >= winners && currentPlaces >= places

										return (
											<Chip
												key={player.id}
												label={
													isPlace
														? `${player.name} (место ${placeValue})`
														: player.name
												}
												clickable
												onClick={() => handleSelect(realIdx, player.id)}
												color={
													isSelected
														? isPlace
															? 'warning'
															: 'success'
														: 'default'
												}
												variant={isSelected ? 'filled' : 'outlined'}
												aria-pressed={isSelected}
												disabled={!isSelected && alreadyFull}
												sx={{ flex: '1 1 100px' }}
											/>
										)
									})}
								</Box>
							</CardContent>
						</Card>
					)
				})}
			</Box>

			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={() => setToast(prev => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert severity={toast.severity} sx={{ width: '100%' }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}

export default SubmitFantasyTeamPageFull
