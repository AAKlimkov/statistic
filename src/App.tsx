import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { parseData } from "./helpers/parseData";
import { calculateSeriesInfo } from "./helpers/calculateSeriesInfo";
import { PlayerGameStats, GameSum } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { calculatePlayerStatistics } from "./helpers/calculatePlayerStatistics";
import { convertSeriesToPlayerStats } from "./helpers/convertSeriesToPlayerStats";

const App: React.FC = () => {
  const [playersStats, setPlayersStats] = useState<
    Record<string, PlayerGameStats>
  >({});
  const [gamesSum, setGamesSum] = useState<Record<number, GameSum>>({});
  const globalGameNumber = { count: 1 }; // Глобальный счетчик игр

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workbook = XLSX.read(
          await fetch("table.xlsx").then((res) => res.arrayBuffer()),
          { type: "array" }
        );
        const allPlayersStats: Record<string, PlayerGameStats> = {};
        const sums: Record<number, GameSum> = {};
        const users = [];
        for (let i = 1; i <= 48; i++) {
          const sheetName = `${i} серия`;
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const usersTemp = parseData(rawData);
            users.push(usersTemp);
            calculateSeriesInfo(
              usersTemp,
              allPlayersStats,
              sums,
              sheetName,
              globalGameNumber
            );
          }
        }

        setPlayersStats(allPlayersStats);
        setGamesSum(sums);
        const users1 = convertSeriesToPlayerStats(users);
        const stats = calculatePlayerStatistics(users1);
        setPlayersStats(stats);
        console.log(stats);
        
      } catch (error) {
        console.error("Error processing Excel file:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Общая информация по играм</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Игра</TableCell>
              <TableCell>Общие очки судьи</TableCell>
              <TableCell>Общие лучшие ходы</TableCell>
              <TableCell>Общие Ci</TableCell>
              <TableCell>Общие очки</TableCell>
              <TableCell>Количество побед мирных игроков</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(gamesSum).map(([gameNumber, sum], index) => (
              <TableRow key={index}>
                <TableCell>Игра {gameNumber}</TableCell>
                <TableCell>{sum.totalJudgePoints}</TableCell>
                <TableCell>{sum.totalBestMoves}</TableCell>
                <TableCell>{sum.totalCi}</TableCell>
                <TableCell>{sum.totalPoints}</TableCell>
                <TableCell>{sum.citizenWins}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h1>Статистика игроков</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Игрок</TableCell>
              <TableCell>Максимальный стрик побед</TableCell>
              <TableCell>Серии с максимальным стриком побед</TableCell>
              <TableCell>Максимальный стрик проигрышей</TableCell>
              {/* <TableCell>Максимальное количество побед за граждан</TableCell> */}
              {/* <TableCell>
                Серии с максимальным стриком побед за граждан
              </TableCell> */}
              {/* <TableCell>Максимальное количество побед за мафию</TableCell> */}
              <TableCell>Серии с максимальным стриком проигрышей</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(playersStats).map(([playerName, stats], index) => (
              <TableRow key={index}>
                <TableCell>{stats.name}</TableCell>
                <TableCell>{stats.maxWinStreak}</TableCell>
                <TableCell>{stats.winSeries.join(", ")}</TableCell>
                <TableCell>{stats.maxLoseStreak}</TableCell>
                {/* <TableCell>{stats.maxCitizenWins}</TableCell> */}
                {/* <TableCell>{stats.maxCitizenWinsGames.join(", ")}</TableCell> */}
                {/* <TableCell>{stats.maxMafiaWins}</TableCell> */}
                <TableCell>{stats.loseSeries.join(", ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default App;
