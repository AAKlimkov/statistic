import * as React from 'react'
import { useParams } from 'react-router-dom'
import PlayerStats from '../components/PlayerStats'

const PlayerPage = () => {
	const { id } = useParams()

	return <PlayerStats id={id} />
}

export default PlayerPage
