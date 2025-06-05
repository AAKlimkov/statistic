// api/get-players.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
// ... другие импорты для Request/Response Vercel Edge/Next.js ...

// Определяем тип для игрока для лучшей типизации
interface Player {
	id: number
	name: string
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

	const supabaseUrl = process.env.SUPABASE_URL
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		console.error(
			'Supabase URL or Anon Key is not defined in environment variables.'
		)
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
			.from('players')
			.select<'*', Player>('*')

		if (error) {
			console.error('Supabase error:', error)
			return new Response(
				JSON.stringify({
					error: 'Failed to fetch players',
					details: error.message,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		// data будет Player[] | null
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
