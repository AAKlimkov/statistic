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

		// 🧩 Уникальные комбинации (user + qualification)
		const uniqueCombos = Array.from(
			new Set(body.map(i => `${i.fantasy_user_id}-${i.qualification_index}`))
		).map(c => {
			const [fantasy_user_id, qualification_index] = c.split('-').map(Number)
			return { fantasy_user_id, qualification_index }
		})

		// 🧹 1️⃣ Удаляем все старые записи для этих комбинаций
		for (const combo of uniqueCombos) {
			const { error: deleteError } = await supabase
				.from('autumn_fantasy_picks')
				.delete()
				.eq('fantasy_user_id', combo.fantasy_user_id)
				.eq('qualification_index', combo.qualification_index)

			if (deleteError) {
				console.error('Delete error:', deleteError)
				return new Response(JSON.stringify({ error: deleteError.message }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
		}

		// 🧩 2️⃣ Вставляем новые записи
		const { data, error: insertError } = await supabase
			.from('autumn_fantasy_picks')
			.insert(
				body.map(item => ({
					fantasy_user_id: item.fantasy_user_id,
					qualification_index: item.qualification_index,
					player_id: item.player_id,
					place: item.place ?? null,
					stage_name: item.stage_name ?? null,
				}))
			)
			.select('id, fantasy_user_id, qualification_index, player_id, place')

		if (insertError) {
			console.error('Insert error:', insertError)
			return new Response(JSON.stringify({ error: insertError.message }), {
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
