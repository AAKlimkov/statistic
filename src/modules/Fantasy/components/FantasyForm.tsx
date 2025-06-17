import { Box } from '@mui/material'
import * as React from 'react'
import InputField from '../../../components/InputField'

interface Props {
	name: string
	secret: string
	setName: (v: string) => void
	setSecret: (v: string) => void
	onSubmit: () => void
	onDelete?: () => void
	isEdit?: boolean
}

const FantasyForm: React.FC<Props> = ({
	name,
	secret,
	setName,
	setSecret,
	onSubmit,
	onDelete,
	isEdit = false,
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
				disabled={isEdit} // блокируем поле при редактировании
			/>
			<InputField
				value={secret}
				onChange={e => setSecret(e.target.value)}
				placeholder='Кодовое слово'
				type='password'
			/>
			{isEdit ? (
				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button
						variant='contained'
						color='primary'
						onClick={onSubmit}
						fullWidth
					>
						Обновить
					</Button>
					{/* <Button variant='outlined' color='error' onClick={onDelete} fullWidth>
						Удалить
					</Button> */}
				</Box>
			) : null

			// <Button variant='contained' color='success' onClick={onSubmit}>
			// 	Добавить участника
			// </Button>
			}
		</Box>
	)
}

export default FantasyForm
