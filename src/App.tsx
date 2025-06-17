// src/App.tsx

import * as React from 'react'
import { RouterProvider } from 'react-router-dom'
import './App.css'
import { ToastProvider } from './context/ToastProvider'
import { router } from './router/router'
// import theme from './theme'; // Раскомментируйте, если у вас есть своя тема для MUI

function App() {
	return (
		<ToastProvider>
			<RouterProvider router={router} />
		</ToastProvider>
	)
}

export default App
