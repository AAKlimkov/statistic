import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../modules/auth/hooks/useAuth'

/**
 * Компонент-обертка для защиты маршрутов,
 * доступных только НЕавторизованным пользователям (гостям).
 * Например, страницы входа и регистрации.
 */
export const PublicRoute = () => {
	// Получаем текущего пользователя из нашего AuthContext
	const { user } = useAuth()

	console.log(user)

	// Если пользователь есть (авторизован), то не пускаем его на
	// страницу входа/регистрации, а перенаправляем в дашборд админки.
	if (user) {
		return <Navigate to='/admin/dashboard' replace />
	}

	// Если пользователя нет (он гость), то разрешаем ему видеть
	// страницу входа или регистрации.
	return <Outlet />
}
