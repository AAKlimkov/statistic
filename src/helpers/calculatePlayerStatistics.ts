/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlayerGameStats } from "../types";

export const calculatePlayerStatistics = (
  playersStats: PlayerGameStats[]
): PlayerGameStats[] => {
  return playersStats.map((player) => {
    let totalJudgePoints = 0;
    let totalBestMoves = 0;
    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let maxWinStreak = 0;
    let maxLoseStreak = 0;
    const maxCitizenWins = 0;
    const maxMafiaWins = 0;
    let currentCitizenWins = 0;
    let currentMafiaWins = 0;
    let winSeries: number[] = [];
    let loseSeries: number[] = [];
    let currentWinSeries: number[] = [];
    let currentLoseSeries: number[] = [];

    // Maps to keep track of cumulative points and positions
    const gameTotals: Record<string, number> = {};
    const gamePositionTotals: number[] = new Array(5).fill(0);

    player.games.forEach((game) => {
      const isWin = game.winPoint > 0;
      const isCitizen = game.role === "Мирный" || game.role === "Шериф";
      const gameNumber = game.gameNumber;

      // Update total points and positions
      totalJudgePoints += game.judgePoint;
      totalBestMoves += game.bestMove;
      gamePositionTotals[gameNumber - 1] += game.totalPoint;

      if (isWin) {
        currentWinStreak += 1;
        currentLoseStreak = 0;
        currentWinSeries.push(gameNumber);
        currentCitizenWins += isCitizen ? 1 : 0;
        currentMafiaWins += !isCitizen ? 1 : 0;
      } else {
        currentLoseStreak += 1;
        currentWinStreak = 0;
        currentLoseSeries.push(gameNumber);
      }

      // Update max streaks
      if (currentWinStreak > maxWinStreak) {
        maxWinStreak = currentWinStreak;
        winSeries = [...currentWinSeries];
      } else if (currentWinStreak === maxWinStreak) {
        winSeries.push(...currentWinSeries);
      }

      if (currentLoseStreak > maxLoseStreak) {
        maxLoseStreak = currentLoseStreak;
        loseSeries = [...currentLoseSeries];
      } else if (currentLoseStreak === maxLoseStreak) {
        loseSeries.push(...currentLoseSeries);
      }

      // Reset streaks
      if (!isWin) currentWinSeries = [];
      if (isWin) currentLoseSeries = [];
    });

    return {
      ...player,
      totalJudgePoints,
      totalBestMoves,
      maxWinStreak,
      maxLoseStreak,
      maxCitizenWins,
      maxMafiaWins,
      gameTotals,
      gamePositionTotals,
      winSeries,
      loseSeries,
    };
  });
};
