import { Box } from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import PicksGroupedByQualification from '../modules/Fantasy/components/PicksGroupedByQualification'
import { PickDataWithUser } from '../modules/Fantasy/types'

export default function PlayersPickPage() {
	const [rawPicks, setRawPicks] = useState<PickDataWithUser[]>([])

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
