import {
	Alert,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const baseUrl = 'http://localhost:3001'

const getCellColor = value => {
	const match = value.match(/\((\d+(\.\d+)?)%\)/)
	if (!match) return ''
	const percentage = parseFloat(match[1])

	if (percentage <= 20) return 'rgba(255, 99, 71, 0.2)' // Красный
	if (percentage <= 45) return 'rgba(255, 165, 0, 0.2)' // Оранжевый
	if (percentage <= 55) return 'rgba(255, 255, 0, 0.2)' // Желтый
	if (percentage <= 80) return 'rgba(144, 238, 144, 0.2)' // Светло-зеленый
	return 'rgba(34, 139, 34, 0.2)' // Зеленый
}

const getSortValue = (value, sortBy) => {
	if (!value) return 0
	if (sortBy === 'percent') {
		const match = value.match(/\((\d+(\.\d+)?)%\)/)
		if (match) return parseFloat(match[1])
	}
	const parts = value.split('/')
	if (!isNaN(parts[0])) return parseInt(parts[0])
	return 0
}

const PlayerIntersection = () => {
	const playerId = useParams()

	const [tableData, setTableData] = useState([])
	const [stats, setStats] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [sortConfig, setSortConfig] = useState({
		column: 'Общее',
		direction: 'asc',
		sortBy: 'games', // Добавляем параметр для сортировки по количеству игр или проценту
	})

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				const response1 = await fetch(
					`https://mafia-server-cyan.vercel.app/api/player/${playerId.id}/intersections`
				)
				if (!response1.ok) {
					throw new Error('Ошибка при получении данных для intersections')
				}
				const data1 = await response1.json()
				setTableData(data1)

				const response2 = await fetch(
					`https://mafia-server-cyan.vercel.app/api/player/${playerId.id}/basestats`
				)
				if (!response2.ok) {
					throw new Error('Ошибка при получении данных для basestats')
				}
				const data2 = await response2.json()
				setStats(data2)
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [playerId])

	const handleSort = column => {
		let direction = 'asc'
		if (sortConfig.column === column && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ ...sortConfig, column, direction })
	}

	const handleSortByChange = (event) => {
		setSortConfig({ ...sortConfig, sortBy: event.target.value })
	}

	const sortedData = [...tableData].sort((a, b) => {
		const aValue = getSortValue(a[sortConfig.column], sortConfig.sortBy)
		const bValue = getSortValue(b[sortConfig.column], sortConfig.sortBy)
		return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
	})

	const columns = [
		{ label: 'Противник', key: 'Противник' },
		{ label: 'Общее', key: 'Общее' },
		{ label: 'Вместе Мирные', key: 'ВместеМирные' },
		{ label: 'Вместе Черные', key: 'ВместеЧерные' },
		{ label: 'Разноцвет(Мирный)', key: 'РазноцветМирный' },
		{ label: 'Разноцвет(Черный)', key: 'РазноцветЧерный' },
	]

	if (loading) return <CircularProgress sx={{ m: 2 }} />
	if (error) return <Alert severity='error'>{error}</Alert>

	return (
		<TableContainer
			component={Paper}
			sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}
		>
			<Typography variant='h6' sx={{ p: 2 }}>
				Статистика игрока:
				<span style={{ marginLeft: '10px' }}>
					Всего игр: {stats.total_games} ({stats.total_win_pct}%).
				</span>
				<span style={{ marginLeft: '10px' }}>
					Игры за красных: {stats.red_games} ({stats.red_win_pct}%).
				</span>
				<span style={{ marginLeft: '10px' }}>
					Игры за черных: {stats.black_games} ({stats.black_win_pct}%).
				</span>
			</Typography>

			<FormControl sx={{ m: 2, minWidth: 120 }}>
				<InputLabel id="sort-by-label">Сортировка по</InputLabel>
				<Select
					labelId="sort-by-label"
					value={sortConfig.sortBy}
					onChange={handleSortByChange}
					label="Сортировка по"
				>
					<MenuItem value="games">Количество игр</MenuItem>
					<MenuItem value="percent">Процент побед</MenuItem>
				</Select>
			</FormControl>

			<Table>
				<TableHead>
					<TableRow>
						{columns.map(({ label, key }) => (
							<TableCell
								key={key}
								sortDirection={sortConfig.column === key ? sortConfig.direction : false}
								sx={{ width: '20%' }}
							>
								<TableSortLabel
									active={sortConfig.column === key}
									direction={sortConfig.column === key ? sortConfig.direction : 'asc'}
									onClick={() => handleSort(key)}
								>
									{label}
								</TableSortLabel>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{sortedData.map((row, index) => (
						<TableRow
							key={index}
							sx={{
								'&:hover': {
									backgroundColor: 'rgba(0, 0, 0, 0.1)', // Эффект hover для строк
								},
							}}
						>
							<TableCell>{row.Противник}</TableCell>
							<TableCell
								sx={{
									borderRadius: 1,
									backgroundColor: getCellColor(row.Общее),
								}}
							>
								{row.Общее}
							</TableCell>
							<TableCell
								sx={{
									borderRadius: 1,
									backgroundColor: getCellColor(row.ВместеМирные),
								}}
							>
								{row.ВместеМирные}
							</TableCell>
							<TableCell
								sx={{
									borderRadius: 1,
									backgroundColor: getCellColor(row.ВместеЧерные),
								}}
							>
								{row.ВместеЧерные}
							</TableCell>
							<TableCell
								sx={{
									borderRadius: 1,
									backgroundColor: getCellColor(row.РазноцветМирный),
								}}
							>
								{row.РазноцветМирный}
							</TableCell>
							<TableCell
								sx={{
									borderRadius: 1,
									backgroundColor: getCellColor(row.РазноцветЧерный),
								}}
							>
								{row.РазноцветЧерный}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

export default PlayerIntersection
