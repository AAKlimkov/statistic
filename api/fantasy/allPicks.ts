import { createClient, SupabaseClient } from '@supabase/supabase-js'
// Убедитесь, что PickDataWithUser действительно экспортируется и доступна
// Если она определена так: export interface PickDataWithUser { ... }
// или export type PickDataWithUser = { ... };
import { PickDataWithUser } from '../../src/modules/Fantasy/types' // Убедитесь, что путь корректен

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Supabase URL or Anon Key is missing. Please check your environment variables.'
	)
}

const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)

export const config = {
	runtime: 'edge',
}

// Количество записей, запрашиваемых за один раз.
// Supabase/PostgREST по умолчанию имеет лимит около 1000 на range.
const PAGE_SIZE = 1000
// Максимальное количество страниц, чтобы предотвратить слишком долгие запросы в Edge Function
const MAX_PAGES = 100 // 100 страниц * 1000 записей = 100,000 записей. Настройте под ваши нужды и лимиты.

export default async function handler(req: Request) {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*', // В продакшене лучше указать конкретный домен
		'Access-Control-Allow-Headers':
			'authorization, x-client-info, apikey, content-type, accept',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Разрешаем только GET для этого эндпоинта
		Vary: 'Origin',
	}

	if (req.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: corsHeaders })
	}

	if (req.method !== 'GET') {
		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}

	try {
		let allPicks: PickDataWithUser[] = []
		let currentPage = 0
		let hasMoreData = true

		while (hasMoreData && currentPage < MAX_PAGES) {
			const rangeFrom = currentPage * PAGE_SIZE
			const rangeTo = rangeFrom + PAGE_SIZE - 1

			const { data: picksPage, error: fetchError } = (await supabase
				.from('fantasy_picks')
				.select(
					`
            id,
            fantasy_user_id,
            qualification_index,
            player_id,
            fantasy_users ( id, name ),
            players ( id, name )
          `
				)
				.order('id') // Добавление .order() важно для консистентной пагинации
				.range(rangeFrom, rangeTo)) as {
				data: PickDataWithUser[] | null
				error: any
			}

			if (fetchError) {
				console.error(
					`Supabase fetch error on page ${currentPage + 1}:`,
					fetchError
				)
				// В зависимости от требований, можно прервать и вернуть ошибку,
				// или попытаться обработать уже полученные данные.
				// Здесь мы прерываем и возвращаем ошибку.
				return new Response(JSON.stringify({ error: fetchError.message }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}

			if (picksPage && picksPage.length > 0) {
				allPicks = allPicks.concat(picksPage)
			}

			if (!picksPage || picksPage.length < PAGE_SIZE) {
				hasMoreData = false // Это была последняя страница
			} else {
				currentPage++
			}
		}

		if (currentPage >= MAX_PAGES && hasMoreData) {
			console.warn(
				`Reached MAX_PAGES limit (${MAX_PAGES}). Data might be incomplete if there were more pages.`
			)
			// Вы можете решить, как обрабатывать эту ситуацию: вернуть ошибку,
			// вернуть частичные данные с предупреждением, или увеличить MAX_PAGES.
		}

		if (allPicks.length === 0) {
			return new Response(JSON.stringify({}), {
				// Возвращаем пустой объект, если пиков нет
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const grouped: Record<string, any[]> = {} // Используем Record для лучшей типизации ключей

		for (const pick of allPicks) {
			// Проверка на случай, если связанные данные (fantasy_users или players) могут быть null
			if (!pick.fantasy_users || !pick.players) {
				console.warn('Skipping pick due to missing related data:', pick.id)
				continue // Пропустить этот пик, если связанные данные отсутствуют
			}

			const kval = pick.qualification_index.toString()
			const userId = pick.fantasy_users.id
			const userName = pick.fantasy_users.name

			if (!grouped[kval]) {
				grouped[kval] = []
			}

			let userEntry = grouped[kval].find(u => u.userId === userId)

			if (!userEntry) {
				userEntry = { userId, name: userName, picks: [] }
				grouped[kval].push(userEntry)
			}

			userEntry.picks.push({
				playerId: pick.player_id,
				playerName: pick.players.name,
			})
		}

		return new Response(JSON.stringify(grouped), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (e: any) {
		console.error('Unexpected error in handler:', e)
		const errorMessage = e instanceof Error ? e.message : 'Unknown error'
		return new Response(
			JSON.stringify({ error: 'Unexpected error', details: errorMessage }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
}
