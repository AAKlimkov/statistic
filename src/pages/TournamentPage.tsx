import React from 'react'
import TournamentTable from '../components/TournamentTable'

const TournamentPage: React.FC = () => {
	return (
		<div>
			<h1>Детальная статистика турнира</h1>
			<TournamentTable />
		</div>
	)
}

export default TournamentPage
