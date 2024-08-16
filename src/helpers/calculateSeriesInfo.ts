import { User, PlayerGameStats, GameSum } from "../types";

export const calculateSeriesInfo = (
  users: User[],
  allPlayersStats: Record<string, PlayerGameStats>,
  sums: Record<number, GameSum>,
  sheetName: string,
  globalGameNumber: { count: number } // Объект для хранения глобального счетчика
) => {
  users.forEach((user) => {
    if (!allPlayersStats[user.name]) {
      allPlayersStats[user.name] = {
        games: [],
        totalJudgePoints: 0,
        totalBestMoves: 0,
        maxWinStreak: 0,
        maxLoseStreak: 0,
        maxCitizenWins: 0,
        maxMafiaWins: 0,
        gameTotals: {},
        gamePositionTotals: [0, 0, 0, 0, 0],
        winSeries: [], // Хранить серии побед
        loseSeries: [], // Хранить серии поражений
      };
    }

    const playerStats = allPlayersStats[user.name];
    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let citizenWins = 0;
    let mafiaWins = 0;
    let gameNumberInSeries = 1; // Номер игры в серии

    ["game1", "game2", "game3", "game4", "game5"].forEach(
      (gameKey, gameIndex) => {
        const game = user[gameKey as keyof User];
        const isWin = game.winPoint > 0;

        playerStats.games.push({
          series: sheetName,
          gameNumberInSeries: gameNumberInSeries++, // Номер игры в серии
          gameNumber: globalGameNumber.count++, // Номер игры в общем списке
          role: game.role,
          winPoint: game.winPoint,
          judgePoint: game.judgePoint,
          isFirstKilled: game.isFirstKilled,
          bestMove: game.bestMove,
          Ci: game.Ci,
          totalPoint: game.totalPoint,
        });

        playerStats.totalJudgePoints += game.judgePoint;
        playerStats.totalBestMoves += game.bestMove;
        playerStats.gamePositionTotals[gameIndex] += game.totalPoint;

        if (isWin) {
          currentWinStreak++;
          currentLoseStreak = 0;
          if (game.role === "Мирный" || game.role === "Шериф") {
            citizenWins++;
          } else {
            mafiaWins++;
          }
        } else {
          currentLoseStreak++;
          currentWinStreak = 0;
        }

        if (currentWinStreak > playerStats.maxWinStreak) {
          playerStats.maxWinStreak = currentWinStreak;
          playerStats.winSeries = [{ games: [globalGameNumber.count - 1] }];
        } else if (currentWinStreak === playerStats.maxWinStreak) {
          const lastWinSeries = playerStats.winSeries[0];
          if (lastWinSeries) {
            lastWinSeries.games.push(globalGameNumber.count - 1);
          } else {
            playerStats.winSeries.push({ games: [globalGameNumber.count - 1] });
          }
        }

        if (currentLoseStreak > playerStats.maxLoseStreak) {
          playerStats.maxLoseStreak = currentLoseStreak;
          playerStats.loseSeries = [{ games: [globalGameNumber.count - 1] }];
        } else if (currentLoseStreak === playerStats.maxLoseStreak) {
          const lastLoseSeries = playerStats.loseSeries[0];
          if (lastLoseSeries) {
            lastLoseSeries.games.push(globalGameNumber.count - 1);
          } else {
            playerStats.loseSeries.push({
              games: [globalGameNumber.count - 1],
            });
          }
        }

        playerStats.maxCitizenWins = Math.max(
          playerStats.maxCitizenWins,
          citizenWins
        );
        playerStats.maxMafiaWins = Math.max(
          playerStats.maxMafiaWins,
          mafiaWins
        );

        playerStats.gameTotals[gameKey] =
          (playerStats.gameTotals[gameKey] || 0) + game.totalPoint;

        if (!sums[gameIndex + 1]) {
          sums[gameIndex + 1] = {
            totalWinPoints: 0,
            totalJudgePoints: 0,
            totalBestMoves: 0,
            totalCi: 0,
            totalPoints: 0,
            citizenWins: 0,
          };
        }

        if ((game.role === "Мирный" || game.role === "Шериф") && isWin) {
          sums[gameIndex + 1].citizenWins += 1;
        }

        sums[gameIndex + 1].totalWinPoints += game.winPoint;
        sums[gameIndex + 1].totalJudgePoints += game.judgePoint;
        sums[gameIndex + 1].totalBestMoves += game.bestMove;
        sums[gameIndex + 1].totalCi += game.Ci;
        sums[gameIndex + 1].totalPoints += game.totalPoint;
      }
    );

    playerStats.maxWinStreak = Math.max(
      playerStats.maxWinStreak,
      currentWinStreak
    );
    playerStats.maxLoseStreak = Math.max(
      playerStats.maxLoseStreak,
      currentLoseStreak
    );

    if (currentWinStreak === playerStats.maxWinStreak) {
      playerStats.winSeries.push({ games: [globalGameNumber.count - 1] });
    }
    if (currentLoseStreak === playerStats.maxLoseStreak) {
      playerStats.loseSeries.push({ games: [globalGameNumber.count - 1] });
    }
  });
};
