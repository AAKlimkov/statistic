// src/data/summerLeagueData.ts

export interface Player {
	id: number
	name: string
	isPlaceholder?: boolean
}
// ИЗМЕНЕНИЕ: Добавляем необязательное поле `takePlaces`
export interface MatchSource {
	id: string
	type: 'winner' | 'loser' | 'place'
	takePlaces?: number[]
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

const createPlayer = (id: number, name: string): Player => ({ id, name })
const createPlaceholder = (name: string): Player => ({
	id: Math.random() * -1000,
	name,
	isPlaceholder: true,
})

export const bracketData: BracketData = {
	upperBracket: {
		left: [
			{
				// 1/8
				name: '1/8 Финала',
				matches: [
					{
						id: 'U-1/8-1',
						title: '1/8 #1',
						date: '26 июн',
						selectionLimit: 5,
						players: [
							createPlayer(35, 'Писатель'),
							createPlayer(27, 'А1'),
							createPlayer(114, 'Бастурма'),
							createPlayer(131, 'Аш'),
							createPlayer(60, 'Мишель'),
							createPlayer(192, 'Марш'),
							createPlayer(105, 'Helga'),
							createPlayer(146, 'Суета'),
							createPlayer(193, 'Стрекоза'),
							createPlayer(259, 'Лекса'),
						],
					},
					{
						id: 'U-1/8-2',
						title: '1/8 #2',
						date: '27 июн',
						selectionLimit: 5,
						players: [
							createPlayer(15, 'Красавчик'),
							createPlayer(18, 'Боня'),
							createPlayer(85, 'Rocket woman'),
							createPlayer(29, 'Хрум'),
							createPlayer(153, 'Путедьют'),
							createPlayer(55, 'GALAY'),
							createPlayer(74, 'Манекен'),
							createPlayer(229, 'Keln'),
							createPlayer(51, 'Оладушек'),
							createPlayer(32, 'Мишок'),
						],
					},
				],
			},
			{
				// 1/4
				name: '1/4 Финала',
				matches: [
					{
						id: 'U-1/4-1',
						title: '1/4 #1',
						date: '17 июл',
						selectionLimit: 4,
						sourceMatchIds: [{ id: 'U-1/8-1', type: 'winner' }],
						players: [
							createPlayer(58, 'Coach'),
							createPlayer(79, 'Продюсер'),
							createPlayer(82, 'Свич'),
							createPlayer(158, 'Луна'),
							createPlayer(67, 'Alice'),
							createPlaceholder('...'),
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
							createPlayer(21, 'Наполеон'),
							createPlayer(178, 'Седой'),
							createPlayer(154, 'Чешир'),
							createPlayer(70, 'Дракарис'),
							createPlayer(46, 'Физик'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
						],
					},
				],
			},
			{
				// 1/2
				name: '1/2 Финала',
				matches: [
					{
						id: 'U-1/2-1',
						title: '1/2 #1 Верхняя сетка',
						date: '16 авг',
						selectionLimit: 5,
						players: Array.from({ length: 10 }, (_, i) =>
							createPlaceholder(`Полуфиналист #${i + 1}`)
						),
						// **ИЗМЕНЕНИЕ: Уточняем, кого именно брать**
						sourceMatchIds: [
							{ id: 'U-1/4-1', type: 'winner' }, // Все победители (4)
							{ id: 'U-1/4-2', type: 'winner' }, // Все победители (4)
							{ id: 'L-1/2-B', type: 'place', takePlaces: [1] }, // 1-е место из 1/2 B
							{ id: 'L-1/2-C', type: 'place', takePlaces: [2] }, // 2-е место из 1/2 C
						],
					},
				],
			},
		],
		right: [
			{
				// 1/8
				name: '1/8 Финала',
				matches: [
					{
						id: 'U-1/8-3',
						title: '1/8 #3',
						date: '28 июн',
						selectionLimit: 5,
						players: [
							createPlayer(68, 'Young'),
							createPlayer(132, 'Астория'),
							createPlayer(34, 'Cherry Pick'),
							createPlayer(225, 'Дэн'),
							createPlayer(141, 'Love'),
							createPlayer(109, 'Люпен'),
							createPlayer(90, 'Круэлла'),
							createPlayer(125, 'Авраам'),
							createPlayer(110, 'Америка'),
							createPlayer(72, 'Инсайд'),
						],
					},
					{
						id: 'U-1/8-4',
						title: '1/8 #4',
						date: '29 июн',
						selectionLimit: 5,
						players: [
							createPlayer(116, 'Зеркало'),
							createPlayer(54, 'SOVEST'),
							createPlayer(95, 'Stacy'),
							createPlayer(94, 'Крот'),
							createPlayer(47, 'Андерсен'),
							createPlayer(7, 'Baymax'),
							createPlayer(71, 'Light'),
							createPlayer(77, 'Jazz'),
							createPlayer(231, 'Google'),
							createPlayer(43, 'Саранча'),
						],
					},
				],
			},
			{
				// 1/4
				name: '1/4 Финала',
				matches: [
					{
						id: 'U-1/4-3',
						title: '1/4 #3',
						date: '19 июл',
						selectionLimit: 4,
						sourceMatchIds: [{ id: 'U-1/8-3', type: 'winner' }],
						players: [
							createPlayer(23, 'Зверюга'),
							createPlayer(122, 'Инсомнич'),
							createPlayer(44, 'Бестия'),
							createPlayer(83, 'Никнейм'),
							createPlayer(45, 'Шоу Бой'),
							createPlaceholder('...'),
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
							createPlayer(3, 'NLIP'),
							createPlayer(123, 'Артик'),
							createPlayer(8, 'Пила'),
							createPlayer(22, 'Юрия'),
							createPlayer(78, 'Morti'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
							createPlaceholder('...'),
						],
					},
				],
			},
			{
				// 1/2
				name: '1/2 Финала',
				matches: [
					{
						id: 'U-1/2-2',
						title: '1/2 #2 Верхняя сетка',
						date: '17 авг',
						selectionLimit: 5,
						players: Array.from({ length: 10 }, (_, i) =>
							createPlaceholder(`Полуфиналист #${i + 1}`)
						),
						sourceMatchIds: [
							{ id: 'U-1/4-3', type: 'winner' }, // Все победители (4)
							{ id: 'U-1/4-4', type: 'winner' }, // Все победители (4)
							{ id: 'L-1/2-C', type: 'place', takePlaces: [1] }, // 1-е место из 1/2 C
							{ id: 'L-1/2-B', type: 'place', takePlaces: [2] }, // 2-е место из 1/2 B
						],
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
						title: '1/2 B Нижняя сетка',
						date: '9 авг',
						selectionLimit: 2,
						sourceMatchIds: [
							{
								id: 'U-1/8-1',
								type: 'place',
								takePlaces: [6],
							},
							{ id: 'U-1/8-4', type: 'place', takePlaces: [6] },
							{ id: 'U-1/4-1', type: 'place', takePlaces: [6, 8] },
							{ id: 'U-1/4-2', type: 'place', takePlaces: [5, 7] },
							{ id: 'U-1/4-3', type: 'place', takePlaces: [5, 7] },
							{ id: 'U-1/4-4', type: 'place', takePlaces: [6, 8] },
						],
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
						title: '1/2 C 1/2 B Нижняя сетка',
						date: '10 авг',
						selectionLimit: 2,

						players: Array.from({ length: 10 }, (_, i) =>
							createPlaceholder(`Участник #${i + 1}`)
						),
						sourceMatchIds: [
							{ id: 'U-1/8-2', type: 'place', takePlaces: [6] },
							{ id: 'U-1/8-3', type: 'place', takePlaces: [6] },
							{ id: 'U-1/4-1', type: 'place', takePlaces: [5, 7] },
							{ id: 'U-1/4-2', type: 'place', takePlaces: [6, 8] },
							{ id: 'U-1/4-3', type: 'place', takePlaces: [5, 7] },
							{ id: 'U-1/4-4', type: 'place', takePlaces: [6, 8] },
						],
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
				selectionLimit: 3,
				players: Array.from({ length: 10 }, (_, i) =>
					createPlaceholder(`Финалист #${i + 1}`)
				),
				sourceMatchIds: [
					{ id: 'U-1/2-1', type: 'winner' },
					{ id: 'U-1/2-2', type: 'winner' },
				],
			},
		],
	},
}
