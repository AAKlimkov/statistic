import { Box } from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import PicksGroupedByQualification from '../modules/Fantasy/components/PicksGroupedByQualification'
import { PickDataWithUser } from '../modules/Fantasy/types'

export default function PlayersPickPage() {
	const [rawPicks, setRawPicks] = useState<PickDataWithUser[]>([])
	const [groupedPicks, setGroupedPicks] = useState<{
		[qualificationIndex: string]: any[]
	}>({})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchPicks = async () => {
			try {
				const res = await fetch('/api/fantasy/allPicks')
				if (!res.ok) throw new Error('Ошибка загрузки данных')
				const data = await res.json()
				setRawPicks(data)
			} catch (e: any) {
				setError(e.message || 'Неизвестная ошибка')
			} finally {
				setLoading(false)
			}
		}

		fetchPicks()
	}, [])

	useEffect(() => {
		const groupData = () => {
			const grouped: { [qualificationIndex: string]: any[] } = {}

			rawPicks.forEach(pick => {
				const qualIndex = pick.qualification_index.toString()

				if (!grouped[qualIndex]) {
					grouped[qualIndex] = []
				}

				let userEntry = grouped[qualIndex].find(
					u => u.userId === pick.fantasy_users.id
				)

				if (!userEntry) {
					userEntry = {
						userId: pick.fantasy_users.id,
						name: pick.fantasy_users.name,
						picks: [],
					}
					grouped[qualIndex].push(userEntry)
				}

				userEntry.picks.push({
					playerId: pick.players.id,
					playerName: pick.players.name,
				})
			})

			setGroupedPicks(grouped)
		}

		if (rawPicks.length > 0) {
			groupData()
		}
	}, [rawPicks])

	console.log(rawPicks)
	console.log('groupedPicks:', JSON.stringify(groupedPicks, null, 2))

	if (loading) return <p>Загрузка...</p>
	if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>

	return (
		<Box
			sx={{
				p: 4,
				backgroundColor: 'rgba(255, 255, 255, 0.9)', // полупрозрачный белый фон
				borderRadius: 2,
				boxShadow: 3,
				maxWidth: 900,
				margin: 'auto',
			}}
		>
			{' '}
			<PicksGroupedByQualification picks={rawPicks} />{' '}
		</Box>
	)
}
