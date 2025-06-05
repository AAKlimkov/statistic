import * as React from 'react'
import { createHashRouter, Link } from 'react-router-dom'
import AddFantasyPlayerPage from '../pages/SubmitFantasyTeamPage'
import FantasyPlayerViewPage from '../pages/FantasyPlayerViewPage'
import FantasyTablePage from '../pages/FantasyTablePage'
import PlayerPage from '../pages/PlayerPage'
import PlayersTablePage from '../pages/PlayersTablePage'
import TournamentPage from '../pages/TournamentPage'
import TournamentsTablePage from '../pages/TournamentsTablePage'

const Layout = ({ children }) => (
	<div>
		<nav
			style={{ padding: 10, borderBottom: '1px solid #ccc', marginBottom: 20 }}
		>
			<Link to='/' style={{ marginRight: 15 }}>
				Статистика игроков
			</Link>
			<Link to='/tournaments'>Статистика турниров</Link>
			<Link to='/fantasyQual'>Фэнтези квалификация</Link>
		</nav>
		<main>{children}</main>
	</div>
)

export const router = createHashRouter([
	{
		path: '/',
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
		path: '/fantasyQual',
		element: (
			<Layout>
				<FantasyTablePage />
			</Layout>
		),
	},
	{
		path: '/fantasyQual/:id',
		element: (
			<Layout>
				<FantasyPlayerViewPage />
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
