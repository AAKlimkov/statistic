import {
	AuthResponse,
	Session,
	SignInWithPasswordCredentials,
	SignUpWithPasswordCredentials,
	User,
} from '@supabase/supabase-js'

export interface AuthContextType {
	user: User | null
	session: Session | null

	signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>

	signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>

	signOut: () => Promise<{ error: Error | null }>

	resetPasswordForEmail: (
		email: string
	) => Promise<{ data: {}; error: Error | null }>
}

export interface AuthProviderProps {
	children: React.ReactNode
}
