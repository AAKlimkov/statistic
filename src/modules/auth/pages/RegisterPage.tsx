import { AuthFooterLink } from '@/components/AuthFooterLink'
import { AuthLayout } from '@/components/AuthLayout'
import { useToast } from '@/components/ToastProvider'
import { signUpWithEmail } from '@/services/supabase'
import { Button, TextField } from '@mui/material'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const RegisterPage = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()
	const { showToast } = useToast()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			const { error } = await signUpWithEmail(email, password)
			if (error) throw error
			showToast(
				'Регистрация успешна! Проверьте email для подтверждения.',
				'success'
			)
			navigate('/login')
		} catch (err: any) {
			showToast(err.message || 'Ошибка регистрации', 'error')
		}
	}

	return (
		<AuthLayout title='Регистрация'>
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
					Зарегистрироваться
				</Button>
			</form>
			<AuthFooterLink
				text='Уже есть аккаунт?'
				linkText='Войти'
				linkTo='/login'
			/>
		</AuthLayout>
	)
}
