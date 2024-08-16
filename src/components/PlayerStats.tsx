import React from "react";
import { PlayerGameStats } from "../types";

interface PlayerStatsProps {
  playersStats: Record<string, PlayerGameStats>;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ playersStats }) => (
  <div>
    {Object.entries(playersStats).map(([player, stats], index) => (
      <div key={index}>
        <h2>{player}</h2>
        <p>Всего баллов судьи: {stats.totalJudgePoints}</p>
        <p>Всего лучших ходов: {stats.totalBestMoves}</p>
        <p>Максимальный стрик побед: {stats.maxWinStreak}</p>
        <p>Максимальный стрик проигрышей: {stats.maxLoseStreak}</p>
        <p>Максимальное количество побед за граждан: {stats.maxCitizenWins}</p>
        <p>Максимальное количество побед за мафию: {stats.maxMafiaWins}</p>
        {stats.gamePositionTotals.map((total, idx) => (
          <p key={idx}>
            Сумма баллов за все {idx + 1} игры: {total}
          </p>
        ))}
      </div>
    ))}
  </div>
);

export default PlayerStats;
