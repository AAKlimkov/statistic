// src/layouts/AdminLayout.tsx

import {
	Box,
	Button,
	Divider,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import { Outlet, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../auth/hooks/useAuth'

/**
 * Layout для админ-панели.
 * Содержит боковое меню для навигации и основную область для контента.
 */
const AdminLayout = () => {
	const { signOut, user } = useAuth() // Получаем функцию выхода и информацию о пользователе
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Для будущей адаптивности

	// Если нужна мобильная версия, здесь можно будет добавить логику для скрытия/показа сайдбара

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh' }}>
			{/* Боковое меню (Сайдбар) */}
			<Box
				component='aside'
				sx={{
					width: 240,
					flexShrink: 0,
					backgroundColor: 'neutral.800', // Используем цвета из темы MUI, если она есть
					color: 'common.white',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Box sx={{ p: 2, textAlign: 'center' }}>
					<Typography variant='h6'>Король Мафии</Typography>
					<Typography variant='subtitle2'>Админ-панель</Typography>
				</Box>
				<Divider sx={{ borderColor: 'neutral.700' }} />

				{/* Навигация */}
				<Stack component='nav' spacing={1} sx={{ p: 2, flexGrow: 1 }}>
					<Button
						component={RouterLink}
						to='/admin/dashboard'
						variant='text'
						sx={{ color: 'white', justifyContent: 'flex-start' }}
					>
						Дашборд
					</Button>
					<Button
						component={RouterLink}
						to='/admin/players'
						variant='text'
						sx={{ color: 'white', justifyContent: 'flex-start' }}
					>
						Игроки
					</Button>
					<Button
						component={RouterLink}
						to='/admin/tournaments'
						variant='text'
						sx={{ color: 'white', justifyContent: 'flex-start' }}
					>
						Турниры
					</Button>
				</Stack>

				{/* Нижняя часть сайдбара с информацией о пользователе и кнопкой выхода */}
				<Box sx={{ p: 2, mt: 'auto' }}>
					<Divider sx={{ borderColor: 'neutral.700', mb: 2 }} />
					<Typography variant='body2' noWrap title={user?.email}>
						{user?.email}
					</Typography>
					<Button
						onClick={signOut}
						variant='outlined'
						color='error'
						fullWidth
						sx={{ mt: 1 }}
					>
						Выйти
					</Button>
				</Box>
			</Box>

			{/* Основная область для контента страниц */}
			<Box
				component='main'
				sx={{
					flexGrow: 1,
					p: { xs: 2, sm: 3 }, // Адаптивные отступы
					backgroundColor: 'grey.100',
				}}
			>
				<Outlet />
			</Box>
		</Box>
	)
}

export default AdminLayout
