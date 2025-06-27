export interface MatchResult {
	winners: number[]
	losers: number[]
	places: Record<number, number[]> // место -> список ID игроков
}

export function getActivePlayerIds(
	results: Record<string, MatchResult>
): Set<number> {
	const active = new Set<number>()

	for (const result of Object.values(results)) {
		result.winners.forEach(id => active.add(id))
		for (const ids of Object.values(result.places)) {
			ids.forEach(id => active.add(id))
		}
	}

	return active
}
