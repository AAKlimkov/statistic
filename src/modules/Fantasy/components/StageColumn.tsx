import { Box, Stack, Typography } from '@mui/material'
// Убедимся, что типы импортируются из правильного места
import { Selections, SelectionStatus, Stage } from '../pages/FantasyBracketPage'
import { MatchColumn } from './MatchColumn'

// Определяем пропсы для нашего компонента
interface StageColumnProps {
	stage: Stage
	selections: Selections
	// Тип функции onPlayerSelect теперь должен включать и статус
	onPlayerSelect: (
		matchId: string,
		playerId: number,
		status: SelectionStatus
	) => void
	isLocked: (matchId: string) => boolean
}

export const StageColumn: React.FC<StageColumnProps> = ({
	stage,
	selections,
	onPlayerSelect,
	isLocked,
}) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				flexShrink: 0,
			}}
		>
			<Typography variant='h5' sx={{ mb: 2, fontWeight: 'bold' }}>
				{stage.name}
			</Typography>
			<Stack direction='column' spacing={2} sx={{ width: 280 }}>
				{stage.matches.map(match => (
					// Блокируем весь Box, если матч заблокирован
					<Box
						key={match.id}
						sx={{
							opacity: isLocked(match.id) ? 0.5 : 1,
							pointerEvents: isLocked(match.id) ? 'none' : 'auto',
							transition: 'opacity 0.3s ease-in-out',
						}}
					>
						{/*
						 *
						 * ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ
						 *
						 */}
						<MatchColumn
							match={match}
							// Передаем новый проп matchSelections, беря данные из общего объекта selections
							matchSelections={selections[match.id] || {}}
							onPlayerSelect={onPlayerSelect}
						/>
					</Box>
				))}
			</Stack>
		</Box>
	)
}
