import React from 'react'
import { createHashRouter } from 'react-router-dom'
import PlayerPage from '../pages/PlayerPage'
import PlayersTablePage from '../pages/PlayersTablePage'

export const router = createHashRouter([
	{
		path: '/',
		element: <PlayersTablePage />,
	},
	{
		path: 'player/:id',
		element: <PlayerPage />,
	},
])
