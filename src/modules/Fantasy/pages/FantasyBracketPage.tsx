import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Paper,
	Stack,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../../context/ToastProvider'
import { MatchColumn } from '../components/MatchColumn'
import {
	bracketData,
	Match,
	MatchSource,
	Player,
	Stage as StageType,
} from '../data/summerLeagueData'

interface FantasyPickPayload {
	fantasy_user_id: number
	match_id: string
	player_id: number
	pick_type: 'winner' | 'loser' | 'place' | 'lowBracket'
	place_value: number | null // Может быть null
}

// Типы и константы остаются без изменений
export type SelectionStatus =
	| { type: 'winner' }
	| { type: 'loser' }
	| { type: 'place'; value: number }
export type MatchSelections = Record<number, SelectionStatus>
export type Selections = Record<string, MatchSelections>
export type Stage = StageType

const allMatchesMap = new Map<string, Match>(
	[
		...bracketData.upperBracket.left.flatMap(s => s.matches),
		...bracketData.upperBracket.right.flatMap(s => s.matches),
		...bracketData.lowerBracket.left.flatMap(s => s.matches),
		...bracketData.lowerBracket.right.flatMap(s => s.matches),
		bracketData.finalStage.matches,
	]
		.flat()
		.map(match => [match.id, match])
)

