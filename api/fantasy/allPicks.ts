import { createClient, SupabaseClient } from '@supabase/supabase-js'

import { PickDataWithUser } from '../../src/modules/Fantasy/types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Supabase URL or Anon Key is missing. Please check your environment variables.'
	)
}

const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)

export const config = {
	runtime: 'edge',
}

const PAGE_SIZE = 1000

const MAX_PAGES = 100

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

	try {
		let allPicks: PickDataWithUser[] = []
		let currentPage = 0
		let hasMoreData = true

		while (hasMoreData && currentPage < MAX_PAGES) {
			const rangeFrom = currentPage * PAGE_SIZE
			const rangeTo = rangeFrom + PAGE_SIZE - 1

			const { data: picksPage, error: fetchError } = (await supabase
				.from('fantasy_picks')
				.select(
					`
            id,
            fantasy_user_id,
            qualification_index,
            player_id,
            fantasy_users ( id, name ),
            players ( id, name )
          `
				)
				.order('id')
				.range(rangeFrom, rangeTo)) as {
				data: PickDataWithUser[] | null
				error: any
			}

			if (fetchError) {
				console.error(
					`Supabase fetch error on page ${currentPage + 1}:`,
					fetchError
				)
				return new Response(JSON.stringify({ error: fetchError.message }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}

			if (picksPage && picksPage.length > 0) {
				allPicks = allPicks.concat(picksPage)
			}

			if (!picksPage || picksPage.length < PAGE_SIZE) {
				hasMoreData = false // Это была последняя страница
			} else {
				currentPage++
			}
		}

		if (currentPage >= MAX_PAGES && hasMoreData) {
			console.warn(
				`Reached MAX_PAGES limit (${MAX_PAGES}). Data might be incomplete if there were more pages.`
			)
		}

		if (allPicks.length === 0) {
			return new Response(JSON.stringify({}), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const grouped: Record<string, any[]> = {}

		for (const pick of allPicks) {
			if (!pick.fantasy_users || !pick.players) {
				console.warn('Skipping pick due to missing related data:', pick.id)
				continue
			}

			const kval = pick.qualification_index.toString()
			const userId = pick.fantasy_users.id
			const userName = pick.fantasy_users.name

			if (!grouped[kval]) {
				grouped[kval] = []
			}

			let userEntry = grouped[kval].find(u => u.userId === userId)

			if (!userEntry) {
				userEntry = { userId, name: userName, picks: [] }
				grouped[kval].push(userEntry)
			}

			userEntry.picks.push({
				playerId: pick.player_id,
				playerName: pick.players.name,
			})
		}

		return new Response(JSON.stringify(grouped), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (e: any) {
		console.error('Unexpected error in handler:', e)
		const errorMessage = e instanceof Error ? e.message : 'Unknown error'
		return new Response(
			JSON.stringify({ error: 'Unexpected error', details: errorMessage }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
}
