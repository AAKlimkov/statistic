import { Box } from '@mui/material'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { CleanPick } from '../../api/fantasy/allPicksStage2'
import PicksGroupedByMatch from '../modules/Fantasy/components/PicksGroupedByMatch'
import { tournamentResults } from '../modules/Fantasy/data/result'
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

	// --- Новое: определяем выбывших игроков по полю "losers" в результатах ---
	const { activePlayerIds, eliminatedPlayerMap } = useMemo(() => {
		const ids = new Set<number>()
		const eliminated: Record<number, string> = {}

		const processStage = (stage: { name: string; matches: any[] }) => {
			stage.matches.forEach(match => {
				// Добавляем всех игроков
				match.players.forEach(p => {
					if (!p.isPlaceholder) ids.add(p.id)
				})

				// Определяем, кто вылетел
				const matchResult = tournamentResults[match.id]
				if (matchResult?.losers) {
					matchResult.losers.forEach(playerId => {
						if (!eliminated[playerId]) {
							eliminated[playerId] = stage.name
						}
					})
				}
			})
		}

		;[
			...bracketData.upperBracket.left,
			...bracketData.upperBracket.right,
			...bracketData.lowerBracket.left,
			...bracketData.lowerBracket.right,
			bracketData.finalStage,
		].forEach(processStage)

		return { activePlayerIds: ids, eliminatedPlayerMap: eliminated }
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
			<PicksGroupedByMatch
				picks={picks}
				playerNames={playerNames}
				activePlayerIds={activePlayerIds}
				eliminatedPlayerMap={eliminatedPlayerMap}
			/>
		</Box>
	)
}
