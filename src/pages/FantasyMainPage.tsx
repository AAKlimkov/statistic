import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	Container,
	Divider,
	Stack,
	Typography,
} from '@mui/material'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Participant {
	id: number
	name: string
	score: number
	updated_at: string
}

const HomePage = () => {
	const [participants, setParticipants] = useState<Participant[]>([])

	useEffect(() => {
		fetch('/api/fantasy_rating')
			.then(res => res.json())
			.then(data => setParticipants(data))
	}, [])

	return (
		<Container
			maxWidth='md'
			sx={{
				backgroundColor: 'rgba(255, 255, 255, 1)', // слегка прозрачный белый фон
				borderRadius: 2,
				boxShadow: 3,
				py: 4,
				px: 3,
			}}
		>
			<Typography variant='h3' align='center' gutterBottom>
				Фэнтези Лига 2025
			</Typography>
			<Typography variant='subtitle1' align='center' gutterBottom>
				Собери свою сетку и соревнуйся с другими участниками
			</Typography>

			<Stack spacing={2} my={4}>
				{/* <Button
					variant='contained'
					color='primary'
					size='large'
					fullWidth
					component={Link}
					to='autumn/qualRegister'
				>
					📋 Заполнить фэнтези-пик
				</Button> */}
				<Button
					variant='outlined'
					color='primary'
					size='large'
					fullWidth
					component={Link}
					to='/fantasyTable'
				>
					📊 Посмотреть таблицу
				</Button>
				{/* <Button
					variant='outlined'
					color='primary'
					size='large'
					fullWidth
					component={Link}
					to='/fantasyTable2stage'
				>
					📊 Посмотреть таблицу (2 этап)
				</Button> */}
				<Button
					variant='outlined'
					color='secondary'
					size='large'
					fullWidth
					component={Link}
					to='fantasyRules'
				>
					📘 Правила лиги
				</Button>
				{/* <Button
						variant='outlined'
						color='success'
						size='large'
						fullWidth
						component={Link}
						to='/fantasy/statistics'
					>
						📈 Статистика выбора игроков
					</Button> */}
			</Stack>

			<Typography variant='caption' display='block' align='center' gutterBottom>
				Можно редактировать в любое время до начала турнира, используя кодовое
				слово
			</Typography>

			<Divider sx={{ my: 4 }} />

			{/* <Typography variant='h5' gutterBottom>
					Рейтинг участников (ТОП 10)
				</Typography>
				<TableContainer component={Paper} sx={{ mb: 4 }}>
					<Table size='small'>
						<TableHead>
							<TableRow>
								<TableCell>Имя</TableCell>
								<TableCell>Очки</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{participants.slice(0, 10).map(p => (
								<TableRow key={p.id}>
									<TableCell>{p.name}</TableCell>
									<TableCell>{p.score}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer> */}

			<Typography variant='h5' gutterBottom>
				Часто задаваемые вопросы
			</Typography>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>Как работает система?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Вы выбираете по 4 игрока в каждом отборе. Очки начисляются после
						завершения матчей по результатам прохода игроков и финальных мест.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>Как начисляются очки?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						За каждый раунд, в который проходит ваш игрок, вы получаете 1 очко.
						За попадание в топ-3 добавляются 2 бонусных очка.
					</Typography>
				</AccordionDetails>
			</Accordion>
		</Container>
	)
}

export default HomePage
