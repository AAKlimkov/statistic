// calculateSeriesInfo.ts

import { User } from "./Series";

export interface CommonInfo {
  game1: GameInfo;
  game2: GameInfo;
  game3: GameInfo;
  game4: GameInfo;
  game5: GameInfo;
  totalJudgePoint: number;
  totalBestMove: number;
}

interface GameInfo {
  win: "citizen" | "mafia";
  judgePoint: number; // Сумма всех баллов судьи за игру
  isBestMove: boolean;
}

export const calculateSeriesInfo = (users: User[]): CommonInfo => {
  let totalJudgePoint = 0;
  let totalBestMove = 0;

  const calculateGameInfo = (gameKey: keyof User): GameInfo => {
    let judgePoint = 0;
    let win: "citizen" | "mafia" = "citizen";
    let isBestMove = false;

    users.forEach((user) => {
      const game = user[gameKey];
      const isCitizen = game.role === "Мирный" || game.role === "Шериф";

      // Определение победителя игры (citizen или mafia)
      if (!isCitizen) {
        win = "mafia";
      }

      // Суммирование баллов судьи
      judgePoint += game.judgePoint;

      // Проверка наличия лучшего движения
      if (game.bestMove > 0) {
        isBestMove = true;
        totalBestMove += game.bestMove;
      }
    });

    totalJudgePoint += judgePoint;

    return {
      win,
      judgePoint,
      isBestMove,
    };
  };

  return {
    game1: calculateGameInfo("game1"),
    game2: calculateGameInfo("game2"),
    game3: calculateGameInfo("game3"),
    game4: calculateGameInfo("game4"),
    game5: calculateGameInfo("game5"),
    totalJudgePoint,
    totalBestMove,
  };
};
