import * as XLSX from "xlsx";
import { User, PlayerGameStats, GameSum } from "../types";
import { calculateSeriesInfo } from "./calculateSeriesInfo";

// Example function to generate the Excel file
const exportToExcel = (
  users: User[],
  allPlayersStats: Record<string, PlayerGameStats>,
  sums: Record<number, GameSum>
) => {
  const workbook = XLSX.utils.book_new();

  // Prepare data for export
  const data = [];

  data.push([
    "User Name",
    "Total Judge Points",
    "Total Best Moves",
    "Max Win Streak",
    "Max Lose Streak",
    "Max Citizen Wins",
    "Max Mafia Wins",
  ]);

  users.forEach((user) => {
    const stats = allPlayersStats[user.name];
    data.push([
      user.name,
      stats.totalJudgePoints,
      stats.totalBestMoves,
      stats.maxWinStreak,
      stats.maxLoseStreak,
      stats.maxCitizenWins,
      stats.maxMafiaWins,
    ]);
  });

  // Add summary (sums) to the data
  data.push([]);
  data.push([
    "Game",
    "Total Win Points",
    "Total Judge Points",
    "Total Best Moves",
    "Total Ci",
    "Total Points",
    "Citizen Wins",
  ]);
  Object.keys(sums).forEach((gameNumber) => {
    const sum = sums[gameNumber];
    data.push([
      `Game ${gameNumber}`,
      sum.totalWinPoints,
      sum.totalJudgePoints,
      sum.totalBestMoves,
      sum.totalCi,
      sum.totalPoints,
      sum.citizenWins,
    ]);
  });

  // Create a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  // Write the workbook to a file
  XLSX.writeFile(workbook, "results.xlsx");
};

// Example usage
const users: User[] = [];
const allPlayersStats: Record<string, PlayerGameStats> = {};
const sums: Record<number, GameSum> = {};

calculateSeriesInfo(users, allPlayersStats, sums, "Sheet1");
exportToExcel(users, allPlayersStats, sums);
