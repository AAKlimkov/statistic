export interface User {
  name: string;
  game1: Game;
  game2: Game;
  game3: Game;
  game4: Game;
  game5: Game;
}

export interface Game {
  role: string;
  winPoint: number;
  judgePoint: number;
  isFirstKilled: boolean;
  bestMove: number;
  Ci: number;
  totalPoint: number;
}

export interface GameStats {
  series: string;
  gameNumberInSeries: number;
  gameNumber: number;
  role: string;
  winPoint: number;
  judgePoint: number;
  isFirstKilled: boolean;
  bestMove: number;
  Ci: number;
  totalPoint: number;
}

export interface PlayerGameStats {
  name: string;
  games: GameStats[];
  totalJudgePoints: number;
  totalBestMoves: number;
  maxWinStreak: number;
  maxLoseStreak: number;
  maxCitizenWins: number;
  citizenWinsSeries: number[];
  mafiaWinsSeries: number[];
  maxMafiaWins: number;
  gameTotals: Record<string, number>;
  gamePositionTotals: number[];
  winSeries: string[];
  loseSeries: string[];
}

export interface GameSum {
  totalWinPoints: number;
  totalJudgePoints: number;
  totalBestMoves: number;
  totalCi: number;
  totalPoints: number;
  citizenWins: number;
}

export interface Streak {
  count: number;
  series: string[];
}

export interface PlayerGameStats1 {
  games: GameStats[];
  totalJudgePoints: number;
  totalBestMoves: number;
  maxWinStreak: Streak[];
  maxLoseStreak: Streak[];
  maxCitizenWins: number;
  maxMafiaWins: number;
  gameTotals: Record<string, number>;
  gamePositionTotals: number[];
}
