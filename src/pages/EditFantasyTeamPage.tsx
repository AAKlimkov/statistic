import { Alert, Box, Snackbar, Typography } from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FantasyForm from '../modules/Fantasy/components/FantasyForm'
import QualPicks from '../modules/Fantasy/components/QualPicks'
import { useFantasyForm } from '../modules/Fantasy/hooks/useFantasyForm'
import { PickData } from '../modules/Fantasy/types'

const EditFantasyTeamPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [confirmOpen, setConfirmOpen] = useState(false)
	const [initialData, setInitialData] = useState<{
		name: string
		secret: string
		selected: Record<number, number[]>
	} | null>(null)

	const {
		name,
		secret,
		setName,
		setSecret,
		toast,
		setToast,
		submit,
		handleSelect,
		setSelected,
		selected,
		submitEdit,
	} = useFantasyForm()

	useEffect(() => {
		if (!userId) return

		const fetchUserAndPicks = async () => {
			try {
				const [userRes, picksRes] = await Promise.all([
					fetch(`/api/fantasy/getUser?user_id=${userId}`),
					fetch(`/api/fantasy/getPicks?user_id=${userId}`),
				])

				if (!userRes.ok) throw new Error('Ошибка загрузки данных игрока')
				if (!picksRes.ok) throw new Error('Ошибка загрузки пиков')

				const userData = await userRes.json()
				const picksData = await picksRes.json()

				const selected: Record<number, number[]> = {}
				picksData.forEach((pick: PickData) => {
					if (!selected[pick.qualification_index])
						selected[pick.qualification_index] = []
					selected[pick.qualification_index].push(pick.player_id)
				})

				setInitialData({
					name: userData.name,
					secret: '',
					selected,
				})
			} catch (err: any) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		fetchUserAndPicks()
	}, [userId])

	useEffect(() => {
		if (initialData) {
			setName(initialData.name)
			setSelected(initialData.selected)
		}
	}, [initialData])

	const handleSubmit = async () => {
		const result = await submitEdit(+userId)
	}

	const handleDelete = async () => {
		if (!userId) return
		if (
			!window.confirm(
				'Вы уверены, что хотите удалить этого участника? Это действие необратимо.'
			)
		)
			return

		try {
			const res = await fetch('/api/fantasy_users_delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: Number(userId), secret }),
			})
			if (!res.ok) throw new Error('Ошибка при удалении участника')
			navigate('/fantasy_teams')
		} catch (err: any) {
			alert(err.message)
		}
	}
	if (loading) return <div>Загрузка...</div>
	if (error) return <div>Ошибка: {error}</div>
	if (!initialData) return null

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
			<Typography variant='h4' gutterBottom>
				Просмотр участника фэнтези-лиги
			</Typography>

			<FantasyForm
				name={name}
				secret={secret}
				setName={setName}
				setSecret={setSecret}
				onSubmit={handleSubmit}
				onDelete={handleDelete}
				isEdit={true}
			/>

			<QualPicks selected={selected} onSelect={handleSelect} />

			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={() => setToast(prev => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					severity={toast.severity}
					sx={{
						width: '100%',
						fontSize: '1.25rem',
						padding: '16px 24px',
						minWidth: '300px',
						boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
					}}
				>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}

export default EditFantasyTeamPage
