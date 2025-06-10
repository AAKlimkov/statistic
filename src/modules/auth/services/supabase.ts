import { supabase } from '@/lib/supabaseClient'

export const resetPasswordForEmail = async (email: string) => {
	try {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		})

		return { error }
	} catch (error: any) {
		return { error }
	}
}
