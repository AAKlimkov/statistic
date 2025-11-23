import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Supabase URL or Anon Key is missing.')
}

const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)

export const config = { runtime: 'edge' }

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
		const url = new URL(req.url)
		const fantasyUserId = url.pathname.split('/').pop()
		if (!fantasyUserId) throw new Error('User ID is missing')

		// Запрос с join на таблицу fantasy_users для имени и players_autumn
		const { data: picks, error } = await supabase
			.from('autumn_fantasy_picks')
			.select(
				`
				id,
				fantasy_user_id,
				stage_name,
				player_id,
				place,
				players_autumn(id, name),
				fantasy_users(id, name)
			`
			)
			.eq('fantasy_user_id', Number(fantasyUserId))
			.order('id')

		if (error) throw error
		if (!picks || picks.length === 0)
			return new Response(JSON.stringify({}), {
				status: 200,
				headers: corsHeaders,
			})

		// Группировка по stage_name
		const grouped: Record<
			string,
			{
				userId: number
				name: string
				picks: { playerId: number; playerName: string; place?: number | null }[]
			}[]
		> = {}

		picks.forEach(pick => {
			const stage = pick.stage_name || `Stage ${pick.fantasy_user_id}`
			const userId = pick.fantasy_user_id
			const userName = pick.fantasy_users?.name || `Игрок ${userId}`

			if (!grouped[stage]) grouped[stage] = []

			let userEntry = grouped[stage].find(u => u.userId === userId)
			if (!userEntry) {
				userEntry = { userId, name: userName, picks: [] }
				grouped[stage].push(userEntry)
			}

			userEntry.picks.push({
				playerId: pick.player_id,
				playerName: pick.players_autumn.name,
				place: pick.place ?? null, // добавляем place
			})
		})

		return new Response(
			JSON.stringify({
				userId: Number(fantasyUserId),
				name: picks[0].fantasy_users?.name,
				picksByStage: grouped,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	} catch (e: any) {
		console.error('Error fetching picks:', e)
		return new Response(JSON.stringify({ error: e.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}
}
