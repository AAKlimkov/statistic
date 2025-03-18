import React from 'react'
import playersData from './players_stats.json'

const PlayerCard = ({ name, player }) => {
	return (
		<div className='player-card'>
			<h2>{name}</h2>
			<p>
				<strong>Всего игр:</strong> {player.totalGames}
			</p>
			<p>
				<strong>Винрейт:</strong> {player.winRate}%
			</p>
			<p>
				<strong>Средний балл:</strong> {player.avgPoints}
			</p>
			<p>
				<strong>Средний судейский балл:</strong> {player.avgJudgePoints}
			</p>
		</div>
	)
}

const App = () => {
	return (
		<div className='app-container'>
			<h1>Статистика игроков</h1>
			<div className='players-list'>
				{Object.entries(playersData).map(([name, player]) => (
					<PlayerCard key={name} name={name} player={player} />
				))}
			</div>
		</div>
	)
}

export default App
