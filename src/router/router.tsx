import { Box, Button, Stack } from '@mui/material'
import * as React from 'react'
import { createHashRouter, Link } from 'react-router-dom'

import CombinedFantasyTable from '../modules/Fantasy/pages/CombinedFantasyTable'
import { FantasyBracketPage } from '../modules/Fantasy/pages/FantasyBracketPage'
import EditFantasyTeamPage from '../pages/EditFantasyTeamPage'
import FantasyMainPage from '../pages/FantasyMainPage'
import FantasyRulesPage from '../pages/FantasyRulesPage'
import PlayerPage from '../pages/PlayerPage'
import PlayersPickPage2stage from '../pages/PlayersPickPage2stage'
import PlayersTablePage from '../pages/PlayersTablePage'
import AddFantasyPlayerPage from '../pages/SubmitFantasyTeamPage'
import TournamentPage from '../pages/TournamentPage'
import TournamentsTablePage from '../pages/TournamentsTablePage'

const Layout = ({ children }) => (
	<Box
		sx={{
			minHeight: '100vh',
			backgroundImage: `url(/assets/setka_upd.jpg)`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',

			backgroundAttachment: 'fixed',

			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
		}}
	>
		<Box
			component='nav'
			sx={{
				padding: 1,
				borderBottom: '1px solid #ccc',
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
			}}
		>
			<Stack direction='row' spacing={2} justifyContent='center'>
				<Button
					component={Link}
					to='/'
					variant='contained'
					color='primary'
					size='small'
				>
					Главная
				</Button>
				{/* <Button
					component={Link}
					to='/FantasyBracketPage'
					// to='/fantasyQual/add'
					variant='contained'
					color='primary'
					size='small'
				>
					Регистрация (2 этап)
				</Button> */}
				<Button
					component={Link}
					to='/fantasyTable'
					variant='contained'
					color='primary'
					size='small'
				>
					Таблица
				</Button>
			</Stack>
			<Stack>
				<Button
					component={Link}
					to='/fantasyPickRate'
					variant='contained'
					color='primary'
					size='small'
				>
					Пикрейт
				</Button>
				<Button
					component={Link}
					to='/fantasyRules'
					variant='contained'
					color='primary'
					size='small'
				>
					Правила
				</Button>
			</Stack>
			<Stack>
				<Button
					component={Link}
					to='/tournaments'
					variant='contained'
					color='primary'
					size='small'
				>
					Прошлые турниры
				</Button>
				<Button
					component={Link}
					to='/players'
					variant='contained'
					color='primary'
					size='small'
				>
					Игроки
				</Button>
			</Stack>
		</Box>

		<main
			style={{
				flexGrow: 1,
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '10px 0',
			}}
		>
			{children}
		</main>
	</Box>
)

export const router = createHashRouter([
	{
		path: '/',
		element: (
			<Layout>
				<FantasyMainPage />
			</Layout>
		),
	},
	{
		path: '/players',
		element: <PlayersTablePage />,
	},
	{
		path: '/tournaments',
		element: <TournamentsTablePage />,
	},
	{
		path: '/fantasyTable',
		element: (
			<Layout>
				<CombinedFantasyTable />
			</Layout>
		),
	},

	{
		path: '/fantasyPickRate',
		element: (
			<Layout>
				<PlayersPickPage2stage />
			</Layout>
		),
	},
	{
		path: '/FantasyBracketPage',
		element: (
			<Layout>
				<FantasyBracketPage mode='create' />
			</Layout>
		),
	},
	{
		path: '/fantasy/player/:userId',
		element: (
			<Layout>
				<EditFantasyTeamPage />
			</Layout>
		),
	},
	{
		path: '/FantasyBracketPage',
		// path: '/fantasyQual',
		element: (
			<Layout>
				<AddFantasyPlayerPage />
			</Layout>
		),
	},
	{
		path: 'fantasyRules',
		element: (
			<Layout>
				<FantasyRulesPage />
			</Layout>
		),
	},
	{
		path: 'player/:id',
		element: <PlayerPage />,
	},
	{
		path: 'tournament/:id',
		element: <TournamentPage />,
	},
])
