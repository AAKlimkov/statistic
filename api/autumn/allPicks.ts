import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { PickDataWithUser } from '../../src/modules/Fantasy/types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Supabase URL or Anon Key is missing.')
}

const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)

export const config = { runtime: 'edge' }

const PAGE_SIZE = 1000
const MAX_PAGES = 100

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
		let allPicks: PickDataWithUser[] = []
		let currentPage = 0
		let hasMoreData = true

		while (hasMoreData && currentPage < MAX_PAGES) {
			const rangeFrom = currentPage * PAGE_SIZE
			const rangeTo = rangeFrom + PAGE_SIZE - 1

			const { data: picksPage, error: fetchError } = (await supabase
				.from('autumn_fantasy_picks')
				.select(
					`
          id,
          fantasy_user_id,
          stage_name,
          player_id,
          place,
          fantasy_users (id, name),
          players_autumn (id, name)
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

			if (picksPage && picksPage.length > 0)
				allPicks = allPicks.concat(picksPage)
			if (!picksPage || picksPage.length < PAGE_SIZE) {
				hasMoreData = false
			} else {
				currentPage++
			}
		}

		if (currentPage >= MAX_PAGES && hasMoreData) {
			console.warn(
				`Reached MAX_PAGES limit (${MAX_PAGES}). Data might be incomplete.`
			)
		}

		if (allPicks.length === 0) {
			return new Response(JSON.stringify([]), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// Группируем пики по пользователям и stage_name
		const usersMap: Record<
			number,
			{
				userId: number
				name: string
				picksByStage: Record<
					string,
					{ playerId: number; playerName: string; place: number | null }[]
				>
			}
		> = {}

		for (const pick of allPicks) {
			if (!pick.fantasy_users || !pick.players_autumn) continue

			const userId = pick.fantasy_users.id
			const userName = pick.fantasy_users.name
			const stage = pick.stage_name || `Stage ${pick.fantasy_user_id}`

			if (!usersMap[userId]) {
				usersMap[userId] = { userId, name: userName, picksByStage: {} }
			}

			if (!usersMap[userId].picksByStage[stage]) {
				usersMap[userId].picksByStage[stage] = []
			}

			usersMap[userId].picksByStage[stage].push({
				playerId: pick.player_id,
				playerName: pick.players_autumn.name,
				place: pick.place ?? null,
			})
		}

		const result = Object.values(usersMap)

		return new Response(JSON.stringify(result), {
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
