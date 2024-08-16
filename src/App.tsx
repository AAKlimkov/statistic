import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { parseData, User } from "./User";

interface PlayerGameStats {
  games: Game[];
  totalJudgePoints: number;
  totalBestMoves: number;
  maxWinStreak: number;
  maxLoseStreak: number;
  maxCitizenWins: number;
  maxMafiaWins: number;
  gameTotals: Record<string, number>;
  gamePositionTotals: number[]; // Сумма баллов за все первые игры, вторые игры и т.д.
}

interface Game {
  series: string;
  role: string;
  winPoint: number;
  judgePoint: number;
  isFirstKilled: boolean;
  bestMove: number;
  Ci: number;
  totalPoint: number;
}

interface GameSum {
  totalWinPoints: number;
  totalJudgePoints: number;
  totalBestMoves: number;
  totalCi: number;
  totalPoints: number;
  citizenWins: number; // Новое поле для подсчета побед мирных игроков
}

const App: React.FC = () => {
  const [playersStats, setPlayersStats] = useState<
    Record<string, PlayerGameStats>
  >({});
  const [gamesSum, setGamesSum] = useState<Record<number, GameSum>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workbook = XLSX.read(
          await fetch("table.xlsx").then((res) => res.arrayBuffer()),
          { type: "array" }
        );
        const sums: Record<number, GameSum> = {};
        const allPlayersStats: Record<string, PlayerGameStats> = {};

        for (let i = 1; i <= 48; i++) {
          const sheetName = `${i} серия`;
          const sheet = workbook.Sheets[sheetName];

          if (sheet) {
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const users = parseData(rawData);

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
                  gamePositionTotals: [0, 0, 0, 0, 0], // Инициализация с 5 нулями
                };
              }

              let currentWinStreak = 0;
              let currentLoseStreak = 0;
              let citizenWins = 0;
              let mafiaWins = 0;

              ["game1", "game2", "game3", "game4", "game5"].forEach(
                (gameKey, gameIndex) => {
                  const game = user[gameKey as keyof User];
                  const isWin = game.winPoint > 0;

                  // Добавляем игру к статистике игрока
                  allPlayersStats[user.name].games.push({
                    series: sheetName,
                    role: game.role,
                    winPoint: game.winPoint,
                    judgePoint: game.judgePoint,
                    isFirstKilled: game.isFirstKilled,
                    bestMove: game.bestMove,
                    Ci: game.Ci,
                    totalPoint: game.totalPoint,
                  });

                  // Обновляем общие суммы
                  allPlayersStats[user.name].totalJudgePoints +=
                    game.judgePoint;
                  allPlayersStats[user.name].totalBestMoves += game.bestMove;

                  // Обновляем сумму баллов за каждую позицию игры (первая, вторая и т.д.)
                  allPlayersStats[user.name].gamePositionTotals[gameIndex] +=
                    game.totalPoint;

                  // Подсчет побед и стриков
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

                  // Обновляем максимальные стрики
                  allPlayersStats[user.name].maxWinStreak = Math.max(
                    allPlayersStats[user.name].maxWinStreak,
                    currentWinStreak
                  );
                  allPlayersStats[user.name].maxLoseStreak = Math.max(
                    allPlayersStats[user.name].maxLoseStreak,
                    currentLoseStreak
                  );

                  // Обновляем максимальное количество побед за citizen и mafia
                  allPlayersStats[user.name].maxCitizenWins = Math.max(
                    allPlayersStats[user.name].maxCitizenWins,
                    citizenWins
                  );
                  allPlayersStats[user.name].maxMafiaWins = Math.max(
                    allPlayersStats[user.name].maxMafiaWins,
                    mafiaWins
                  );

                  // Подсчет суммы баллов за каждую игру (game1, game2 и т.д.)
                  allPlayersStats[user.name].gameTotals[gameKey] =
                    (allPlayersStats[user.name].gameTotals[gameKey] || 0) +
                    game.totalPoint;

                  // Обновляем количество побед мирных игроков
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

                  if (
                    (game.role === "Мирный" || game.role === "Шериф") &&
                    isWin
                  ) {
                    sums[gameIndex + 1].citizenWins += 1;
                  }

                  sums[gameIndex + 1].totalWinPoints += game.winPoint;
                  sums[gameIndex + 1].totalJudgePoints += game.judgePoint;
                  sums[gameIndex + 1].totalBestMoves += game.bestMove;
                  sums[gameIndex + 1].totalCi += game.Ci;
                  sums[gameIndex + 1].totalPoints += game.totalPoint;
                }
              );
            });
          }
        }

        setGamesSum(sums);
        setPlayersStats(allPlayersStats);
      } catch (error) {
        console.error("Error processing Excel file:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Общая информация по играм</h1>
      {Object.entries(gamesSum).map(([gameNumber, sum], index) => (
        <div key={index}>
          <h2>Игра {gameNumber}</h2>
          <p>Общие очки за победу: {sum.totalWinPoints}</p>
          <p>Общие очки судьи: {sum.totalJudgePoints}</p>
          <p>Общие лучшие ходы: {sum.totalBestMoves}</p>
          <p>Общие Ci: {sum.totalCi}</p>
          <p>Общие очки: {sum.totalPoints}</p>
          <p>Количество побед мирных игроков: {sum.citizenWins}</p>
        </div>
      ))}
      <h1>Статистика игроков</h1>
      {Object.entries(playersStats).map(([player, stats], index) => (
        <div key={index}>
          <h2>{player}</h2>
          <p>Всего баллов судьи: {stats.totalJudgePoints}</p>
          <p>Всего лучших движений: {stats.totalBestMoves}</p>
          <p>Максимальный стрик побед: {stats.maxWinStreak}</p>
          <p>Максимальный стрик проигрышей: {stats.maxLoseStreak}</p>
          <p>
            Максимальное количество побед за граждан: {stats.maxCitizenWins}
          </p>
          <p>Максимальное количество побед за мафию: {stats.maxMafiaWins}</p>
          <p>Сумма баллов за все первые игры: {stats.gamePositionTotals[0]}</p>
          <p>Сумма баллов за все вторые игры: {stats.gamePositionTotals[1]}</p>
          <p>Сумма баллов за все третьи игры: {stats.gamePositionTotals[2]}</p>
          <p>
            Сумма баллов за все четвертые игры: {stats.gamePositionTotals[3]}
          </p>
          <p>Сумма баллов за все пятые игры: {stats.gamePositionTotals[4]}</p>
          {/* <pre>{JSON.stringify(stats.games, null, 2)}</pre> */}
        </div>
      ))}
    </div>
  );
};

export default App;
