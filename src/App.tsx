// src/App.tsx

import { CssBaseline } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './context/ToastProvider'
import { router } from './router/router'
// import theme from './theme'; // Раскомментируйте, если у вас есть своя тема для MUI

function App() {
	return (
		<AuthProvider>
			{/* 2. (Опционально) Провайдер темы для Material-UI */}
			{/* <ThemeProvider theme={theme}> */}

			{/* 3. Сбрасывает стили браузера по умолчанию для консистентного вида */}
			<CssBaseline />
			<ToastProvider>
				<RouterProvider router={router} />
			</ToastProvider>

			{/* </ThemeProvider> */}
		</AuthProvider>
	)
}

export default App
