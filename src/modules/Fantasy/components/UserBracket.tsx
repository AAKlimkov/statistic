// /components/fantasy/UserBracket.tsx  (пример пути)

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Stack,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { MatchColumn } from '../components/MatchColumn' // Убедитесь, что путь верный
import {
	bracketData,
	Match,
	MatchSource,
	Player,
	Stage as StageType,
} from '../data/summerLeagueData' // Убедитесь, что путь верный

// Типы, которые нам понадобятся
export type SelectionStatus =
	| { type: 'winner' }
	| { type: 'loser' }
	| { type: 'place'; value: number }
export type MatchSelections = Record<number, SelectionStatus>
export type Selections = Record<string, MatchSelections>
export type Stage = StageType

interface CleanPick {
	id: number
	fantasy_user_id: number
	match_id: string
	player_id: number
	pick_type: 'winner' | 'loser' | 'place'
	place_value: number | null
}

interface UserPicksData {
	fantasy_user_id: number
	fantasy_user_name: string
	picks: CleanPick[]
}

interface UserBracketProps {
	userPicks: UserPicksData
}

// Карта всех матчей для быстрого доступа
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

export const UserBracket: React.FC<UserBracketProps> = ({ userPicks }) => {
	// 1. Преобразуем массив пиков пользователя в объект `selections`,
	// который понимает логика отображения сетки.
	const selections: Selections = useMemo(() => {
		const newSelections: Selections = {}
		userPicks.picks.forEach(pick => {
			if (!newSelections[pick.match_id]) {
				newSelections[pick.match_id] = {}
			}
			newSelections[pick.match_id][pick.player_id] =
				pick.pick_type === 'place'
					? { type: 'place', value: pick.place_value! }
					: { type: pick.pick_type }
		})
		return newSelections
	}, [userPicks.picks])

	// 2. Вся остальная логика из вашего шаблона остается почти без изменений.
	// Она будет работать на основе `selections`, которые мы получили выше.

	const getMatchById = (matchId: string) => allMatchesMap.get(matchId)

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
		return {
			displayedBracket: {
				upperBracket: {
					left: bracketData.upperBracket.left.map(getUpdatedStage),
					right: bracketData.upperBracket.right.map(getUpdatedStage),
				},
				lowerBracket: {
					left: bracketData.lowerBracket.left.map(getUpdatedStage),
					right: bracketData.lowerBracket.right.map(getUpdatedStage),
				},
				finalStage: getUpdatedStage(bracketData.finalStage),
			},
			processedMatchesMap: processedMatches,
		}
	}, [selections])

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
			{ title: 'Финал', matches: finalStage.matches },
		]
	}, [displayedBracket])

	// Вспомогательные функции (можно вынести, если используются еще где-то)
	const shouldShowPlaceColumn = useCallback((match: Match): boolean => {
		if (
			match.title === 'Финал' ||
			match.id === 'U-1/2-2' ||
			match.id === 'U-1/2-1'
		)
			return false
		return true
	}, [])

	const shouldShowWinColumn = useCallback((match: Match): boolean => {
		if (match.id === 'L-1/2-B' || match.id === 'L-1/2-C') return false
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

	const [expandedStages, setExpandedStages] = useState<Set<string>>(
		new Set(['1/8 Финала'])
	)
	const handleStageAccordionChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpandedStages(prev => {
				const newSet = new Set(prev)
				isExpanded ? newSet.add(panel) : newSet.delete(panel)
				return newSet
			})
		}
	const stagesWithoutLowBracket = ['1/2 Финала', 'Финал']

	// 3. Возвращаем только разметку сетки, без обвязки для редактирования.
	return (
		<Stack direction='column' spacing={2}>
			{organizedLayout.map(stageGroup => (
				<Accordion
					key={stageGroup.title}
					expanded={expandedStages.has(stageGroup.title)}
					onChange={handleStageAccordionChange(stageGroup.title)}
					// sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }} // легкий фон для вложенности
				>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography variant='h6' component='h3'>
							{stageGroup.title}
						</Typography>
					</AccordionSummary>
					<AccordionDetails sx={{ overflowX: 'auto' }}>
						<Stack
							direction='row'
							spacing={2}
							sx={{ display: 'inline-flex', minWidth: '100%', py: 1 }}
						>
							{stageGroup.matches.map(match => {
								const { minPlace, maxPlace } = getPlaceRangeForStage(
									stageGroup.title
								)
								return (
									<Box key={match.id} sx={{ width: 280, flexShrink: 0 }}>
										<MatchColumn
											match={match}
											matchSelections={selections[match.id] || {}}
											onPlayerSelect={() => {}} // Пустая функция - выбор заблокирован
											showLowBracketButton={
												!stagesWithoutLowBracket.includes(stageGroup.title)
											}
											minPlace={minPlace}
											maxPlace={maxPlace}
											showPlaceColumn={shouldShowPlaceColumn(match)}
											showWinColumn={shouldShowWinColumn(match)}
										/>
									</Box>
								)
							})}
						</Stack>
					</AccordionDetails>
				</Accordion>
			))}
		</Stack>
	)
}
