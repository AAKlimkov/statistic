import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import {
	Box,
	ButtonGroup,
	IconButton,
	MenuItem,
	Select,
	Typography,
} from '@mui/material'

import * as React from 'react'
import { useMemo } from 'react'
import { Match } from '../data/summerLeagueData'

import { MatchSelections, SelectionStatus } from '../pages/FantasyBracketPage'

interface MatchColumnProps {
	match: Match
	matchSelections: MatchSelections
	onPlayerSelect: (
		matchId: string,
		playerId: number,
		status: SelectionStatus | undefined
	) => void
	minPlace?: number
	maxPlace?: number
	showPlaceColumn?: boolean
	showWinColumn?: boolean
	showLowBracketButton?: boolean
}

export const MatchColumn: React.FC<MatchColumnProps> = ({
	match,
	matchSelections,
	onPlayerSelect,
	minPlace = 1,
	maxPlace = 8,
	showPlaceColumn = true,
	showWinColumn = true,
	showLowBracketButton = true,
}) => {
	// Собираем уже занятые места другими игроками в этом матче
	const occupiedPlaces = useMemo(() => {
		const places = new Set<number>()
		Object.entries(matchSelections).forEach(([playerId, status]) => {
			if (typeof status === 'object' && status.type === 'place') {
				places.add(status.value)
			}
		})
		return places
	}, [matchSelections])

	// Проверяем текущее выбранное место игрока (если есть)
	const getPlaceValue = (playerId: number) => {
		const status = matchSelections[playerId]
		if (typeof status === 'object' && status.type === 'place') {
			return status.value
		}
		return ''
	}

	// Обработчик выбора места
	const handlePlaceChange = (playerId: number, value: number | '') => {
		if (value === '') {
			// Убираем выбор места
			onPlayerSelect(match.id, playerId, { type: 'loser' })
		} else {
			onPlayerSelect(match.id, playerId, { type: 'place', value })
		}
	}

	// Обработчики победы и поражения
	const toggleStatus = (playerId: number, status: SelectionStatus) => {
		const current = matchSelections[playerId]
		if (current === status) {
			onPlayerSelect(match.id, playerId, { type: 'loser' })
		} else {
			onPlayerSelect(match.id, playerId, status)
		}
	}

	return (
		<Box
			sx={{
				border: '1px solid #ccc',
				borderRadius: 1,
				p: 1,
				mb: 1,
				backgroundColor: '#f9f9f9',
			}}
		>
			<Typography variant='subtitle1' fontWeight='bold' mb={1}>
				Матч {match.title}
			</Typography>

			{match.players.map(player => {
				const placeValue = getPlaceValue(player.id)
				const isPlaceOccupiedByOther =
					placeValue !== '' &&
					[...occupiedPlaces].some(p => p === placeValue && p !== placeValue)

				return (
					<Box
						key={player.id}
						sx={{
							display: 'flex',
							alignItems: 'center',
							mb: 1,
						}}
					>
						<Typography sx={{ flexGrow: 1 }}>{player.name}</Typography>

						<ButtonGroup size='small' variant='outlined'>
							{/* Победитель */}
							{showWinColumn && (
								<IconButton
									onClick={() => toggleStatus(player.id, { type: 'winner' })}
									title='Выбрать победителя'
									sx={{
										color:
											matchSelections[player.id]?.type === 'winner'
												? 'white'
												: 'inherit',
										backgroundColor:
											matchSelections[player.id]?.type === 'winner'
												? 'green'
												: 'transparent',
										borderRadius:
											matchSelections[player.id]?.type === 'winner'
												? '50%'
												: 'none',
										border:
											matchSelections[player.id]?.type === 'winner'
												? '1px solid green'
												: 'none',
									}}
								>
									<CheckIcon />
								</IconButton>
							)}

							{/* Выбор места */}
							{showPlaceColumn && (
								<Select
									size='small'
									value={placeValue !== '' ? String(placeValue) : ''}
									displayEmpty
									onChange={e => {
										const val =
											e.target.value === '' ? '' : Number(e.target.value)
										handlePlaceChange(player.id, val)
									}}
									sx={{ minWidth: 72 }}
									renderValue={selected => {
										if (selected === '') return 'Место'
										return `Место ${selected}`
									}}
								>
									<MenuItem value=''>
										<em>Нет</em>
									</MenuItem>
									{Array.from(
										{ length: maxPlace - minPlace + 1 },
										(_, i) => i + minPlace
									).map(num => {
										// Место занято другим игроком, запрещаем выбор
										const occupiedByOther =
											[...occupiedPlaces].includes(num) && num !== placeValue
										return (
											<MenuItem
												key={num}
												value={num}
												disabled={occupiedByOther}
											>
												{`Место ${num}`}
											</MenuItem>
										)
									})}
								</Select>
							)}

							{/* Проигравший */}
							<IconButton
								onClick={() => toggleStatus(player.id, { type: 'loser' })}
								title='Выбрать проигравшего'
								sx={{
									color:
										matchSelections[player.id]?.type === 'loser'
											? 'white'
											: 'inherit',
									backgroundColor:
										matchSelections[player.id]?.type === 'loser'
											? 'red'
											: 'transparent',
									borderRadius:
										matchSelections[player.id]?.type === 'loser'
											? '90%'
											: 'none',
									border:
										matchSelections[player.id]?.type === 'loser'
											? '1px solid red'
											: 'none',
								}}
							>
								<CloseIcon />
							</IconButton>
						</ButtonGroup>
					</Box>
				)
			})}

			{/* Можно добавить кнопку для выбора в нижнюю сетку, если нужно */}
			{showLowBracketButton && (
				<Box mt={1}>{/* Тут кнопка или что-то ещё */}</Box>
			)}
		</Box>
	)
}
