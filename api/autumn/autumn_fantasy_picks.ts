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

		if (!Array.isArray(body) || body.length === 0) {
			return new Response(
				JSON.stringify({ error: 'Expected non-empty array' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		// ✅ Валидация структуры
		for (const item of body) {
			if (
				typeof item.fantasy_user_id !== 'number' ||
				typeof item.qualification_index !== 'number' ||
				typeof item.player_id !== 'number'
			) {
				return new Response(JSON.stringify({ error: 'Invalid pick data' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
			if (
				item.place !== undefined &&
				item.place !== null &&
				typeof item.place !== 'number'
			) {
				return new Response(JSON.stringify({ error: 'Invalid place value' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
		}

		// ✅ Валидация правил — максимум 5 победителей без place + 2 с place=6 на квалификацию
		const grouped: Record<string, { winners: number; fives: number }> = {}

		for (const item of body) {
			const key = `${item.fantasy_user_id}-${item.qualification_index}`
			if (!grouped[key]) grouped[key] = { winners: 0, fives: 0 }

			if (item.place === 5) grouped[key].fives++
			else grouped[key].winners++
		}

		for (const [key, { winners, fives }] of Object.entries(grouped)) {
			if (winners > 4 || fives > 3) {
				return new Response(
					JSON.stringify({
						error: `Too many picks for ${key}: winners=${winners}, fives=${fives}`,
					}),
					{
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			}
		}

		// ✅ Вставка в таблицу с place
		const { data, error } = await supabase
			.from('autumn_fantasy_picks')
			.insert(
				body.map(item => ({
					fantasy_user_id: item.fantasy_user_id,
					qualification_index: item.qualification_index,
					player_id: item.player_id,
					place: item.place ?? null,
					stage_name: item.stage_name ?? null,
				}))
			)
			.select('id, fantasy_user_id, qualification_index, player_id, place')

		if (error) {
			console.error('Insert error:', error)
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
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
