import { Alert, Box, Button, Snackbar, Typography } from '@mui/material'
import * as React from 'react'
import { Link } from 'react-router-dom'
import FantasyForm from '../modules/Fantasy/components/FantasyForm'
import QualPicks from '../modules/Fantasy/components/QualPicks'
import { useFantasyForm } from '../modules/Fantasy/hooks/useFantasyForm'

const SubmitFantasyTeamPage: React.FC = () => {
	const {
		name,
		secret,
		selected,
		toast,
		setName,
		setSecret,
		handleSelect,
		submit,
		setToast,
	} = useFantasyForm()

	return (
		<Box
			sx={{
				backgroundColor: 'rgba(255, 255, 255, 0.85)',
				borderRadius: 2,
				boxShadow: 3,
				py: 4,
				px: 3,
				width: '100%',
				maxWidth: 1400,
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Typography variant='h4'>Добавление участника фэнтези-лиги</Typography>

				<Button
					component={Link}
					to='/fantasyTable'
					variant='outlined'
					color='primary'
					size='medium'
				>
					Общая таблица
				</Button>

			</Box>
			<FantasyForm
				name={name}
				secret={secret}
				setName={setName}
				setSecret={setSecret}
				onSubmit={submit}
			/>

			<QualPicks selected={selected} onSelect={handleSelect} />

			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={() => setToast(prev => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

export default SubmitFantasyTeamPage
