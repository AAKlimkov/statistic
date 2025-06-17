// src/pages/Stage2.tsx

import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useToast } from '../../../context/ToastProvider'
import { BracketSection } from '../components/BracketSection'
import { StageColumn } from '../components/StageColumn'
import {
	bracketData,
	Match,
	MatchSource,
	Player,
	Stage as StageType,
} from '../data/summerLeagueData'

// Типы
export type SelectionStatus = 'winner' | 'lowBracket' | 'loser'
export type MatchSelections = Record<number, SelectionStatus> // { playerId: status }
export type Selections = Record<string, MatchSelections> // { matchId: { playerId: status } }
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
	// Переименуем Stage2 для ясности
	const [selections, setSelections] = useState<Selections>({})
	const { showToast } = useToast()

	const getMatchById = (matchId: string) => allMatchesMap.get(matchId)

	const handlePlayerSelect = useCallback(
		(matchId: string, playerId: number, status: SelectionStatus) => {
			setSelections(prev => {
				const newSelections = { ...prev }
				const newMatchSelections = { ...(newSelections[matchId] || {}) }
				const matchInfo = getMatchById(matchId)!

				const winnersCount = Object.values(newMatchSelections).filter(
					s => s === 'winner'
				).length

				// Если кликаем на ту же иконку, снимаем выбор
				if (newMatchSelections[playerId] === status) {
					delete newMatchSelections[playerId]
				} else {
					// Проверяем лимит только для победителей
					if (status === 'winner' && winnersCount >= matchInfo.selectionLimit) {
						showToast(
							`Можно выбрать не более ${matchInfo.selectionLimit} победителей!`,
							'warning'
						)
						return prev // Возвращаем предыдущее состояние без изменений
					}
					newMatchSelections[playerId] = status
				}

				newSelections[matchId] = newMatchSelections
				return newSelections
			})
		},
		[showToast]
	)

	const displayedBracket = useMemo(() => {
		const processedMatches = new Map<string, Match>()

		const processMatch = (match: Match): Match => {
			if (processedMatches.has(match.id)) return processedMatches.get(match.id)!

			const newMatch: Match = JSON.parse(JSON.stringify(match))

			if (newMatch.sourceMatchIds) {
				const dynamicPlayers: Player[] = []
				newMatch.sourceMatchIds.forEach((source: MatchSource) => {
					// Рекурсивно обрабатываем матч-источник
					const sourceMatch = processMatch(getMatchById(source.id)!)
					const sourceSelections = selections[source.id] || {}

					// **НОВАЯ ЛОГИКА ЗДЕСЬ**
					// Проходим по всем игрокам матча-источника
					sourceMatch.players.forEach(player => {
						if (player.isPlaceholder) return

						const playerStatus = sourceSelections[player.id]
						// Если статус игрока совпадает с тем, что нам нужно, добавляем его
						if (playerStatus === source.type) {
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
	}, [selections])

	const isMatchLocked = (matchId: string): boolean => {
		const matchInfo = getMatchById(matchId)
		if (!matchInfo?.sourceMatchIds) return false

		// Матч разблокирован, только если ВСЕ игроки во ВСЕХ матчах-источниках получили статус
		return !matchInfo.sourceMatchIds.every(source => {
			const sourceMatchInfo = getMatchById(source.id)!
			const sourceSelections = selections[source.id] || {}
			// Убираем плейсхолдеры из подсчета
			const realPlayersCount = sourceMatchInfo.players.filter(
				p => !p.isPlaceholder
			).length
			return Object.keys(sourceSelections).length === realPlayersCount
		})
	}

	const handleSubmit = () => {
		console.log('Итоговый выбор:', JSON.stringify(selections, null, 2))
		showToast('Ваш выбор выведен в консоль!', 'info')
	}

	return (
		<Paper
			elevation={3}
			sx={{
				p: { xs: 1, sm: 2, md: 3 },
				width: '100%',
				maxWidth: '95vw',
				bgcolor: 'rgba(255, 255, 255, 0.95)',
			}}
		>
			<Typography variant='h4' component='h1' gutterBottom align='center'>
				Фэнтези-сетка
			</Typography>
			<Box sx={{ overflowX: 'auto', p: 2 }}>
				<Box
					sx={{
						display: 'inline-flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 4,
					}}
				>
					{/* === ВЕРХНЯЯ СЕТКА === */}
					<Stack
						direction='row'
						justifyContent='center'
						alignItems='flex-start'
						spacing={4}
					>
						<BracketSection
							stages={displayedBracket.upperBracket.left}
							direction='left-to-right'
							selections={selections}
							onPlayerSelect={handlePlayerSelect}
							isLocked={isMatchLocked}
						/>
						<BracketSection
							stages={displayedBracket.upperBracket.right}
							direction='right-to-left'
							selections={selections}
							onPlayerSelect={handlePlayerSelect}
							isLocked={isMatchLocked}
						/>
					</Stack>

					{/* === ФИНАЛ (Центральный блок) === */}
					<StageColumn
						stage={displayedBracket.finalStage}
						selections={selections}
						onPlayerSelect={handlePlayerSelect}
						isLocked={isMatchLocked}
					/>

					{/* === НИЖНЯЯ СЕТКА === */}
					<Stack
						direction='row'
						justifyContent='center'
						alignItems='flex-start'
						spacing={4}
					>
						<BracketSection
							stages={displayedBracket.lowerBracket.left}
							direction='left-to-right'
							selections={selections}
							onPlayerSelect={handlePlayerSelect}
							isLocked={isMatchLocked}
						/>
						<BracketSection
							stages={displayedBracket.lowerBracket.right}
							direction='right-to-left'
							selections={selections}
							onPlayerSelect={handlePlayerSelect}
							isLocked={isMatchLocked}
						/>
					</Stack>
				</Box>
			</Box>
			<Box sx={{ mt: 3, textAlign: 'center' }}>
				<Button variant='contained' size='large' onClick={handleSubmit}>
					Сохранить выбор
				</Button>
			</Box>
		</Paper>
	)
}
