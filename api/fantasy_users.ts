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
		const { name, secret } = body

		if (!name || !secret || name.length < 2 || secret.length <= 5) {
			return new Response(JSON.stringify({ error: 'Invalid name or secret' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// Проверка на уникальность по name + secret
		const { data: existingUser, error: fetchError } = await supabase
			.from('fantasy_users')
			.select('id')
			.eq('name', name)
			.eq('secret', secret)
			.single()

		if (existingUser) {
			return new Response(
				JSON.stringify({
					error: 'Пользователь с таким именем и кодовым словом уже существует',
				}),
				{
					status: 409,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		// Игнорируем ошибку «не найдено», это OK
		if (fetchError && fetchError.code !== 'PGRST116') {
			console.error('Fetch error:', fetchError)
			return new Response(JSON.stringify({ error: fetchError.message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// Вставка нового пользователя
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
