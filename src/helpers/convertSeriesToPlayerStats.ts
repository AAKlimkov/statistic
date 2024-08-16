import { Game, GameStats, PlayerGameStats, User } from "../types";

export const convertSeriesToPlayerStats = (
  series: User[][]
): PlayerGameStats[] => {
  const playerStats: Record<string, PlayerGameStats> = {};

  series.forEach((serie: User[], serieIndex: number) => {
    serie.forEach((player: User) => {
      const playerName = player.name.trim();
      if (!playerStats[playerName]) {
        playerStats[playerName] = { name: playerName, games: [] };
      }

      for (let i = 1; i <= 5; i++) {
        const game: Game = player[`game${i}`];
        if (game) {
          const gameStats: GameStats = {
            series: `Серия ${serieIndex + 1}`,
            gameNumberInSeries: i,
            gameNumber: serieIndex * 5 + i,
            role: game.role || "",
            winPoint: game.winPoint || 0,
            judgePoint: game.judgePoint || 0,
            isFirstKilled: game.isFirstKilled || false,
            bestMove: game.bestMove || 0,
            Ci: game.Ci || 0,
            totalPoint: game.totalPoint || 0,
          };

          playerStats[playerName].games.push(gameStats);
        }
      }
    });
  });

  return Object.values(playerStats);
};
