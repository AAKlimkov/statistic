import { Box, Button } from '@mui/material'
import * as React from 'react'
import InputField from '../../../components/InputField'

interface Props {
	name: string
	secret: string
	setName: (v: string) => void
	setSecret: (v: string) => void
	onSubmit: () => void
}

const FantasyForm: React.FC<Props> = ({
	name,
	secret,
	setName,
	setSecret,
	onSubmit,
}) => {
	return (
		<Box
			sx={{
				mb: 4,
				maxWidth: 400,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
			}}
		>
			<InputField
				value={name}
				onChange={e => setName(e.target.value)}
				placeholder='Имя'
			/>
			<InputField
				value={secret}
				onChange={e => setSecret(e.target.value)}
				placeholder='Кодовое слово'
				type='password'
			/>
			<Button variant='contained' color='success' onClick={onSubmit}>
				Добавить участника
			</Button>
		</Box>
	)
}

export default FantasyForm