export const FantasyBracketPage: React.FC = () => {
	const shouldShowPlaceColumn = useCallback((match: Match): boolean => {
		// Например, не показывать колонку для финала:
		if (match.title === 'Финал') return false
		if (match.id === 'U-1/2-2') return false
		if (match.id === 'U-1/2-1') return false

		return true
	}, [])
	const shouldShowWinColumn = useCallback((match: Match): boolean => {
		if (match.id === 'L-1/2-B') return false
		if (match.id === 'L-1/2-C') return false

		return true
	}, [])
	const getPlaceRangeForStage = useCallback((stageTitle: string) => {
		switch (stageTitle) {
			case '1/8 Финала':
				return { minPlace: 6, maxPlace: 6 }
			case '1/4 Финала':
				return { minPlace: 5, maxPlace: 8 }
			case '1/2 Финала':
				return { minPlace: 1, maxPlace: 2 }
			default:
				return { minPlace: 1, maxPlace: 8 }
		}
	}, [])
	const [selections, setSelections] = useState<Selections>({})
	// ИЗМЕНЕНИЕ: Состояние для отслеживания открытых Accordion. По умолчанию открываем первый этап.
	const [expanded, setExpanded] = useState<Set<string>>(new Set(['1/8 Финала']))
	const { showToast } = useToast()

	const preparePicksForApi = (
		selections: Selections,
		userId: number
	): FantasyPickPayload[] => {
		const payload: FantasyPickPayload[] = []

		// Итерируемся по всем матчам ('U-1/8-1', 'U-1/4-2', ...)
		for (const matchId in selections) {
			const matchSelections = selections[matchId]

			// Итерируемся по всем игрокам в этом матче ('1', '10', ...)
			for (const playerIdStr in matchSelections) {
				const playerId = parseInt(playerIdStr, 10)
				const status = matchSelections[playerId] // { type: 'winner' } или { type: 'place', value: 6 }

				payload.push({
					fantasy_user_id: userId,
					match_id: matchId,
					player_id: playerId,
					pick_type: status.type,
					// Если тип 'place', берем value, иначе null
					place_value: status.type === 'place' ? status.value : null,
				})
			}
		}

		return payload
	}

	const getMatchById = (matchId: string) => allMatchesMap.get(matchId)

	const handlePlayerSelect = useCallback(
		(matchId: string, playerId: number, status: SelectionStatus) => {
			setSelections(prev => {
				const newSelections = { ...prev }
				const newMatchSelections = { ...(newSelections[matchId] || {}) }
				const matchInfo = getMatchById(matchId)!

				const winnersCount = Object.values(newMatchSelections).filter(
					s => s.type === 'winner'
				).length

				if (newMatchSelections[playerId] === status) {
					delete newMatchSelections[playerId]
				} else {
					if (
						status.type === 'winner' &&
						winnersCount >= matchInfo.selectionLimit
					) {
						showToast(
							`Можно выбрать не более ${matchInfo.selectionLimit} победителей!`,
							'warning'
						)
						return prev
					}
					newMatchSelections[playerId] = status
				}

				newSelections[matchId] = newMatchSelections
				return newSelections
			})
		},
		[showToast]
	)

	const { displayedBracket, processedMatchesMap } = useMemo(() => {
		const processedMatches = new Map<string, Match>()

		const processMatch = (match: Match): Match => {
			if (processedMatches.has(match.id)) return processedMatches.get(match.id)!

			const newMatch: Match = JSON.parse(JSON.stringify(match))

			if (newMatch.sourceMatchIds) {
				const dynamicPlayers: Player[] = []
				newMatch.sourceMatchIds.forEach((source: MatchSource) => {
					const sourceMatch = processMatch(getMatchById(source.id)!)
					const sourceSelections = selections[source.id] || {}

					sourceMatch.players.forEach(player => {
						if (player.isPlaceholder) return
						const playerStatus = sourceSelections[player.id]

						if (!playerStatus) return

						if (source.type === 'place') {
							if (
								playerStatus.type === 'place' &&
								source.takePlaces?.includes(playerStatus.value)
							) {
								dynamicPlayers.push(player)
							}
						} else if (playerStatus.type === source.type) {
							dynamicPlayers.push(player)
						}
					})
				})

				const placeholders = newMatch.players.filter(p => p.isPlaceholder)
				const staticPlayers = newMatch.players.filter(p => !p.isPlaceholder)
				const filledPlaceholders = placeholders.map(
					(ph, i) => dynamicPlayers[i] || ph
				)
				newMatch.players = [...staticPlayers, ...filledPlaceholders]
			}

			processedMatches.set(match.id, newMatch)
			return newMatch
		}

		allMatchesMap.forEach(match => processMatch(match))

		const getUpdatedStage = (originalStage: Stage) => ({
			...originalStage,
			matches: originalStage.matches.map(m => processedMatches.get(m.id)!),
		})

		const bracket = {
			upperBracket: {
				left: bracketData.upperBracket.left.map(getUpdatedStage),
				right: bracketData.upperBracket.right.map(getUpdatedStage),
			},
			lowerBracket: {
				left: bracketData.lowerBracket.left.map(getUpdatedStage),
				right: bracketData.lowerBracket.right.map(getUpdatedStage),
			},
			finalStage: getUpdatedStage(bracketData.finalStage),
		}
		return { displayedBracket: bracket, processedMatchesMap: processedMatches }
	}, [selections])

	const isMatchLocked = useCallback(
		(matchId: string): boolean => {
			const matchInfo = getMatchById(matchId)
			if (!matchInfo?.sourceMatchIds) return false

			return !matchInfo.sourceMatchIds.every(source => {
				const sourceMatchInfo = processedMatchesMap.get(source.id)!
				const sourceSelections = selections[source.id] || {}
				const realPlayersCount = sourceMatchInfo.players.filter(
					p => !p.isPlaceholder
				).length
				if (realPlayersCount === 0) return false
				return Object.keys(sourceSelections).length === realPlayersCount
			})
		},
		[processedMatchesMap, selections]
	)

	const organizedLayout = useMemo(() => {
		const { upperBracket, lowerBracket, finalStage } = displayedBracket
		return [
			{
				title: '1/8 Финала',
				matches: [
					...upperBracket.left[0].matches,
					...upperBracket.right[0].matches,
				],
			},
			{
				title: '1/4 Финала',
				matches: [
					...upperBracket.left[1].matches,
					...upperBracket.right[1].matches,
				],
			},
			{
				title: '1/2 Финала',
				matches: [
					...upperBracket.left[2].matches,
					...upperBracket.right[2].matches,
					...lowerBracket.left[0].matches,
					...lowerBracket.right[0].matches,
				],
			},
			{
				title: 'Финал',
				matches: finalStage.matches,
			},
		]
	}, [displayedBracket])

	const handleSubmit = () => {
		const currentUserId = 123

		const apiPayload = preparePicksForApi(selections, currentUserId)

		console.log(
			'Подготовленные данные для API:',
			JSON.stringify(apiPayload, null, 2)
		)
	}

	// ИЗМЕНЕНИЕ: Обработчик для открытия/закрытия Accordion
	const handleAccordionChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(prev => {
				const newSet = new Set(prev)
				if (isExpanded) {
					newSet.add(panel)
				} else {
					newSet.delete(panel)
				}
				return newSet
			})
		}

	const stagesWithoutLowBracket = ['1/2 Финала', 'Финал']

	return (
		<Paper
			elevation={3}
			sx={{
				p: { xs: 1, sm: 2, md: 3 },
				width: '100%',
				bgcolor: 'rgba(255, 255, 255, 0.95)',
			}}
		>
			<Typography variant='h4' component='h1' gutterBottom align='center'>
				Фэнтези-сетка
			</Typography>
			<Box sx={{ p: { xs: 0, sm: 1 } }}>
				<Stack direction='column' spacing={2}>
					{/* ИЗМЕНЕНИЕ: Используем Accordion для каждого этапа */}
					{organizedLayout.map(stageGroup => (
						<Accordion
							key={stageGroup.title}
							expanded={expanded.has(stageGroup.title)}
							onChange={handleAccordionChange(stageGroup.title)}
						>
							<AccordionSummary expandIcon={<ExpandMoreIcon />}>
								<Typography
									variant='h5'
									component='h2'
									sx={{ fontWeight: 'bold' }}
								>
									{stageGroup.title}
								</Typography>
							</AccordionSummary>
							<AccordionDetails sx={{ overflowX: 'auto' }}>
								<Stack
									direction='row'
									spacing={2}
									sx={{
										display: 'inline-flex',
										justifyContent: 'space-around',
										minWidth: '100%',
										py: 1,
									}}
								>
									{stageGroup.matches.map(match => {
										const showPlaceColumn = shouldShowPlaceColumn(match)
										const showWinColumn = shouldShowWinColumn(match)
										const { minPlace, maxPlace } = getPlaceRangeForStage(
											stageGroup.title
										)

										return (
											<Box
												key={match.id}
												sx={{
													opacity: isMatchLocked(match.id) ? 0.5 : 1,
													pointerEvents: isMatchLocked(match.id)
														? 'none'
														: 'auto',
													transition: 'opacity 0.3s ease-in-out',
													width: 280,
													flexShrink: 0,
												}}
											>
												<MatchColumn
													match={match}
													matchSelections={selections[match.id] || {}}
													onPlayerSelect={handlePlayerSelect}
													showLowBracketButton={
														!stagesWithoutLowBracket.includes(stageGroup.title)
													}
													minPlace={minPlace}
													maxPlace={maxPlace}
													showPlaceColumn={showPlaceColumn} // <- добавляем флаг
													showWinColumn={showWinColumn} // <- добавляем флаг
												/>
											</Box>
										)
									})}
								</Stack>
							</AccordionDetails>
						</Accordion>
					))}
				</Stack>
			</Box>
			<Box sx={{ mt: 3, textAlign: 'center' }}>
				<Button variant='contained' size='large' onClick={handleSubmit}>
					Сохранить выбор
				</Button>
			</Box>
		</Paper>
	)
}
