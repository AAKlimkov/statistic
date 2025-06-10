import { AuthFooterLink } from '@/components/AuthFooterLink'
import { AuthLayout } from '@/components/AuthLayout'
import { useToast } from '@/components/ToastProvider'
import { signInWithEmail } from '@/services/supabase'
import { Button, TextField } from '@mui/material'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginPage = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()
	const { showToast } = useToast()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			const { error } = await signInWithEmail(email, password)
			if (error) throw error
			showToast('Вы успешно вошли!', 'success')
			navigate('/')
		} catch (err: any) {
			showToast(err.message || 'Ошибка авторизации', 'error')
		}
	}

	return (
		<AuthLayout title='Вход'>
			<form onSubmit={handleSubmit}>
				<TextField
					label='Email'
					type='email'
					fullWidth
					margin='normal'
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
				/>
				<TextField
					label='Пароль'
					type='password'
					fullWidth
					margin='normal'
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
				/>
				<Button
					type='submit'
					variant='contained'
					color='primary'
					fullWidth
					sx={{ mt: 2 }}
				>
					Войти
				</Button>
			</form>
			<AuthFooterLink
				text='Забыли пароль?'
				linkText='Восстановить'
				linkTo='/forgot-password'
			/>
			<AuthFooterLink
				text='Нет аккаунта?'
				linkText='Зарегистрироваться'
				linkTo='/register'
			/>
		</AuthLayout>
	)
}
