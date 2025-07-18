import { MatchResult } from '../utils/getActivePlayerIds'

export const tournamentResults: Record<string, MatchResult> = {
	'U-1/8-1': {
		winners: [35, 131, 259, 193, 105],
		places: { 6: [146] },
		losers: [27, 114, 192, 60],
	},
	'U-1/8-2': {
		winners: [85, 153, 74, 229, 32],
		places: { 6: [51] },
		losers: [15, 18, 29, 55],
	},
	'U-1/8-3': {
		winners: [132, 34, 125, 110, 72],
		places: { 6: [225] },
		losers: [68, 90, 63, 109],
	},
	'U-1/8-4': {
		winners: [116, 47, 7, 71, 77],
		places: { 6: [43] },
		losers: [54, 94, 95, 231],
	},
	'U-1/4-1': {
		winners: [58, 158, 259, 35],
		places: { 5: [131], 6: [193], 7: [82], 8: [67] },
		losers: [79, 105],
	},
}
