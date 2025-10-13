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

	// Preflight CORS
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
		const { name, secret } = body

		if (!name || !secret || name.length < 2 || secret.length <= 5) {
			return new Response(JSON.stringify({ error: 'Invalid name or secret' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// Проверяем, есть ли пользователь с таким именем
		const { data: existingUserByName, error: fetchError } = await supabase
			.from('fantasy_users')
			.select('id, secret, name')
			.eq('name', name)
			.single()

		if (existingUserByName) {
			if (existingUserByName.secret === secret) {
				// Секрет совпадает — возвращаем пользователя
				return new Response(
					JSON.stringify({
						message: 'Пользователь найден',
						user: existingUserByName,
					}),
					{
						status: 200,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			} else {
				// Секрет не совпадает — ошибка
				return new Response(
					JSON.stringify({
						error: 'Пользователь уже существует, неверный секрет',
					}),
					{
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			}
		}

		// Если пользователя с таким именем нет — создаём нового
		const { data, error } = await supabase
			.from('fantasy_users')
			.insert([{ name, secret }])
			.select('id, name')
			.single()

		if (error) {
			console.error('Insert error:', error)
			return new Response(JSON.stringify({ error: error.message }), {
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
