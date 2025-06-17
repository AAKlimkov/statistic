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
export type MatchSelections = Record<number, SelectionStatus>
export type Selections = Record<string, MatchSelections>
export type Stage = StageType

const allMatchesMap = new Map<string, Match>(
	[
		...bracketData.upperBracket.left,
		...bracketData.upperBracket.right,
		...bracketData.lowerBracket.left,
		...bracketData.lowerBracket.right,
		bracketData.finalStage,
	]
		.flatMap(stage => stage.matches)
		.map(match => [match.id, match])
)

export const Stage2: React.FC = () => {
	const [selections, setSelections] = useState<Selections>({})
	const { showToast } = useToast()

	const getMatchById = (matchId: string) => allMatchesMap.get(matchId)

	const handlePlayerSelect = useCallback(
		(matchId: string, playerId: number, status: SelectionStatus) => {
			setSelections(prev => {
				const newMatchSelections = { ...(prev[matchId] || {}) }
				const matchInfo = getMatchById(matchId)!
				const winnersCount = Object.values(newMatchSelections).filter(
					s => s === 'winner'
				).length

				if (newMatchSelections[playerId] === status) {
					delete newMatchSelections[playerId]
				} else {
					if (status === 'winner' && winnersCount >= matchInfo.selectionLimit) {
						showToast(
							`Можно выбрать не более ${matchInfo.selectionLimit} победителей!`,
							'warning'
						)
						return prev
					}
					newMatchSelections[playerId] = status
				}
				return { ...prev, [matchId]: newMatchSelections }
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
					const sourceMatch = processMatch(getMatchById(source.id)!)
					const sourceSelections = selections[source.id] || {}

					Object.entries(sourceSelections).forEach(([playerId, status]) => {
						if (status === source.type) {
							const player = sourceMatch.players.find(
								p => p.id === Number(playerId)
							)
							if (player) dynamicPlayers.push(player)
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
		return Object.fromEntries(processedMatches.entries())
	}, [selections])

	const getBracketForRender = (originalData: Stage[]) =>
		originalData.map(s => ({
			...s,
			matches: s.matches.map(m => displayedBracket[m.id]),
		}))

	const isMatchLocked = (matchId: string): boolean => {
		const matchInfo = getMatchById(matchId)
		if (!matchInfo?.sourceMatchIds) return false

		return !matchInfo.sourceMatchIds.every(source => {
			const sourceMatchInfo = getMatchById(source.id)!
			const sourceSelections = selections[source.id] || {}
			return (
				Object.keys(sourceSelections).length === sourceMatchInfo.players.length
			)
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
						{/*
						 *
						 * ИСПРАВЛЕНИЕ ЗДЕСЬ
						 *
						 */}
						<BracketSection
							stages={getBracketForRender(bracketData.upperBracket.left)}
							direction='left-to-right'
							selections={selections}
							onPlayerSelect={handlePlayerSelect}
							isLocked={isMatchLocked}
						/>
						<BracketSection
							stages={getBracketForRender(bracketData.upperBracket.right)}
							direction='right-to-left'
							selections={selections}
							onPlayerSelect={handlePlayerSelect}
							isLocked={isMatchLocked}
						/>
					</Stack>

					{/* === ФИНАЛ (Центральный блок) === */}
					<StageColumn
						stage={{
							...bracketData.finalStage,
							matches: bracketData.finalStage.matches.map(
								m => displayedBracket[m.id]
							),
						}}
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
						{/*
						 *
						 * И ИСПРАВЛЕНИЕ ЗДЕСЬ
						 *
						 */}
						<BracketSection
							stages={getBracketForRender(bracketData.lowerBracket.left)}
							direction='left-to-right'
							selections={selections}
							onPlayerSelect={handlePlayerSelect}
							isLocked={isMatchLocked}
						/>
						<BracketSection
							stages={getBracketForRender(bracketData.lowerBracket.right)}
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
