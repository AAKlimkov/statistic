const baseUrl =
	import.meta.env.MODE === 'production'
		? import.meta.env.VITE_API_URL_PROD
		: import.meta.env.VITE_API_URL_DEV
