import React, { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL_PROD

export default function AddPlayerForm() {
	const [name, setName] = useState('')
	const [status, setStatus] = useState<string | null>(null)

	const handleSubmit = async () => {
		if (!name.trim()) {
			setStatus('Введите имя')
			return
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/proxy-save-player`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name }),
			})

			const result = await res.json()

			if (!res.ok) {
				setStatus(`Ошибка: ${result.error || 'Не удалось сохранить'}`)
			} else {
				setStatus(`Игрок "${result.name}" добавлен`)
				setName('')
			}
		} catch (e) {
			setStatus('Сетевая ошибка')
			console.error(e)
		}
	}

	return (
		<div>
			<input
				type='text'
				placeholder='Имя игрока'
				value={name}
				onChange={e => setName(e.target.value)}
			/>
			<button onClick={handleSubmit}>Сохранить</button>
			{status && <p>{status}</p>}
		</div>
	)
}
