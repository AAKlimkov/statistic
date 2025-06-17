import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import CheckCircleFilledIcon from '@mui/icons-material/CheckCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { Box, ButtonGroup, IconButton, Paper, Typography } from '@mui/material'
import * as React from 'react'
import { Match } from '../data/summerLeagueData'
import { MatchSelections, SelectionStatus } from '../pages/FantasyBracketPage'

interface MatchColumnProps {
	match: Match
	matchSelections: MatchSelections
	onPlayerSelect: (
		matchId: string,
		playerId: number,
		status: SelectionStatus
	) => void
	showLowBracketButton?: boolean
}

export const MatchColumn: React.FC<MatchColumnProps> = ({
	match,
	matchSelections,
	onPlayerSelect,
	showLowBracketButton = true,
}) => {
	return (
		<Paper
			elevation={3}
			sx={{
				// ИЗМЕНЕНИЕ: Уменьшаем внутренний отступ
				p: 1.5,
				backgroundColor: 'white',
				border: '1px solid #ddd',
				width: '100%',
			}}
		>
			<Typography
				variant='h6'
				component='h3'
				align='center'
				sx={{ fontWeight: 'bold' }}
			>
				{match.title}
			</Typography>
			<Typography
				variant='body2'
				color='text.secondary'
				align='center'
				gutterBottom
			>
				{match.date}
			</Typography>
			<Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
				{match.players.map(player => (
					<Box
						key={player.id}
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Typography
							sx={{
								flexGrow: 1,
								fontStyle: player.isPlaceholder ? 'italic' : 'normal',
								color: player.isPlaceholder ? 'text.disabled' : 'text.primary',
							}}
						>
							{player.name}
						</Typography>
						{!player.isPlaceholder && (
							<ButtonGroup size='small' variant='outlined'>
								<IconButton
									onClick={() => onPlayerSelect(match.id, player.id, 'winner')}
									color={
										matchSelections[player.id] === 'winner'
											? 'success'
											: 'default'
									}
								>
									{matchSelections[player.id] === 'winner' ? (
										<CheckCircleFilledIcon />
									) : (
										<CheckCircleIcon />
									)}
								</IconButton>

								{showLowBracketButton && (
									<IconButton
										onClick={() =>
											onPlayerSelect(match.id, player.id, 'lowBracket')
										}
										color={
											matchSelections[player.id] === 'lowBracket'
												? 'warning'
												: 'default'
										}
									>
										<ArrowDownwardIcon />
									</IconButton>
								)}

								<IconButton
									onClick={() => onPlayerSelect(match.id, player.id, 'loser')}
									color={
										matchSelections[player.id] === 'loser' ? 'error' : 'default'
									}
								>
									<HighlightOffIcon />
								</IconButton>
							</ButtonGroup>
						)}
					</Box>
				))}
			</Box>
		</Paper>
	)
}