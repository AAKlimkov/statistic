// /pages/fantasy/AllBracketsPage.tsx (пример пути)

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	CircularProgress,
	Container,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastProvider'
import { UserBracket } from '../components/UserBracket'

// Тип данных, который мы ожидаем от API
interface UserPicksData {
	fantasy_user_id: number
	fantasy_user_name: string
	picks: any[] // Тип пиков не так важен здесь, он обрабатывается в UserBracket
}

export const FantasyBracketViewer: React.FC = () => {
	const [allPicks, setAllPicks] = useState<UserPicksData[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [expandedUser, setExpandedUser] = useState<number | false>(false)
	const { showToast } = useToast()

	useEffect(() => {
		const fetchAllPicks = async () => {
			setIsLoading(true)
			setError(null)
			try {
				// Используйте ваш эндпоинт, который отдает сгруппированные данные
				const response = await fetch('/api/fantasy/allPicksStage2') // ЗАМЕНИТЕ НА СВОЙ ЭНДПОИНТ
				if (!response.ok) {
					const errData = await response.json()
					throw new Error(errData.error || 'Не удалось загрузить данные')
				}
				const data: UserPicksData[] = await response.json()
				setAllPicks(data)
			} catch (err: any) {
				setError(err.message)
				showToast(err.message, 'error')
			} finally {
				setIsLoading(false)
			}
		}

		fetchAllPicks()
	}, [showToast])

	const handleAccordionChange =
		(userId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpandedUser(isExpanded ? userId : false)
		}

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
				<CircularProgress />
			</Box>
		)
	}

	if (error) {
		return (
			<Typography color='error' align='center' sx={{ my: 4 }}>
				Ошибка загрузки: {error}
			</Typography>
		)
	}

	return (
		<Container maxWidth='xl' sx={{ py: 3 }}>
			<Typography variant='h4' component='h1' gutterBottom align='center'>
				Просмотр фэнтези-сеток
			</Typography>

			{allPicks.length === 0 ? (
				<Typography align='center'>Еще никто не сделал свой выбор.</Typography>
			) : (
				<Box>
					{allPicks.map(userPicks => (
						<Accordion
							key={userPicks.fantasy_user_id}
							expanded={expandedUser === userPicks.fantasy_user_id}
							onChange={handleAccordionChange(userPicks.fantasy_user_id)}
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls={`panel-${userPicks.fantasy_user_id}-content`}
								id={`panel-${userPicks.fantasy_user_id}-header`}
							>
								<Typography
									sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}
								>
									{userPicks.fantasy_user_name}
								</Typography>
								<Typography sx={{ color: 'text.secondary' }}>
									ID: {userPicks.fantasy_user_id}
								</Typography>
							</AccordionSummary>
							<AccordionDetails>
								{/* Здесь мы рендерим компонент с логикой сетки для конкретного пользователя */}
								<UserBracket userPicks={userPicks} />
							</AccordionDetails>
						</Accordion>
					))}
				</Box>
			)}
		</Container>
	)
}
