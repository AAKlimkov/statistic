// src/data/summerLeagueData.ts

export interface Player {
	id: number
	name: string
	isPlaceholder?: boolean
}
export interface MatchSource {
	id: string
	type: 'winner' | 'lowBracket' | 'lowBracket'
}
export interface Match {
	id: string
	title: string
	date: string
	players: Player[]
	selectionLimit: number
	sourceMatchIds?: MatchSource[]
}
export interface Stage {
	name: string
	matches: Match[]
}
export interface BracketData {
	upperBracket: { left: Stage[]; right: Stage[] }
	lowerBracket: { left: Stage[]; right: Stage[] }
	finalStage: Stage
}

let pId = 1
const createPlayer = (name: string): Player => ({ id: pId++, name })
const createPlaceholder = (name: string): Player => ({
	id: pId++,
	name,
	isPlaceholder: true,
})

export const bracketData: BracketData = {
	upperBracket: {
		left: [
			{
				name: '1/8 Финала',
				matches: [
					{
						id: 'U-1/8-1',
						title: '1/8 #1',
						date: '26 июн',
						selectionLimit: 5,
						players: [
							createPlayer('Писатель'),
							createPlayer('А1'),
							createPlayer('Бастурма'),
							createPlayer('Аш'),
							createPlayer('Мишель'),
							createPlayer('1вКвал#4'),
							createPlayer('4вКвал#2'),
							createPlayer('3вКвал#3'),
							createPlayer('3вКвал#1'),
							createPlayer('Лекса'),
						],
					},
					{
						id: 'U-1/8-2',
						title: '1/8 #2',
						date: '27 июн',
						selectionLimit: 5,
						players: [
							createPlayer('Красавчик'),
							createPlayer('Боня'),
							createPlayer('Rocket woman'),
							createPlayer('Хрум'),
							createPlayer('Путедьют'),
							createPlayer('3вКвал#4'),
							createPlayer('1вКвал#2'),
							createPlayer('2вКвал#3'),
							createPlayer('4вКвал#1'),
							createPlayer('Мишок'),
						],
					},
				],
			},
			{
				name: '1/4 Финала',
				matches: [
					{
						id: 'U-1/4-1',
						title: '1/4 #1',
						date: '17 июл',
						selectionLimit: 4,
						sourceMatchIds: [{ id: 'U-1/8-1', type: 'winner' }],
						players: [
							createPlayer('Coach'),
							createPlayer('Продюсер'),
							createPlayer('Свич'),
							createPlayer('Луна'),
							createPlayer('Alice'),
							createPlaceholder('Победитель из 1/8 #1'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
						],
					},
					{
						id: 'U-1/4-2',
						title: '1/4 #2',
						date: '18 июл',
						selectionLimit: 4,
						sourceMatchIds: [{ id: 'U-1/8-2', type: 'winner' }],
						players: [
							createPlayer('Наполеон'),
							createPlayer('Седой'),
							createPlayer('Чешир'),
							createPlayer('Дракарис'),
							createPlayer('Физик'),
							createPlaceholder('Победитель из 1/8 #2'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
						],
					},
				],
			},
			{
				name: '1/2 Финала',
				matches: [
					{
						id: 'U-1/2-1',
						title: '1/2 #1',
						date: '16 авг',
						selectionLimit: 5,
						sourceMatchIds: [
							{ id: 'U-1/4-1', type: 'winner' },
							{ id: 'U-1/4-2', type: 'winner' },
							{ id: 'L-1/2-B', type: 'winner' },
						],
						// Ожидаем: 4+4+1=9 победителей. +1 для соответствия картинке. Итого 10.
						players: Array.from({ length: 10 }, (_, i) =>
							createPlaceholder(`Финалист #${i + 1}`)
						),
					},
				],
			},
		],
		right: [
			{
				name: '1/8 Финала',
				matches: [
					{
						id: 'U-1/8-3',
						title: '1/8 #3',
						date: '28 июн',
						selectionLimit: 5,
						players: [
							createPlayer('Young'),
							createPlayer('Астория'),
							createPlayer('Cherry Pick'),
							createPlayer('Love'),
							createPlayer('Домовенок'),
							createPlayer('1вКвал#1'),
							createPlayer('3вКвал#2'),
							createPlayer('2вКвал#3'),
							createPlayer('2вКвал#4'),
							createPlayer('Инсайд'),
						],
					},
					{
						id: 'U-1/8-4',
						title: '1/8 #4',
						date: '29 июн',
						selectionLimit: 5,
						players: [
							createPlayer('Зеркало'),
							createPlayer('SOVEST'),
							createPlayer('Stacy'),
							createPlayer('Крот'),
							createPlayer('Андерсен'),
							createPlayer('1вКвал#3'),
							createPlayer('2вКвал#2'),
							createPlayer('2вКвал#1'),
							createPlayer('4вКвал#4'),
							createPlayer('Саранча'),
						],
					},
				],
			},
			{
				name: '1/4 Финала',
				matches: [
					{
						id: 'U-1/4-3',
						title: '1/4 #3',
						date: '19 июл',
						selectionLimit: 4,
						sourceMatchIds: [{ id: 'U-1/8-3', type: 'winner' }],
						players: [
							createPlayer('Зверюга'),
							createPlayer('Инсомнич'),
							createPlayer('Бестия'),
							createPlayer('Никнейм'),
							createPlayer('Шоу Бой'),
							createPlaceholder('Победитель из 1/8 #3'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
						],
					},
					{
						id: 'U-1/4-4',
						title: '1/4 #4',
						date: '20 июл',
						selectionLimit: 4,
						sourceMatchIds: [{ id: 'U-1/8-4', type: 'winner' }],
						players: [
							createPlayer('NLIP'),
							createPlayer('Артик'),
							createPlayer('Пила'),
							createPlayer('Юрия'),
							createPlayer('Morti'),
							createPlaceholder('Победитель из 1/8 #4'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
						],
					},
				],
			},
			{
				name: '1/2 Финала',
				matches: [
					{
						id: 'U-1/2-2',
						title: '1/2 #2',
						date: '17 авг',
						selectionLimit: 5,
						sourceMatchIds: [
							{ id: 'U-1/4-3', type: 'winner' },
							{ id: 'U-1/4-4', type: 'winner' },
							{ id: 'L-1/2-C', type: 'winner' },
						],
						// Ожидаем: 4+4+1=9 победителей. +1 для соответствия картинке. Итого 10.
						players: Array.from({ length: 10 }, (_, i) =>
							createPlaceholder(`Финалист #${i + 1}`)
						),
					},
				],
			},
		],
	},
	lowerBracket: {
		left: [
			{
				name: '1/2 B',
				matches: [
					{
						id: 'L-1/2-B',
						title: '1/2 B',
						date: '9 авг',
						selectionLimit: 1,
						sourceMatchIds: [
							{ id: 'U-1/8-1', type: 'lowBracket' },
							{ id: 'U-1/8-2', type: 'lowBracket' },
							{ id: 'U-1/4-1', type: 'lowBracket' },
							{ id: 'U-1/4-2', type: 'lowBracket' },
						],
						// Ожидаем: 5+5+6+6=22 проигравших. Но на картинке 10. Берем 10.
						players: Array.from({ length: 10 }, (_, i) =>
							createPlaceholder(`Участник #${i + 1}`)
						),
					},
				],
			},
		],
		right: [
			{
				name: '1/2 C',
				matches: [
					{
						id: 'L-1/2-C',
						title: '1/2 C',
						date: '10 авг',
						selectionLimit: 1,
						sourceMatchIds: [
							{ id: 'U-1/8-3', type: 'lowBracket' },
							{ id: 'U-1/8-4', type: 'lowBracket' },
							{ id: 'U-1/4-3', type: 'lowBracket' },
							{ id: 'U-1/4-4', type: 'lowBracket' },
						],
						// Ожидаем: 5+5+5+6=21 проигравших. Но на картинке 10. Берем 10.
						players: Array.from({ length: 10 }, (_, i) =>
							createPlaceholder(`Участник #${i + 1}`)
						),
					},
				],
			},
		],
	},
	finalStage: {
		name: 'Финал',
		matches: [
			{
				id: 'Final',
				title: 'Финал',
				date: '23-24 авг',
				selectionLimit: 1,
				sourceMatchIds: [
					{ id: 'U-1/2-1', type: 'winner' },
					{ id: 'U-1/2-2', type: 'winner' },
				],
				// Ожидаем: 5+5=10 победителей
				players: Array.from({ length: 10 }, (_, i) =>
					createPlaceholder(`Финалист #${i + 1}`)
				),
			},
		],
	},
}
