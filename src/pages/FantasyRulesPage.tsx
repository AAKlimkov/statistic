import { Box, Container, Typography } from '@mui/material'
import * as React from 'react'

const FantasyRulesPage = () => {
	return (
		<Container maxWidth='md' sx={{ mt: 6, mb: 8 }}>
			<Typography variant='h4' gutterBottom>
				📘 Правила Fantasy Лиги
			</Typography>

			<Box mt={4}>
				<Typography variant='h6' gutterBottom>
					Что нужно сделать?
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					Турнир состоит из двух этапов: <strong>квалификационный раунд</strong>{' '}
					и <strong>основной этап</strong>.
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					На этапе квалификации ваша задача — выбрать по 4 игроков из каждой из
					1/16 частей сетки, которые, по вашему мнению, пройдут дальше.
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					На основном этапе вы должны расписать{' '}
					<strong>всю турнирную сетку начиная с 1/8 финала</strong>.
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					За каждый раунд игроки приносят <strong>fantasy points (FP)</strong>,
					которые суммируются за оба этапа. Если вы не успели выбрать игроков на
					квалификацию — вы всё ещё можете заполнить основную сетку.
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					При равенстве баллов выше будет тот участник, чей{' '}
					<strong>один игрок</strong> набрал больше всего FP.
				</Typography>
			</Box>

			<Box mt={4}>
				<Typography variant='h6' gutterBottom>
					Когда можно сделать выбор?
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					📌 Регистрация пиков на квалификацию закроется{' '}
					<strong>17 июня</strong>, перед стартом первой 1/16.
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					📌 Основную сетку можно будет заполнить до <strong>26 июня</strong>,
					до начала первой 1/8 финала.
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					🛠️ До начала каждого этапа вы можете{' '}
					<strong>редактировать свой состав</strong> — нет необходимости
					создавать заново.
				</Typography>
			</Box>

			<Box mt={4}>
				<Typography variant='h6' gutterBottom>
					Система начисления Fantasy Points
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					⚽ За каждый пройденный раунд выбранный игрок приносит вам{' '}
					<strong>1 FP</strong>.
				</Typography>
				<Typography component='p' sx={{ mb: 2 }}>
					🏅 Если игрок дойдёт до финала и займет место с 1 по 3 — вы получите{' '}
					<strong>дополнительно 2 FP</strong>.
				</Typography>

				<Typography component='p' sx={{ mt: 2 }}>
					<strong>Пример:</strong> вы выбрали игрока X в 1/8 финала. Он доходит
					до финала и занимает 2 место. Вы получаете:
				</Typography>
				<Box component='ul' sx={{ pl: 3, mb: 2 }}>
					<li>1 FP за победу в 1/8</li>
					<li>1 FP за победу в 1/4</li>
					<li>1 FP за победу в 1/2</li>
					<li>2 FP за финальную часть</li>
				</Box>
				<Typography component='p' sx={{ mb: 2 }}>
					Итого: <strong>5 FP</strong>
				</Typography>
			</Box>
		</Container>
	)
}

export default FantasyRulesPage
