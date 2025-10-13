import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Grid,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { autumnQualData } from '../../modules/Fantasy/data/autumn/autumnQualData'

const SubmitFantasyTeamPageFull: React.FC = () => {
	const [name, setName] = useState('')
	const [secret, setSecret] = useState('')
	const [selected, setSelected] = useState<Record<number, number[]>>({})
	const [toast, setToast] = useState({
		open: false,
		message: '',
		severity: 'success',
	})
	const [playerId, setPlayerId] = useState<number | null>(null)

	const handleSelect = (kvalIndex: number, playerId: number) => {
		const current = selected[kvalIndex] || []
		const isSelected = current.includes(playerId)
		const updated = isSelected
			? current.filter(p => p !== playerId)
			: current.length < 4
			? [...current, playerId]
			: current
		setSelected({ ...selected, [kvalIndex]: updated })
	}

	const getSelectedCount = (kvalIndex: number) =>
		(selected[kvalIndex] || []).length

	const isSubmitDisabled = () => {
		// const allKvalsPicked = autumnQualData.every(
		// 	(_, i) => (selected[i]?.length || 0) === 2
		// )
		const nameOk = name.trim().length >= 2
		const secretOk = secret.trim().length > 5
		return !(nameOk && secretOk)
	}

	const handleSubmit = async () => {
		if (isSubmitDisabled()) return

		try {
			// 1. Создание или получение игрока
			const playerRes = await fetch('/api/fantasy_users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, secret }),
			})
			if (!playerRes.ok) throw new Error('Ошибка при сохранении игрока')
			const playerData = await playerRes.json()
			setPlayerId(playerData.id)

			// 2. Формируем payload для пиков
			const picksPayload = Object.entries(selected).flatMap(
				([kvalIndex, players]) =>
					players.map(player_id => ({
						fantasy_user_id: playerData.user.id,
						qualification_index: Number(kvalIndex),
						player_id,
					}))
			)

			// 3. Отправка пиков на сервер
			const picksRes = await fetch('/api/autumn/autumn_fantasy_picks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(picksPayload),
			})
			if (!picksRes.ok) {
				const errData = await picksRes.json()
				throw new Error(errData?.error || 'Ошибка при отправке пиков')
			}

			setToast({
				open: true,
				severity: 'success',
				message: 'Пики успешно отправлены!',
			})
		} catch (err: any) {
			setToast({ open: true, severity: 'error', message: err.message })
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
				<Typography variant='h4'>Добавление участника фэнтези-лиги</Typography>
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
					<Box sx={{ ml: 'auto' }}>
						<Button
							variant='contained'
							onClick={handleSubmit}
							disabled={isSubmitDisabled()}
						>
							Отправить пики
						</Button>
					</Box>
				</CardContent>
			</Card>

			<Grid container spacing={2}>
				{autumnQualData.map((qual, kvalIdx) => {
					const realIdx = kvalIdx + 4 // 👈 теперь начинается с 2
					return (
						<Grid item xs={12} md={3} key={qual.title}>
							<Card>
								<CardContent>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											mb: 1,
										}}
									>
										<Typography variant='h6'>{qual.title}</Typography>
										<Typography variant='caption'>{qual.date}</Typography>
									</Box>

									<Typography variant='body2' sx={{ mb: 1 }}>
										Выбрано: {getSelectedCount(realIdx)} / 4
									</Typography>

									<Box
										sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
									>
										{qual.players.map(player => {
											const isSelected = (selected[realIdx] || []).includes(
												player.id
											)
											const alreadyFull = getSelectedCount(realIdx) >= 4
											return (
												<Chip
													key={player.id}
													label={player.name}
													clickable
													onClick={() => handleSelect(realIdx, player.id)}
													color={isSelected ? 'success' : 'default'}
													variant={isSelected ? 'filled' : 'outlined'}
													aria-pressed={isSelected}
													disabled={!isSelected && alreadyFull}
												/>
											)
										})}
									</Box>
								</CardContent>
							</Card>
						</Grid>
					)
				})}
			</Grid>

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
