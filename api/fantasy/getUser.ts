import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface Player {
	id: number
	name: string
	secret?: string
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
	const id = url.searchParams.get('user_id')

	if (!id) {
		return new Response(
			JSON.stringify({ error: 'Missing user id in query params' }),
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
			.from('fantasy_users')
			.select('id, name')
			.eq('id', Number(id))
			.single()

		if (error) {
			console.error('Supabase error:', error)
			return new Response(
				JSON.stringify({
					error: 'Failed to fetch user',
					details: error.message,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		if (!data) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		return new Response(JSON.stringify(data), {
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
