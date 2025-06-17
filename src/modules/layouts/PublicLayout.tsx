// src/layouts/PublicLayout.tsx

import { Box, Button, Stack } from '@mui/material'
import { Link, Outlet } from 'react-router-dom'

/**
 * Layout для публичной части сайта.
 * Содержит фоновое изображение и основную навигацию.
 */
const PublicLayout = () => (
	<Box
		sx={{
			minHeight: '100vh',
			backgroundImage: `url(/assets/setka_upd.jpg)`, // Убедитесь, что этот файл есть в папке public/assets
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			display: 'flex',
			flexDirection: 'column',
		}}
	>
		{/* Верхняя навигационная панель */}
		<Box
			component='nav'
			sx={{
				padding: { xs: 1, sm: 2 }, // Адаптивность для разных экранов
				backgroundColor: 'rgba(0, 0, 0, 0.7)',
				backdropFilter: 'blur(5px)', // Эффект размытия для современных браузеров
				borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
			}}
		>
			<Stack
				direction='row'
				spacing={1}
				justifyContent='center'
				flexWrap='wrap'
			>
				<Button component={Link} to='/' variant='contained' size='small'>
					Главная
				</Button>
				<Button
					component={Link}
					to='/fantasyQual/add'
					variant='contained'
					size='small'
				>
					Регистрация
				</Button>
				<Button
					component={Link}
					to='/fantasyTable'
					variant='contained'
					size='small'
				>
					Таблица
				</Button>
				<Button
					component={Link}
					to='/fantasyPickRate'
					variant='contained'
					size='small'
				>
					Пикрейт
				</Button>
				<Button
					component={Link}
					to='/fantasyRules'
					variant='contained'
					size='small'
				>
					Правила
				</Button>
				<Button
					component={Link}
					to='/tournaments'
					variant='contained'
					size='small'
				>
					Прошлые турниры
				</Button>
				<Button component={Link} to='/players' variant='contained' size='small'>
					Игроки
				</Button>
			</Stack>
		</Box>

		{/* Основная контентная область, где будут отображаться дочерние страницы */}
		<Box
			component='main'
			sx={{
				flexGrow: 1,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				p: 3,
			}}
		>
			{/* <Outlet /> — сюда react-router "вставит" компонент текущей страницы */}
			<Outlet />
		</Box>
	</Box>
)

export default PublicLayout
