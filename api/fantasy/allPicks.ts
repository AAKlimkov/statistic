import { createClient } from '@supabase/supabase-js'
import { PickDataWithUser } from '../../src/modules/Fantasy/types'

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

	if (req.method !== 'GET') {
		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}

	const supabase = createClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_ANON_KEY!
	)

	try {
		const { data: picks, error } = (await supabase.from('fantasy_picks')
			.select(`
			id,
			fantasy_user_id,
			qualification_index,
			player_id,
			fantasy_users ( id, name )
		`)) as { data: PickDataWithUser[] | null; error: any }

		if (error) {
			console.error('Fetch error:', error)
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// Группируем по квалификациям
		const grouped: Record<string, any[]> = {}

		for (const pick of picks || []) {
			const kval = pick.qualification_index.toString()
			const userId = pick.fantasy_users.id
			const userName = pick.fantasy_users.name

			if (!grouped[kval]) grouped[kval] = []

			let user = grouped[kval].find(u => u.userId === userId)

			if (!user) {
				user = { userId, name: userName, picks: [] }
				grouped[kval].push(user)
			}

			user.picks.push({ playerId: pick.player_id })
		}

		return new Response(JSON.stringify(grouped), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (e: any) {
		return new Response(
			JSON.stringify({ error: 'Unexpected error', details: e.message }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
}
