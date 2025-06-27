import { Box } from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { CleanPick } from '../../api/fantasy/allPicksStage2'
import PicksGroupedByMatch from '../modules/Fantasy/components/PicksGroupedByMatch'

export default function PlayersPickPage() {
	const [picks, setPicks] = useState<CleanPick[]>([])
	const [playerNames, setPlayerNames] = useState<Record<number, string>>({})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [picksRes, playersRes] = await Promise.all([
					fetch('/api/fantasy/allPicksStage2'),
					fetch('/api/get-players'), // 👈 тут должен быть API, возвращающий id + name
				])

				if (!picksRes.ok || !playersRes.ok) throw new Error('Ошибка загрузки')

				const rawPicks: {
					fantasy_user_id: number
					fantasy_user_name: string
					picks: CleanPick[]
				}[] = await picksRes.json()

				const players: { id: number; name: string }[] = await playersRes.json()

				// Создаем мапу: id → name
				const namesMap: Record<number, string> = {}
				players.forEach(p => {
					namesMap[p.id] = p.name
				})

				// Объединяем все пики в один массив
				const allPicks = rawPicks
					.flatMap(u => u.picks)
					.filter(pick => pick.pick_type !== 'loser')

				setPicks(allPicks)
				setPlayerNames(namesMap)
			} catch (e: any) {
				setError(e.message || 'Неизвестная ошибка')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	if (loading) return <p>Загрузка...</p>
	if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>

	return (
		<Box
			sx={{
				p: 4,
				backgroundColor: 'rgba(255, 255, 255, 0.9)',
				borderRadius: 2,
				boxShadow: 3,
				maxWidth: 900,
				margin: 'auto',
			}}
		>
			<PicksGroupedByMatch picks={picks} playerNames={playerNames} />
		</Box>
	)
}
