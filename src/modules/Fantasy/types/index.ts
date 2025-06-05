export interface QualData {
	title: string
	date: string
	players: string[]
}

export interface SelectedPlayers {
	[qualificationIndex: number]: number[]
}
export interface Toast {
	open: boolean
	message: string
	severity: 'success' | 'error'
}

export interface PlayerData {
	id: number
	name: string
}

export interface PickData {
	id: number
	fantasy_user_id: number
	qualification_index: number
	player_id: number
}

export interface FantasyUser {
	id: number
	name: string
}

export interface PickDataWithUser extends PickData {
	fantasy_users: FantasyUser
}
