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

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Supabase URL or Anon Key is missing. Please check your environment variables.'
	)
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Константы для пагинации (если понадобится масштабировать выборку)
const PAGE_SIZE = 1000
const MAX_PAGES = 100

export default async function handler(req: Request) {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*', // В продакшене лучше сузить до конкретных доменов
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
		let allPicks: Pick[] = []
		let currentPage = 0
		let hasMoreData = true

		while (hasMoreData && currentPage < MAX_PAGES) {
			const rangeFrom = currentPage * PAGE_SIZE
			const rangeTo = rangeFrom + PAGE_SIZE - 1

			const { data: picksPage, error: fetchError } = await supabase
				.from<'fantasy_picks_stage2', Pick>('fantasy_picks_stage2')
				.select(
					'id, fantasy_user_id, match_id, player_id, pick_type, place_value'
				)
				.order('id')
				.range(rangeFrom, rangeTo)

			if (fetchError) {
				console.error(
					`Supabase fetch error on page ${currentPage + 1}:`,
					fetchError
				)
				return new Response(
					JSON.stringify({
						error: 'Failed to fetch picks',
						details: fetchError.message,
					}),
					{
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			}

			if (picksPage && picksPage.length > 0) {
				allPicks = allPicks.concat(picksPage)
			}

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

		return new Response(JSON.stringify(allPicks), {
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
