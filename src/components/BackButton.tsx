import { Button } from '@mui/material'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {
	const navigate = useNavigate()

	const handleBackClick = () => {
		// Переход назад
		navigate(-1)
	}

	return (
		<Button variant='outlined' onClick={handleBackClick} sx={{ mb: 2 }}>
			← Назад
		</Button>
	)
}

export default BackButton
