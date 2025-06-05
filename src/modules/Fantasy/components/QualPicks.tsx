import { Box, Button, Paper, Typography } from '@mui/material'
import * as React from 'react'
import { qualData } from '../data/qualData'
import { SelectedPlayers } from '../types'

interface Props {
	selected: SelectedPlayers
	onSelect: (kvalIndex: number, playerId: number) => void
}

const QualPicks: React.FC<Props> = ({ selected, onSelect }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				gap: 2,
				justifyContent: 'space-between',
			}}
		>
			{qualData.map((qual, kvalIndex) => (
				<Paper
					key={kvalIndex}
					elevation={3}
					sx={{
						p: 2,
						flex: '1 1 45%',
						minWidth: 300,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Typography variant='h6'>
						{qual.title} — {qual.date}
					</Typography>
					<Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
						{qual.players.map(player => {
							const isSelected = (selected[kvalIndex] || []).includes(player.id)
							return (
								<Button
									key={player.id}
									variant={isSelected ? 'contained' : 'outlined'}
									color={isSelected ? 'primary' : 'inherit'}
									onClick={() => onSelect(kvalIndex, player.id)}
									sx={{ flexBasis: '48%', whiteSpace: 'nowrap' }}
								>
									{player.name}
								</Button>
							)
						})}
					</Box>
				</Paper>
			))}
		</Box>
	)
}

export default QualPicks
