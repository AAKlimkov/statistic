import React from "react";
import { GameSum } from "../types";

interface GameSummaryProps {
  gamesSum: Record<number, GameSum>;
}

const GameSummary: React.FC<GameSummaryProps> = ({ gamesSum }) => (
  <div>
    {Object.entries(gamesSum).map(([gameNumber, sum], index) => (
      <div key={index}>
        <h2>Игра {gameNumber}</h2>
        <p>Общие очки за победу: {sum.totalWinPoints}</p>
        <p>Общие очки судьи: {sum.totalJudgePoints}</p>
        <p>Общие лучшие ходы: {sum.totalBestMoves}</p>
        <p>Общие Ci: {sum.totalCi}</p>
        <p>Общие очки: {sum.totalPoints}</p>
        <p>Количество побед мирных игроков: {sum.citizenWins / 7}</p>
      </div>
    ))}
  </div>
);

export default GameSummary;
