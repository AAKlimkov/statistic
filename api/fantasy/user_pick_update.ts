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
		}

		const { data, error } = await supabase
			.from('fantasy_picks')
			.upsert(body, {
				onConflict: 'fantasy_user_id,qualification_index,player_id',
			})
			.select('id, fantasy_user_id, qualification_index, player_id')

		if (error) {
			console.error('Upsert error:', error)
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
