import { Alert, Box, Snackbar, Typography } from '@mui/material'
import * as React from 'react'
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
		<Box sx={{ p: 4 }}>
			<Typography variant='h4' gutterBottom>
				Добавление участника фэнтези-лиги
			</Typography>

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
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity={toast.severity} sx={{ width: '100%' }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}

export default SubmitFantasyTeamPage
