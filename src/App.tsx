import React, { useEffect, useState } from 'react'

const files = import.meta.glob('/src/assets/data/*.json', { eager: true })

const App = () => {
	const [fileList, setFileList] = useState<string[]>([])
	const [selectedFile, setSelectedFile] = useState('')
	const [playersData, setPlayersData] = useState<Record<string, any>>({})
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState({ minGames: 0, maxGames: 1000 })
	const [currentPage, setCurrentPage] = useState(1)
	const [sortConfig, setSortConfig] = useState({
		key: 'totalGames',
		direction: 'asc',
	})

	const playersPerPage = 10

	useEffect(() => {
		const fileNames = Object.keys(files).map(
			file => file.split('/').pop() || ''
		)
		setFileList(fileNames)

		if (fileNames.length > 0) {
			setSelectedFile(fileNames[0])
		}
	}, [])

	useEffect(() => {
		if (selectedFile) {
			const filePath = `/src/assets/data/${selectedFile}`
			const data = files[filePath] as { default: Record<string, any> }
			setPlayersData(data?.default || {})
		}
	}, [selectedFile])

	const filteredPlayers = Object.entries(playersData)
		.map(([name, player]) => ({ name, ...player }))
		.filter(
			player =>
				player.name.toLowerCase().includes(search.toLowerCase()) &&
				player.totalGames >= filter.minGames &&
				player.totalGames <= filter.maxGames
		)

	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		if (a[sortConfig.key] < b[sortConfig.key])
			return sortConfig.direction === 'asc' ? -1 : 1
		if (a[sortConfig.key] > b[sortConfig.key])
			return sortConfig.direction === 'asc' ? 1 : -1
		return 0
	})

	const indexOfLastPlayer = currentPage * playersPerPage
	const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
	const currentPlayers = sortedPlayers.slice(
		indexOfFirstPlayer,
		indexOfLastPlayer
	)
	const totalPages = Math.ceil(sortedPlayers.length / playersPerPage)

	const handleSort = (key: string) => {
		setSortConfig(prevConfig => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === 'asc'
					? 'desc'
					: 'asc',
		}))
	}

	return (
		<div className='container'>
			<h1>Статистика игроков</h1>

			<div className='filters'>
				<select
					value={selectedFile}
					onChange={e => setSelectedFile(e.target.value)}
				>
					{fileList.map(file => (
						<option key={file} value={file}>
							{file}
						</option>
					))}
				</select>

				<input
					type='text'
					placeholder='Поиск по имени...'
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<input
					type='number'
					placeholder='Мин. игр'
					onChange={e =>
						setFilter({ ...filter, minGames: Number(e.target.value) })
					}
				/>
				<input
					type='number'
					placeholder='Макс. игр'
					onChange={e =>
						setFilter({ ...filter, maxGames: Number(e.target.value) })
					}
				/>
			</div>

			<table>
				<thead>
					<tr>
						<th onClick={() => handleSort('name')}>
							Игрок{' '}
							{sortConfig.key === 'name'
								? sortConfig.direction === 'asc'
									? '🔼'
									: '🔽'
								: ''}
						</th>
						<th onClick={() => handleSort('totalGames')}>
							Игр{' '}
							{sortConfig.key === 'totalGames'
								? sortConfig.direction === 'asc'
									? '🔼'
									: '🔽'
								: ''}
						</th>
						<th onClick={() => handleSort('winRate')}>
							Винрейт{' '}
							{sortConfig.key === 'winRate'
								? sortConfig.direction === 'asc'
									? '🔼'
									: '🔽'
								: ''}
						</th>
						<th onClick={() => handleSort('avgPoints')}>
							Средний балл{' '}
							{sortConfig.key === 'avgPoints'
								? sortConfig.direction === 'asc'
									? '🔼'
									: '🔽'
								: ''}
						</th>
					</tr>
				</thead>
				<tbody>
					{currentPlayers.map((player, index) => (
						<tr key={index}>
							<td>{player.name}</td>
							<td>{player.totalGames}</td>
							<td>{player.winRate}%</td>
							<td>{player.avgPoints}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className='pagination'>
				{Array.from({ length: totalPages }, (_, i) => (
					<button
						key={i}
						onClick={() => setCurrentPage(i + 1)}
						className={currentPage === i + 1 ? 'active' : ''}
					>
						{i + 1}
					</button>
				))}
			</div>
		</div>
	)
}

export default App
