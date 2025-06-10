import {
	SignInWithPasswordCredentials,
	SignUpWithPasswordCredentials,
} from '@supabase/supabase-js'
import { createContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContextType, AuthProviderProps } from './auth.types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState(null)
	const [session, setSession] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		supabase.auth
			.getSession()
			.then(({ data }) => {
				setSession(data.session)
				setUser(data.session?.user ?? null)
			})
			.catch(err => {
				console.error('Failed to get session', err)
			})
			.finally(() => {
				setLoading(false)
			})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	const value = useMemo(
		() => ({
			user,
			session,
			signUp: (credentials: SignUpWithPasswordCredentials) =>
				supabase.auth.signUp(credentials),
			signIn: (credentials: SignInWithPasswordCredentials) =>
				supabase.auth.signInWithPassword(credentials),
			signOut: () => supabase.auth.signOut(),
			resetPasswordForEmail: (email: string) =>
				supabase.auth.resetPasswordForEmail(email),
		}),
		[user, session]
	)

	if (loading) return null

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
