import { Alert, Box, Button, Paper, Snackbar, Typography } from '@mui/material'
import * as React from 'react'
import { useState } from 'react'
import InputField from '../components/InputField'
import { qualData } from '../modules/Fantasy/data/qualData'

const AddFantasyPlayerPage = () => {
	const [name, setName] = useState('')
	const [secret, setSecret] = useState('')
	const [selected, setSelected] = useState({})
	const [toast, setToast] = useState({
		open: false,
		message: '',
		severity: 'info' as 'success' | 'error',
	})

	const handleSelect = (kvalIndex: number, player: string) => {
		const current = selected[kvalIndex] || []
		const isSelected = current.includes(player)
		const updated = isSelected
			? current.filter((p: string) => p !== player)
			: current.length < 4
			? [...current, player]
			: current
		setSelected({ ...selected, [kvalIndex]: updated })
	}

	const showToast = (message: string, severity: 'success' | 'error') => {
		setToast({ open: true, message, severity })
	}

	const handleSubmit = async () => {
		const isNameValid = name.trim().length >= 2
		const isSecretValid = secret.trim().length > 5
		const areAllKvalsValid = qualData.every(
			(_, index) => (selected[index]?.length || 0) === 4
		)

		if (!isNameValid) {
			showToast('Имя должно содержать минимум 2 символа.', 'error')
			return
		}

		if (!isSecretValid) {
			showToast('Кодовое слово должно быть длиннее 5 символов.', 'error')
			return
		}

		if (!areAllKvalsValid) {
			showToast('В каждом отборе нужно выбрать ровно 4 игрока.', 'error')
			return
		}

		try {
			// Сохраняем игрока
			const playerRes = await fetch(
				'https://mafia-server-cyan.vercel.app/api/fantasy_picks',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, secret }),
				}
			)
			if (!playerRes.ok) throw new Error('Ошибка при сохранении игрока')

			const playerData = await playerRes.json()

			// Сохраняем пики (выбранных игроков) по очереди или параллельно
			const picks = []
			for (const kvalIndex in selected) {
				for (const tournament_player_id of selected[kvalIndex]) {
					const pickRes = await fetch('/api/fantasy_picks', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							player_id: playerData.id,
							qualification_index: Number(kvalIndex),
							tournament_player_id,
						}),
					})
					if (!pickRes.ok) throw new Error('Ошибка при сохранении пиков')
					picks.push(await pickRes.json())
				}
			}

			showToast('Участник успешно добавлен!', 'success')
			console.log('Игрок:', playerData)
			console.log('Пики:', picks)
		} catch (error) {
			showToast(error.message || 'Ошибка при сохранении данных', 'error')
		}
	}

	return (
		<Box sx={{ p: 4 }}>
			<Typography variant='h4' gutterBottom>
				Добавление участника фэнтези-лиги
			</Typography>
			<Box
				sx={{
					mb: 4,
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					maxWidth: 400,
				}}
			>
				<InputField
					value={name}
					onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
						setName(e.target.value)
					}
					placeholder='Имя'
				/>
				<InputField
					value={secret}
					onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
						setSecret(e.target.value)
					}
					placeholder='Кодовое слово'
				/>
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 2,
					justifyContent: 'space-between',
				}}
			>
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
							{qual.players.map((player, i) => {
								const isSelected = (selected[kvalIndex] || []).includes(player)
								return (
									<Button
										key={i}
										variant={isSelected ? 'contained' : 'outlined'}
										color={isSelected ? 'primary' : 'inherit'}
										onClick={() => handleSelect(kvalIndex, player)}
										sx={{ flexBasis: '48%', whiteSpace: 'nowrap' }}
									>
										{player}
									</Button>
								)
							})}
						</Box>
					</Paper>
				))}
			</Box>
			<Box sx={{ mt: 4 }}>
				<Button variant='contained' color='success' onClick={handleSubmit}>
					Добавить участника
				</Button>
			</Box>
			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={() => setToast(prev => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity={toast.severity} sx={{ width: '100%' }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}

export default AddFantasyPlayerPage
