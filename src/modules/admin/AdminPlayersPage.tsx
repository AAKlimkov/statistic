import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// Определяем тип для одного игрока, чтобы TypeScript нам помогал
// Это можно будет вынести в отдельный файл с типами (e.g., src/types/database.ts)
interface Player {
	id: number
	name: string
	official_rating: number | null
	win_percentage: number | null
	total_games_played: number | null
}

export const AdminPlayersPage: React.FC = () => {
	// Состояния для хранения данных, загрузки и ошибок
	const [players, setPlayers] = useState<Player[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	// Функция для загрузки данных из Supabase
	const fetchPlayers = async () => {
		setLoading(true)
		setError(null)
		try {
			const { data, error } = await supabase
				.from('players') // Название вашей таблицы
				.select('id, name, official_rating, win_percentage, total_games_played')
				.order('name', { ascending: true })

			if (error) throw error

			setPlayers(data || [])
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	// Загружаем данные при первом рендере компонента
	useEffect(() => {
		fetchPlayers()
	}, [])

	const handleAddPlayer = () => {
		// Здесь будет логика открытия модального окна для добавления игрока
		console.log('Добавить нового игрока')
	}

	const handleEditPlayer = (id: number) => {
		// Логика открытия модального окна для редактирования
		console.log(`Редактировать игрока с ID: ${id}`)
	}

	const handleDeletePlayer = (id: number) => {
		// Логика удаления с подтверждением
		console.log(`Удалить игрока с ID: ${id}`)
	}

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 4,
				}}
			>
				<Typography variant='h4' component='h1'>
					Управление игроками
				</Typography>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleAddPlayer}
				>
					Добавить игрока
				</Button>
			</Box>

			<Paper sx={{ width: '100%', overflow: 'hidden' }}>
				<TableContainer>
					<Table stickyHeader aria-label='таблица игроков'>
						<TableHead>
							<TableRow>
								<TableCell>Имя (Никнейм)</TableCell>
								<TableCell align='right'>Рейтинг</TableCell>
								<TableCell align='right'>% Побед</TableCell>
								<TableCell align='right'>Сыграно игр</TableCell>
								<TableCell align='center'>Действия</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={5} align='center'>
										<CircularProgress />
									</TableCell>
								</TableRow>
							) : error ? (
								<TableRow>
									<TableCell
										colSpan={5}
										align='center'
										sx={{ color: 'error.main' }}
									>
										Ошибка загрузки данных: {error}
									</TableCell>
								</TableRow>
							) : players.length > 0 ? (
								players.map(player => (
									<TableRow hover key={player.id}>
										<TableCell component='th' scope='row'>
											{player.name}
										</TableCell>
										<TableCell align='right'>
											{player.official_rating?.toFixed(2) ?? '-'}
										</TableCell>
										<TableCell align='right'>
											{player.win_percentage?.toFixed(2) ?? '-'}%
										</TableCell>
										<TableCell align='right'>
											{player.total_games_played ?? '-'}
										</TableCell>
										<TableCell align='center'>
											<Tooltip title='Редактировать'>
												<IconButton
													onClick={() => handleEditPlayer(player.id)}
													size='small'
												>
													<EditIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title='Удалить'>
												<IconButton
													onClick={() => handleDeletePlayer(player.id)}
													size='small'
													sx={{ color: 'error.main' }}
												>
													<DeleteIcon />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} align='center'>
										Игроки не найдены.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</Box>
	)
}
