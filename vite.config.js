import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: '/',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@hooks': path.resolve(__dirname, 'src/hooks'),
			'@modules': path.resolve(__dirname, 'src/modules'),
			'@context': path.resolve(__dirname, 'src/context'),
			'@types': path.resolve(__dirname, 'src/types'),
			'@assets': path.resolve(__dirname, 'src/assets'),
			'@layout': path.resolve(__dirname, 'src/layout'),
			'@store': path.resolve(__dirname, 'src/store'),
			'@features': path.resolve(__dirname, 'src/features'),
		},
	},
})
