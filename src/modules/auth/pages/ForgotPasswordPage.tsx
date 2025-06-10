import { useToast } from '@context/ToastProvider'
import { AuthFooterLink } from '@modules/auth/components'
import { AuthLayout } from '@modules/auth/layout'
import { resetPasswordForEmail } from '@modules/auth/services'
import { Button, TextField, Typography } from '@mui/material'
import { FormEvent, useState } from 'react'

export const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('')
	const { showToast } = useToast()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			const { error } = await resetPasswordForEmail(email)
			if (error) throw error
			showToast(
				'Если пользователь существует, инструкция отправлена на email.',
				'success'
			)
		} catch (err: any) {
			showToast(err.message || 'Ошибка восстановления пароля', 'error')
		}
	}

	return (
		<AuthLayout title='Восстановление пароля'>
			<form onSubmit={handleSubmit}>
				<Typography variant='body2' sx={{ mb: 2 }}>
					Введите ваш email, и мы вышлем вам ссылку для сброса пароля.
				</Typography>
				<TextField
					label='Email'
					type='email'
					fullWidth
					margin='normal'
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
				/>
				<Button
					type='submit'
					variant='contained'
					color='primary'
					fullWidth
					sx={{ mt: 2 }}
				>
					Отправить ссылку
				</Button>
			</form>
			<AuthFooterLink text='Вспомнили пароль?' linkText='Войти' to='/login' />
		</AuthLayout>
	)
}
