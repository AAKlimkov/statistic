import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import PlayerPage from '../pages/PlayerPage'
import PlayersTablePage from '../pages/PlayersTablePage'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <PlayersTablePage />,
	},
	{
		path: 'player/:id',
		element: <PlayerPage />,
	},
], { basename: '/statistic' })
