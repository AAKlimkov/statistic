// src/pages/admin/AdminDashboardPage.tsx

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Grid, Link as MuiLink, Paper, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../auth/hooks/useAuth'

// Массив для удобного рендеринга карточек-ссылок
const dashboardItems = [
	{
		title: 'Управление игроками',
		description: 'Добавление, редактирование и удаление игроков',
		link: '/admin/players',
		icon: <PeopleIcon sx={{ fontSize: 40 }} />,
	},
	{
		title: 'Управление турнирами',
		description: 'Создание турниров, управление участниками и результатами',
		link: '/admin/tournaments',
		icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
	},
	{
		title: 'Системные настройки',
		description: 'Управление тирами, ролями и другими параметрами',
		link: '/admin/settings', // Предполагаемый будущий роут
		icon: <SettingsIcon sx={{ fontSize: 40 }} />,
	},
]

export const AdminDashboardPage: React.FC = () => {
	// Получаем информацию о пользователе, чтобы поприветствовать его
	const { user } = useAuth()

	return (
		<Box>
			<Typography variant='h4' component='h1' gutterBottom>
				Добро пожаловать, Администратор!
			</Typography>
			<Typography variant='subtitle1' color='text.secondary' sx={{ mb: 4 }}>
				{user?.email}
			</Typography>

			<Grid container spacing={3}>
				{dashboardItems.map(item => (
					<Grid item xs={12} md={4} key={item.title}>
						<MuiLink component={RouterLink} to={item.link} underline='none'>
							<Paper
								sx={{
									p: 3,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									minHeight: 180,
									transition: 'transform 0.2s, box-shadow 0.2s',
									'&:hover': {
										transform: 'translateY(-5px)',
										boxShadow: 6,
									},
								}}
							>
								{item.icon}
								<Typography
									variant='h6'
									component='h2'
									sx={{ mt: 2, textAlign: 'center' }}
								>
									{item.title}
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ textAlign: 'center' }}
								>
									{item.description}
								</Typography>
							</Paper>
						</MuiLink>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}
