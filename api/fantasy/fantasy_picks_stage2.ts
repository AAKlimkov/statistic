import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface Pick {
	id: number
	fantasy_user_id: number
	match_id: string
	player_id: number
	pick_type: string
	place_value: number | null
}

export const config = {
	runtime: 'edge',
}

export default async function handler(req: Request) {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers':
			'authorization, x-client-info, apikey, content-type',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	}

	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders, status: 204 })
	}

	if (req.method !== 'GET') {
		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}

	const url = new URL(req.url)
	const userId = url.searchParams.get('user_id')

	if (!userId) {
		return new Response(
			JSON.stringify({ error: 'Missing fantasy_user_id in query params' }),
			{
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}

	const supabaseUrl = process.env.SUPABASE_URL
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		console.error('Supabase URL or Anon Key is not defined.')
		return new Response(
			JSON.stringify({ error: 'Server configuration error.' }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}

	try {
		const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

		const { data, error } = await supabase
			.from('fantasy_picks_stage2')
			.select(
				'id, fantasy_user_id, match_id, player_id, pick_type, place_value'
			)
			.eq('fantasy_user_id', Number(userId))

		if (error) {
			console.error('Supabase error:', error)
			return new Response(
				JSON.stringify({
					error: 'Failed to fetch picks',
					details: error.message,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		return new Response(JSON.stringify(data || []), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (e: any) {
		console.error('Unexpected error:', e)
		return new Response(
			JSON.stringify({
				error: 'An unexpected error occurred',
				details: e.message,
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
}
