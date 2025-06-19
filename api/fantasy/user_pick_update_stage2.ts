import { createClient } from '@supabase/supabase-js'

export const config = {
	runtime: 'edge',
}

export default async function handler(req: Request) {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers':
			'authorization, x-client-info, apikey, content-type, accept',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		Vary: 'Origin',
	}

	if (req.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: corsHeaders })
	}

	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}

	const supabaseUrl = process.env.SUPABASE_URL
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
	const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

	try {
		const body = await req.json()

		const { username, secret, picks } = body

		// Проверка тела запроса
		if (
			typeof username !== 'string' ||
			typeof secret !== 'string' ||
			!Array.isArray(picks) ||
			picks.length === 0
		) {
			return new Response(
				JSON.stringify({
					error:
						'Expected object with username (string), secret (string) and non-empty picks array',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		// Проверяем пользователя по имени и секрету
		const { data: user, error: userError } = await supabase
			.from('fantasy_users')
			.select('id')
			.eq('name', username)
			.eq('secret', secret)
			.single()

		if (userError || !user) {
			return new Response(
				JSON.stringify({ error: 'Invalid username or secret' }),
				{
					status: 403,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		const fantasy_user_id = user.id

		// Валидация picks и нормализация fantasy_user_id
		for (const pick of picks) {
			if (
				typeof pick.match_id !== 'string' ||
				typeof pick.player_id !== 'number' ||
				!['winner', 'loser', 'place'].includes(pick.pick_type) ||
				(pick.place_value !== null && typeof pick.place_value !== 'number')
			) {
				return new Response(JSON.stringify({ error: 'Invalid pick data' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
		}

		const normalizedPicks = picks.map(pick => ({
			fantasy_user_id,
			match_id: pick.match_id,
			player_id: pick.player_id,
			pick_type: pick.pick_type,
			place_value: pick.place_value ?? null,
		}))

		// Upsert picks
		const { data, error } = await supabase
			.from('fantasy_picks_stage2')
			.upsert(normalizedPicks, {
				onConflict: 'fantasy_user_id,match_id,player_id',
			})
			.select(
				'id, fantasy_user_id, match_id, player_id, pick_type, place_value'
			)

		if (error) {
			console.error('Upsert error:', error)
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// Удаляем picks, которые отсутствуют в новом списке для этого пользователя и матча
		// Сначала соберем все (match_id, player_id) из normalizedPicks
		const keysForKeep = normalizedPicks.map(
			p => `('${p.match_id}', ${p.player_id})`
		)

		// Для упрощения, удалим все picks для пользователя по match_id, которые не в picks по player_id
		// Если есть много матчей — нужно расширить логику

		// Получим уникальные match_id из normalizedPicks
		const uniqueMatchIds = [...new Set(normalizedPicks.map(p => p.match_id))]

		// Удаляем все записи для этого пользователя и для match_id из списка,
		// у которых player_id не в списке
		for (const match_id of uniqueMatchIds) {
			const playerIdsInMatch = normalizedPicks
				.filter(p => p.match_id === match_id)
				.map(p => p.player_id)

			const { error: delError } = await supabase
				.from('fantasy_picks_stage2')
				.delete()
				.eq('fantasy_user_id', fantasy_user_id)
				.eq('match_id', match_id)
				.not('player_id', 'in', `(${playerIdsInMatch.join(',')})`)

			if (delError) {
				console.error('Delete error:', delError)
				return new Response(JSON.stringify({ error: delError.message }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
		}

		return new Response(JSON.stringify(data), {
			status: 201,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (e: any) {
		console.error('Unexpected error:', e)
		return new Response(
			JSON.stringify({ error: 'Unexpected error', details: e.message }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
}
