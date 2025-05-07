import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {
	const navigate = useNavigate()

	const handleBackClick = () => {
		// Переход назад
		navigate(-1)

		// Проверка URL после перехода
		setTimeout(() => {
			// Если URL не содержит 'aaklimkov', переходим на главную страницу
			if (!window.location.href.includes('aaklimkov')) {
				navigate('/statistic')
			}
		}, 100)
	}

	return (
		<Button variant='outlined' onClick={handleBackClick} sx={{ mb: 2 }}>
			← Назад
		</Button>
	)
}

export default BackButton
