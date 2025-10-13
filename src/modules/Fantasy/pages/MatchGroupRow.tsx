interface MatchGroupProps {
	matchGroup: MatchPicksGroup
	groupIndex: number
	stageGroups: MatchPicksGroup[]
}

const MatchGroupRow: React.FC<MatchGroupProps> = ({
	matchGroup,
	groupIndex,
	stageGroups,
}) => {
	const [open, setOpen] = React.useState(false)

	return (
		<div className='match-group'>
			<div
				className='match-title'
				onClick={() => setOpen(o => !o)}
				style={{ cursor: 'pointer', fontWeight: 'bold' }}
			>
				{matchGroup.matchTitle} {open ? '▲' : '▼'}
			</div>

			{open && (
				<div className='picks-cell'>
					{matchGroup.picks.map(pick => (
						<span
							key={`${pick.playerId}-${pick.displaySuffix}`}
							className={
								pick.awardedPoints === 0.5
									? 'pick-partial'
									: pick.passed === true
									? 'pick-correct'
									: pick.passed === false
									? 'pick-incorrect'
									: 'pick-pending'
							}
							style={
								pick.playerName === 'NLIP' || pick.playerName === 'Юрия'
									? { color: 'orange', textDecoration: 'none' }
									: pick.playerName === 'Путедьют' ||
									  pick.playerName === 'Зверюга' ||
									  pick.playerName === 'Инсомнич'
									? { color: 'purple', textDecoration: 'none' }
									: undefined
							}
						>
							{pick.playerName}
							{pick.displaySuffix}
						</span>
					))}
				</div>
			)}

			{groupIndex < stageGroups.length - 1 && <hr className='pick-separator' />}
		</div>
	)
}
