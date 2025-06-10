import { createHashRouter } from 'react-router-dom'

// Layouts - "обертки" для групп страниц

// Компоненты-защитники для роутинга

// --- Импорт всех ваших страниц ---
// (Вам нужно будет создать эти файлы или убедиться, что они существуют)

// Основные публичные страницы
import EditFantasyTeamPage from '../pages/EditFantasyTeamPage'
import FantasyMainPage from '../pages/FantasyMainPage'
import FantasyRulesPage from '../pages/FantasyRulesPage'
import FantasyTablePage from '../pages/FantasyTablePage'
import PlayersPickPage from '../pages/PlayersPickPage'
import AddFantasyPlayerPage from '../pages/SubmitFantasyTeamPage'

// Страницы со своей собственной структурой (без PublicLayout)
import PlayerPage from '../pages/PlayerPage'
import PlayersTablePage from '../pages/PlayersTablePage'
import TournamentPage from '../pages/TournamentPage'
import TournamentsTablePage from '../pages/TournamentsTablePage'

// --- Страницы аутентификации ---

// --- Страницы админки ---
import AdminLayout from '../modules/layouts/AdminLayout'
import PublicLayout from '../modules/layouts/PublicLayout'

import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage'
import { FantasyBracketPage } from '@/modules/Fantasy/pages/FantasyBracketPage'
import { AdminDashboardPage } from '../modules/admin/AdminDashboardPage'
import { AdminPlayersPage } from '../modules/admin/AdminPlayersPage'
import { PrivateRoute } from './components/PrivateRoute'
import { PublicRoute } from './components/PublicRoute'

export const router = createHashRouter([
	{
		// === ГРУППА 1: Публичные страницы с общим Layout'ом ===
		// Все эти страницы будут иметь вашу основную навигацию сверху
		path: '/',
		element: <PublicLayout />,
		children: [
			{
				index: true, // Главная страница (path: '/')
				element: <FantasyMainPage />,
			},
			{
				path: 'fantasyTable',
				element: <FantasyTablePage />,
			},
			{
				path: 'fantasyPickRate',
				element: <PlayersPickPage />,
			},
			{
				path: 'fantasyQual/add',
				element: <AddFantasyPlayerPage />,
			},
			{
				path: 'fantasyRules',
				element: <FantasyRulesPage />,
			},
			{
				// Роут с параметром для редактирования команды
				path: 'fantasy/player/:userId',
				element: <EditFantasyTeamPage />,
			},
			{
				path: 'fantasyQual/add2',
				element: <FantasyBracketPage />,
			},
		],
	},
	{
		// === ГРУППА 2: Публичные страницы без общего Layout'а ===
		// Эти страницы будут отображаться "как есть", на весь экран.
		// Это полезно для страниц, где нужна своя, уникальная структура.
		path: '/players',
		element: <PlayersTablePage />,
	},
	{
		path: '/tournaments',
		element: <TournamentsTablePage />,
	},
	{
		path: '/player/:id', // Роут с параметром для страницы игрока
		element: <PlayerPage />,
	},
	{
		path: '/tournament/:id', // Роут с параметром для страницы турнира
		element: <TournamentPage />,
	},
	{
		// === ГРУППА 3: Страницы для неавторизованных пользователей ===
		// PublicRoute не пустит сюда уже вошедшего пользователя
		element: <PublicRoute />,
		children: [
			// {
			// 	path: '/login',
			// 	element: <LoginPage />,
			// },
			// {
			// 	path: '/register',
			// 	element: <RegisterPage />,
			// },
			{
				path: '/forgot-password', // добавляем маршрут
				element: <ForgotPasswordPage />,
			},
		],
	},
	{
		// === ГРУППА 4: Приватные страницы админ-панели ===
		// PrivateRoute сначала проверяет, есть ли пользователь
		path: '/admin',
		element: <PrivateRoute />,
		children: [
			{
				// Если проверка пройдена, применяется AdminLayout
				element: <AdminLayout />,
				children: [
					{
						path: 'dashboard', // path будет /admin/dashboard
						element: <AdminDashboardPage />,
					},
					{
						path: 'players', // path будет /admin/players
						element: <AdminPlayersPage />,
					},
					// ... другие страницы админки здесь
				],
			},
		],
	},
	// { path: '*', element: <NotFoundPage /> } // Можно добавить страницу 404
])
