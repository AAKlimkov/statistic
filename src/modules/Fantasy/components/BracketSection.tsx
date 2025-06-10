import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Stack } from '@mui/material'
// Убедимся, что типы импортируются из правильного места
import { Fragment } from 'react/jsx-runtime'
import { Selections, SelectionStatus, Stage } from '../pages/FantasyBracketPage'
import { StageColumn } from './StageColumn'

// Определяем пропсы для нашего компонента
interface BracketSectionProps {
	stages: Stage[]
	selections: Selections
	// **ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ**
	// Обновляем тип функции, чтобы он принимал третий аргумент 'status'
	onPlayerSelect: (
		matchId: string,
		playerId: number,
		status: SelectionStatus
	) => void
	isLocked: (matchId: string) => boolean
	direction?: 'left-to-right' | 'right-to-left'
}

export const BracketSection: React.FC<BracketSectionProps> = ({
	stages,
	selections,
	onPlayerSelect,
	isLocked,
	direction = 'left-to-right',
}) => {
	const arrow = (
		<Box sx={{ color: 'text.secondary', alignSelf: 'center', mx: 2 }}>
			<ArrowForwardIcon
				sx={{
					transform: direction === 'right-to-left' ? 'scaleX(-1)' : 'none',
					fontSize: 40,
				}}
			/>
		</Box>
	)

	const content = stages.map((stage, index) => (
		<Fragment key={stage.name + index}>
			<StageColumn
				stage={stage}
				selections={selections}
				onPlayerSelect={onPlayerSelect}
				isLocked={isLocked}
			/>
			{index < stages.length - 1 && arrow}
		</Fragment>
	))

	if (direction === 'right-to-left') {
		content.reverse()
	}

	return (
		<Stack direction='row' spacing={2} sx={{ p: 2, alignItems: 'center' }}>
			{content}
		</Stack>
	)
}
