import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getAllPicks() {
  const { data, error } = await supabase
    .from('fantasy_picks')
    .select(`
      id,
      qualification_index,
      fantasy_user_id,
      fantasy_users ( id, name ),
      player_id,
      players ( id, name )
    `)
    .order('id', { ascending: true })

  if (error) {
    console.error('Ошибка запроса picks:', error)
    throw error
  }

  return data
}

// Использование:
getAllPicks()
  .then(picks => {
    console.log('Все пики:', picks)
  })
  .catch(err => {
    console.error(err)
  })
