// src/App.tsx

import {
	CssBaseline,
	GlobalStyles,
	ThemeProvider,
	createTheme,
} from '@mui/material' // <-- Импортируем ThemeProvider и createTheme
import * as React from 'react'
import { RouterProvider } from 'react-router-dom'
import './App.css'
import { ToastProvider } from './context/ToastProvider'
import { router } from './router/router'

// Вычисляем ширину скроллбара
const scrollbarWidth = window.innerWidth - document.body.clientWidth

// Создаем тему по умолчанию. Даже если она пустая, это необходимо для контекста.
const theme = createTheme()

function App() {
	return (
		// 1. Оборачиваем всё в ThemeProvider
		<ThemeProvider theme={theme}>
			{/* 
			  2. CssBaseline и GlobalStyles теперь находятся внутри ThemeProvider,
			     что обеспечивает правильный контекст и порядок применения стилей.
			*/}
			<CssBaseline />
			<GlobalStyles
				styles={{
					'body.Mui-modal-open': {
						paddingRight: `${scrollbarWidth}px !important`,
					},
				}}
			/>
			{/* 
			  ToastProvider и RouterProvider могут быть как внутри, так и снаружи ThemeProvider,
			  но для чистоты лучше поместить их внутрь, если они не влияют на тему.
			*/}
			<ToastProvider>
				<RouterProvider router={router} />
			</ToastProvider>
		</ThemeProvider>
	)
}

export default App
