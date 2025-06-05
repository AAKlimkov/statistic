import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material'
import * as React from 'react'

interface ConfirmModalProps {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	title?: string
	description?: string
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	open,
	onClose,
	onConfirm,
	title = 'Подтвердите действие',
	description = 'Вы уверены, что хотите продолжить?',
}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			aria-labelledby='confirm-dialog-title'
		>
			<DialogTitle id='confirm-dialog-title'>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{description}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color='primary'>
					Отмена
				</Button>
				<Button
					onClick={() => {
						onConfirm()
						onClose()
					}}
					color='error'
					variant='contained'
					autoFocus
				>
					Подтвердить
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default ConfirmModal
