import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ИНТЕРФЕЙС 1: Для чистого объекта Pick ВНУТРИ массива.
// В нем нет fantasy_user_name.
export interface CleanPick {
	id: number
	fantasy_user_id: number
	match_id: string
	player_id: number
	pick_type: string
	place_value: number | null
}

// ИНТЕРФЕЙС 2: Для данных, которые приходят из Supabase (с вложенным именем).
// Мы создаем его на основе CleanPick.
type PickFromQuery = CleanPick & {
	fantasy_users: { name: string } | null
}

// ИНТЕРФЕЙС 3: Для итогового сгруппированного результата.
interface GroupedResult {
	fantasy_user_id: number
	fantasy_user_name: string
	picks: CleanPick[] // Массив теперь содержит объекты типа CleanPick
}

export const config = {
	runtime: 'edge',
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Supabase URL или Anon Key отсутствуют. Проверьте переменные окружения.'
	)
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

const PAGE_SIZE = 1000
const MAX_PAGES = 100

export default async function handler(req: Request) {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers':
			'authorization, x-client-info, apikey, content-type, accept',
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
		// Используем новый тип для группировки
		const grouped: Record<string, GroupedResult> = {}
		let currentPage = 0
		let hasMoreData = true

		while (hasMoreData && currentPage < MAX_PAGES) {
			const rangeFrom = currentPage * PAGE_SIZE
			const rangeTo = rangeFrom + PAGE_SIZE - 1

			const { data: picksPage, error: fetchError } = await supabase
				.from('fantasy_picks_stage2')
				.select(
					`
          id, 
          fantasy_user_id, 
          match_id, 
          player_id, 
          pick_type, 
          place_value,
          fantasy_users!inner(name)
        `
				)
				.order('id')
				.range(rangeFrom, rangeTo)
				.returns<PickFromQuery[]>()

			if (fetchError) {
				console.error(`Supabase fetch error:`, fetchError)
				return new Response(
					JSON.stringify({
						error: 'Failed to fetch picks',
						details: fetchError.message,
					}),
					{
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			}

			if (!picksPage || picksPage.length === 0) {
				hasMoreData = false
				continue
			}

			for (const rawPick of picksPage) {
				const userName = rawPick.fantasy_users!.name
				const userId = rawPick.fantasy_user_id

				if (!grouped[userId]) {
					grouped[userId] = {
						fantasy_user_id: userId,
						fantasy_user_name: userName, // Имя пользователя добавляется только сюда
						picks: [],
					}
				}

				// *** ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ***
				// 1. Отделяем ненужный объект fantasy_users
				const { fantasy_users, ...cleanPickObject } = rawPick

				// 2. Добавляем в массив только "чистый" объект пика, без лишних полей.
				grouped[userId].picks.push(cleanPickObject)
			}

			if (picksPage.length < PAGE_SIZE) {
				hasMoreData = false
			} else {
				currentPage++
			}
		}

		if (currentPage >= MAX_PAGES && hasMoreData) {
			console.warn(
				`Достигнут лимит страниц (${MAX_PAGES}). Данные могут быть неполными.`
			)
		}

		const result = Object.values(grouped)

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (e: any) {
		console.error('Непредвиденная ошибка в обработчике:', e)
		return new Response(
			JSON.stringify({ error: 'Unexpected error', details: e.message }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
}
