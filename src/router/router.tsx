import { Box, Button, Stack } from '@mui/material'
import * as React from 'react'
import { createHashRouter, Link } from 'react-router-dom'
import EditFantasyTeamPage from '../pages/EditFantasyTeamPage'
import FantasyMainPage from '../pages/FantasyMainPage'
import FantasyRulesPage from '../pages/FantasyRulesPage'
import FantasyTablePage from '../pages/FantasyTablePage'
import PlayerPage from '../pages/PlayerPage'
import PlayersTablePage from '../pages/PlayersTablePage'
import AddFantasyPlayerPage from '../pages/SubmitFantasyTeamPage'
import TournamentPage from '../pages/TournamentPage'
import TournamentsTablePage from '../pages/TournamentsTablePage'

const Layout = ({ children }) => (
	<Box
		sx={{
			minHeight: '100vh',
			backgroundImage: `url(/assets/setka.jpg)`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
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
				<Button
					component={Link}
					to='/fantasyQual/add'
					variant='contained'
					color='primary'
					size='small'
				>
					Регистрация
				</Button>
				<Button
					component={Link}
					to='/fantasyTable'
					variant='contained'
					color='primary'
					size='small'
				>
					Таблица
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
		</Box>

		<main
			style={{
				flexGrow: 1,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 20,
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
		element: (
			<Layout>
				<PlayersTablePage />
			</Layout>
		),
	},
	{
		path: '/tournaments',
		element: (
			<Layout>
				<TournamentsTablePage />
			</Layout>
		),
	},
	{
		path: '/fantasyTable',
		element: (
			<Layout>
				<FantasyTablePage />
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
		path: '/fantasyQual/add',
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
		element: (
			<Layout>
				<PlayerPage />
			</Layout>
		),
	},
	{
		path: 'tournament/:id',
		element: (
			<Layout>
				<TournamentPage />
			</Layout>
		),
	},
])
