import { useState } from 'react'
import { qualData } from '../data/qualData'
import { PickData, PlayerData, SelectedPlayers, Toast } from '../types'

export const useFantasyForm = () => {
	const [name, setName] = useState('')
	const [secret, setSecret] = useState('')
	const [selected, setSelected] = useState<SelectedPlayers>({})
	const [toast, setToast] = useState<Toast>({
		open: false,
		message: '',
		severity: 'success',
	})

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

	const showToast = (message: string, severity: 'success' | 'error') => {
		setToast({ open: true, message, severity })
	}

	const validate = () => {
		if (name.trim().length < 2) {
			showToast('Имя должно содержать минимум 2 символа.', 'error')
			return false
		}
		if (secret.trim().length <= 5) {
			showToast('Кодовое слово должно быть длиннее 5 символов.', 'error')
			return false
		}
		if (!qualData.every((_, i) => (selected[i]?.length || 0) === 4)) {
			showToast('В каждом отборе нужно выбрать ровно 4 игрока.', 'error')
			return false
		}
		return true
	}

	const submit = async (): Promise<{
		player: PlayerData
		picks: PickData[]
	} | null> => {
		if (!validate()) return null

		try {
			// Создаем пользователя
			const playerRes = await fetch('/api/fantasy_picks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, secret }),
			})

			if (!playerRes.ok) throw new Error('Ошибка при сохранении игрока')
			const playerData: PlayerData = await playerRes.json()

			// Отправляем пики параллельно
			const picksPromises = Object.entries(selected).flatMap(
				([kvalIndex, players]) =>
					players.map((player_id: number) =>
						fetch('/api/fantasy_picks', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								fantasy_user_id: playerData.id,
								qualification_index: Number(kvalIndex),
								player_id,
							}),
						}).then(res => {
							if (!res.ok) throw new Error('Ошибка при сохранении пиков')
							return res.json()
						})
					)
			)

			const picks = await Promise.all(picksPromises)

			showToast('Участник успешно добавлен!', 'success')

			return { player: playerData, picks }
		} catch (error: any) {
			showToast(error.message || 'Ошибка при сохранении данных', 'error')
			return null
		}
	}

	return {
		name,
		secret,
		selected,
		toast,
		setName,
		setSecret,
		setSelected,
		setToast,
		handleSelect,
		submit,
	}
}
