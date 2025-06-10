import { Box, Container, Paper } from '@mui/material'
import { ReactNode } from 'react'

interface AuthLayoutProps {
	children: ReactNode
	title?: string
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				bgcolor: 'grey.200',
			}}
		>
			<Container maxWidth='sm'>
				<Paper
					elevation={3}
					sx={{
						p: 4,
						display: 'flex',
						flexDirection: 'column',
						gap: 2,
					}}
				>
					{children}
				</Paper>
			</Container>
		</Box>
	)
}
