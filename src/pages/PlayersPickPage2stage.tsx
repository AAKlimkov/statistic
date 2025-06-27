import { Box } from '@mui/material'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { CleanPick } from '../../api/fantasy/allPicksStage2'
import PicksGroupedByMatch from '../modules/Fantasy/components/PicksGroupedByMatch'
import { bracketData } from '../modules/Fantasy/data/summerLeagueData'

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
					fetch('/api/get-players'),
				])

				if (!picksRes.ok || !playersRes.ok) throw new Error('Ошибка загрузки')

				const rawPicks: {
					fantasy_user_id: number
					fantasy_user_name: string
					picks: CleanPick[]
				}[] = await picksRes.json()

				const players: { id: number; name: string }[] = await playersRes.json()

				const namesMap: Record<number, string> = {}
				players.forEach(p => {
					namesMap[p.id] = p.name
				})

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

	// Находим всех игроков, которые ещё остались в турнирной сетке
	const activePlayerIds = useMemo(() => {
		const ids = new Set<number>()

		const collectIds = (stageList: { left: any[]; right: any[] }) => {
			stageList.left.forEach(stage =>
				stage.matches.forEach(match =>
					match.players.forEach(p => {
						if (!p.isPlaceholder) ids.add(p.id)
					})
				)
			)
			stageList.right.forEach(stage =>
				stage.matches.forEach(match =>
					match.players.forEach(p => {
						if (!p.isPlaceholder) ids.add(p.id)
					})
				)
			)
		}

		collectIds(bracketData.upperBracket)
		collectIds(bracketData.lowerBracket)
		bracketData.finalStage.matches.forEach(match =>
			match.players.forEach(p => {
				if (!p.isPlaceholder) ids.add(p.id)
			})
		)

		return ids
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
