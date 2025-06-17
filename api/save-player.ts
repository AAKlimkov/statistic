// import { createClient } from '@supabase/supabase-js'

// interface Player {
// 	name: string
// }

// export const config = {
// 	runtime: 'edge',
// }

// export default async function handler(req: Request) {
// 	const corsHeaders = {
// 		'Access-Control-Allow-Origin': '*',
// 		'Access-Control-Allow-Headers':
// 			'authorization, x-client-info, apikey, content-type, accept',
// 		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
// 		Vary: 'Origin',
// 	}

// 	if (req.method === 'OPTIONS') {
// 		return new Response(null, {
// 			status: 204,
// 			headers: corsHeaders,
// 		})
// 	}

// 	if (req.method !== 'POST') {
// 		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
// 			status: 405,
// 			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 		})
// 	}

// 	const supabaseUrl = process.env.SUPABASE_URL
// 	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// 	if (!supabaseUrl || !supabaseAnonKey) {
// 		return new Response(JSON.stringify({ error: 'Server config error' }), {
// 			status: 500,
// 			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 		})
// 	}

// 	try {
// 		const body = await req.json()
// 		const { name } = body as Player

// 		if (!name || typeof name !== 'string') {
// 			return new Response(JSON.stringify({ error: 'Invalid player data' }), {
// 				status: 400,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			})
// 		}

// 		const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 		// Проверяем, есть ли игрок с таким именем
// 		const { data: existingPlayers, error: selectError } = await supabase
// 			.from('players')
// 			.select('id, name')
// 			.eq('name', name)
// 			.limit(1)

// 		if (selectError) {
// 			console.error('Select error:', selectError)
// 			return new Response(JSON.stringify({ error: selectError.message }), {
// 				status: 500,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			})
// 		}

// 		if (existingPlayers && existingPlayers.length > 0) {
// 			// Игрок уже есть — возвращаем его данные
// 			return new Response(JSON.stringify(existingPlayers[0]), {
// 				status: 200,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			})
// 		}

// 		// Вставляем нового игрока
// 		const { data, error } = await supabase
// 			.from('players')
// 			.insert([{ name }])
// 			.select('id, name')

// 		if (error) {
// 			console.error('Insert error:', error)
// 			return new Response(JSON.stringify({ error: error.message }), {
// 				status: 500,
// 				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
// 			})
// 		}

// 		return new Response(JSON.stringify(data![0]), {
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
