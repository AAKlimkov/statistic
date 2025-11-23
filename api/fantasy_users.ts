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

	// --- Preflight CORS ---
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

	if (!supabaseUrl || !supabaseAnonKey) {
		return new Response(JSON.stringify({ error: 'Supabase env missing' }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}

	const supabase = createClient(supabaseUrl, supabaseAnonKey)

	try {
		const body = await req.json()
		const { name, secret } = body

		// --- Validation ---
		if (!name || !secret || name.length < 2 || secret.length <= 5) {
			return new Response(JSON.stringify({ error: 'Invalid name or secret' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// --- Check for existing user by name ---
		const { data: existingByName, error: fetchError } = await supabase
			.from('fantasy_users')
			.select('id, name, secret')
			.eq('name', name)
			.limit(1)

		if (fetchError) {
			console.error('Fetch error:', fetchError)
			return new Response(JSON.stringify({ error: fetchError.message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		if (existingByName && existingByName.length > 0) {
			const user = existingByName[0]

			if (user.secret === secret) {
				// ✅ Пользователь уже существует с таким паролем
				return new Response(
					JSON.stringify({
						message: 'Пользователь уже существует',
						user: { id: user.id, name: user.name },
					}),
					{
						status: 200,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			} else {
				// 🚫 Имя уже занято другим пользователем
				return new Response(
					JSON.stringify({ error: 'Имя уже занято другим пользователем' }),
					{
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			}
		}

		// --- Create new user ---
		const { data: newUser, error: insertError } = await supabase
			.from('fantasy_users')
			.insert([{ name, secret }])
			.select('id, name')
			.single()

		if (insertError) {
			console.error('Insert error:', insertError)
			return new Response(JSON.stringify({ error: insertError.message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		return new Response(JSON.stringify(newUser), {
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
