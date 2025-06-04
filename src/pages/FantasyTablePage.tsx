import { Box, Button, Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'
import FantasyTable from '../modules/Fantasy/FantasyTable'

const FantasyTablePage = () => {
	return (
		<Box sx={{ padding: 2 }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: 2,
				}}
			>
				<Typography variant='h4' component='h1'>
					Фэнтези Лига
				</Typography>
				<Button
					component={Link}
					to='/fantasyQual/add'
					variant='contained'
					color='primary'
				>
					Зарегистрировать участника
				</Button>
			</Box>

			<FantasyTable />
		</Box>
	)
}

export default FantasyTablePage
