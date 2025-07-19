import { Box, Paper, Typography } from '@mui/material'
import * as React from 'react'
import FantasyTable from '../modules/Fantasy/pages/FantasyTable'

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
				{/* <Button
					component={Link}
					to='/fantasyQual/add'
					variant='contained'
					color='primary'
				>
					Зарегистрировать участника
				</Button> */}
			</Box>

			<Paper
				elevation={3}
				sx={{
					bgcolor: 'rgba(255, 255, 255, 0.9)', // белый фон с легкой прозрачностью
					padding: 2,
					borderRadius: 2,
				}}
			>
				<FantasyTable />
			</Paper>
		</Box>
	)
}

export default FantasyTablePage
