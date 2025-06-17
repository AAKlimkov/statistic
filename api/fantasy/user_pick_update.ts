// import { createClient } from '@supabase/supabase-js'

// export const config = {
// 	runtime: 'edge',
// }

// export default async function handler(req: Request) {
// 	const corsHeaders = {
// 		'Access-Control-Allow-Origin': '*',
// 		'Access-Control-Allow-Headers':
// 			'authorization, x-client-info, apikey, content-type, accept',
// 		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
// 		Vary: 'Origin',
// 	}

// 	if (req.method === 'OPTIONS') {
// 		return new Response(null, { status: 204, headers: corsHeaders })
// 	}

// 	if (req.method !== 'POST') {
// 		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
// 			status: 405,
// 			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 		})
// 	}

// 	const supabaseUrl = process.env.SUPABASE_URL
// 	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
// 	const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// 	try {
// 		const body = await req.json()

// 		// Проверка тела
// 		if (
// 			typeof body !== 'object' ||
// 			typeof body.secret !== 'string' ||
// 			typeof body.fantasy_user_id !== 'number' ||
// 			!Array.isArray(body.picks) ||
// 			body.picks.length === 0
// 		) {
// 			return new Response(
// 				JSON.stringify({
// 					error:
// 						'Expected object with secret, fantasy_user_id and non-empty picks array',
// 				}),
// 				{
// 					status: 400,
// 					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 				}
// 			)
// 		}

// 		const { secret, fantasy_user_id, picks } = body

// 		// Проверяем secret
// 		const { data: user, error: userError } = await supabase
// 			.from('fantasy_users')
// 			.select('id')
// 			.eq('id', fantasy_user_id)
// 			.eq('secret', secret)
// 			.single()

// 		if (userError || !user) {
// 			return new Response(JSON.stringify({ error: 'Invalid secret word' }), {
// 				status: 403,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			})
// 		}

// 		// Валидация picks
// 		for (const item of picks) {
// 			if (
// 				typeof item.fantasy_user_id !== 'number' ||
// 				typeof item.qualification_index !== 'number' ||
// 				typeof item.player_id !== 'number'
// 			) {
// 				return new Response(JSON.stringify({ error: 'Invalid pick data' }), {
// 					status: 400,
// 					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 				})
// 			}
// 		}

// 		// Upsert picks
// 		const { data, error } = await supabase
// 			.from('fantasy_picks')
// 			.upsert(picks, {
// 				onConflict: 'fantasy_user_id,qualification_index,player_id',
// 			})
// 			.select('id, fantasy_user_id, qualification_index, player_id')

// 		if (error) {
// 			console.error('Upsert error:', error)
// 			return new Response(JSON.stringify({ error: error.message }), {
// 				status: 500,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			})
// 		}

// 		// Удаляем picks, которых нет в пришедшем списке
// 		const playerIds = picks.map(p => p.player_id)
// 		const { error: delError } = await supabase
// 			.from('fantasy_picks')
// 			.delete()
// 			.eq('fantasy_user_id', fantasy_user_id)
// 			.not('player_id', 'in', `(${playerIds.join(',')})`)

// 		if (delError) {
// 			console.error('Delete error:', delError)
// 			return new Response(JSON.stringify({ error: delError.message }), {
// 				status: 500,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			})
// 		}

// 		return new Response(JSON.stringify(data), {
// 			status: 201,
// 			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 		})
// 	} catch (e: any) {
// 		console.error('Unexpected error:', e)
// 		return new Response(
// 			JSON.stringify({ error: 'Unexpected error', details: e.message }),
// 			{
// 				status: 500,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			}
// 		)
// 	}
// }
