import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { qualData } from '../data/qualData'
import {
	PickData,
	PlayerData,
	SelectedPlayers,
	Stage2PickPayload,
	Toast,
} from '../types'

export const useFantasyForm = () => {
	const [name, setName] = useState('')
	const [secret, setSecret] = useState('')
	const [selected, setSelected] = useState<SelectedPlayers>({})
	const [toast, setToast] = useState<Toast>({
		open: false,
		message: '',
		severity: 'success',
	})

	const navigate = useNavigate()

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
			// 1. Создание игрока
			const playerRes = await fetch('/api/fantasy_users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, secret }),
			})

			if (!playerRes.ok) throw new Error('Ошибка при сохранении игрока')
			const playerData: PlayerData = await playerRes.json()

			// 2. Подготовка массива пиков
			const picksPayload: PickData[] = Object.entries(selected).flatMap(
				([qualification_index, players]) =>
					players.map(player_id => ({
						fantasy_user_id: playerData.id,
						qualification_index: Number(qualification_index),
						player_id,
					}))
			)

			// 3. Отправка всех пиков одним запросом
			const picksRes = await fetch('/api/autumn/autumn_fantasy_picks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(picksPayload),
			})

			if (!picksRes.ok) throw new Error('Ошибка при сохранении пиков')
			const picks: PickData[] = await picksRes.json()

			showToast('Участник успешно добавлен!', 'success')
			setTimeout(() => {
				navigate('/')
			}, 3000)
			return { player: playerData, picks }
		} catch (error: any) {
			showToast(error.message || 'Ошибка при сохранении данных', 'error')
			return null
		}
	}

	const submitEdit = async (
		fantasy_user_id: number
	): Promise<PickData[] | null> => {
		if (!validate()) return null

		try {
			const picksBody: PickData[] = Object.entries(selected).flatMap(
				([qualification_index, players]) =>
					players.map(player_id => ({
						fantasy_user_id,
						qualification_index: Number(qualification_index),
						player_id,
					}))
			)

			const requestBody = {
				secret,
				fantasy_user_id,
				picks: picksBody,
			}

			const picksRes = await fetch('/api/fantasy/user_pick_update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody),
			})

			if (!picksRes.ok) {
				const errData = await picksRes.json()
				const message =
					errData?.error === 'Invalid secret word'
						? '⛔ Неверное кодовое слово. Проверьте ввод.'
						: 'Ошибка при сохранении пиков'
				throw new Error(message)
			}

			const picks: PickData[] = await picksRes.json()
			showToast('Пики успешно обновлены!', 'success')
			return picks
		} catch (error: any) {
			showToast(error.message || 'Ошибка при сохранении данных', 'error')
			return null
		}
	}

	const submitStage2Picks = async (
		fantasy_user_id: number
	): Promise<Stage2PickPayload[] | null> => {
		if (!validate()) return null

		try {
			// Здесь selected берём из текущего состояния в хуке (замыкание)
			// selected: Record<number, number[]>
			const picksBody = Object.entries(selected).flatMap(
				([qualification_index, players]) =>
					players.map(player_id => ({
						fantasy_user_id,
						qualification_index: Number(qualification_index),
						player_id,
					}))
			)

			const requestBody = {
				secret,
				fantasy_user_id,
				picks: picksBody,
			}

			const res = await fetch('/api/fantasy/stage2_pick_update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody),
			})

			if (!res.ok) {
				const errData = await res.json()
				throw new Error(errData?.error || 'Ошибка при сохранении этапа 2')
			}

			const result = await res.json()
			setToast({
				open: true,
				severity: 'success',
				message: 'Пики этапа 2 успешно обновлены!',
			})
			return result
		} catch (err: any) {
			setToast({
				open: true,
				severity: 'error',
				message: err.message || 'Ошибка при сохранении данных',
			})
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
		submitEdit,
		submitStage2Picks,
	}
}
