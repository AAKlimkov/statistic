/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../types";

export const parseData = (data: any[][]): User[] => {
  return data
    .slice(4, 15)
    .filter((row) => row[1])
    .map((row) => ({
      name: row[1],
      game1: {
        role: row[3],
        winPoint: parseFloat(row[4]) || 0,
        judgePoint: parseFloat(row[5]),
        isFirstKilled: row[6] === "ПУ",
        bestMove: parseFloat(row[7]) || 0,
        Ci: parseFloat(row[8]) || 0,
        totalPoint:
          (parseFloat(row[4]) || 0) +
          parseFloat(row[5]) +
          (parseFloat(row[8]) || 0) +
          (parseFloat(row[7]) || 0),
      },
      game2: {
        role: row[9],
        winPoint: parseFloat(row[10]) || 0,
        judgePoint: parseFloat(row[11]),
        isFirstKilled: row[12] === "ПУ",
        bestMove: parseFloat(row[13]) || 0,
        Ci: parseFloat(row[14]) || 0,
        totalPoint:
          (parseFloat(row[10]) || 0) +
          parseFloat(row[11]) +
          (parseFloat(row[14]) || 0) +
          (parseFloat(row[13]) || 0),
      },
      game3: {
        role: row[15],
        winPoint: parseFloat(row[16]) || 0,
        judgePoint: parseFloat(row[17]),
        isFirstKilled: row[18] === "ПУ",
        bestMove: parseFloat(row[19]) || 0,
        Ci: parseFloat(row[20]) || 0,
        totalPoint:
          (parseFloat(row[16]) || 0) +
          parseFloat(row[17]) +
          (parseFloat(row[20]) || 0) +
          (parseFloat(row[19]) || 0),
      },
      game4: {
        role: row[21],
        winPoint: parseFloat(row[22]) || 0,
        judgePoint: parseFloat(row[23]),
        isFirstKilled: row[24] === "ПУ",
        bestMove: parseFloat(row[25]) || 0,
        Ci: parseFloat(row[26]) || 0,
        totalPoint:
          (parseFloat(row[22]) || 0) +
          parseFloat(row[23]) +
          (parseFloat(row[26]) || 0) +
          (parseFloat(row[25]) || 0),
      },
      game5: {
        role: row[27],
        winPoint: parseFloat(row[28]) || 0,
        judgePoint: parseFloat(row[29]),
        isFirstKilled: row[30] === "ПУ",
        bestMove: parseFloat(row[31]) || 0,
        Ci: parseFloat(row[32]) || 0,
        totalPoint:
          (parseFloat(row[28]) || 0) +
          parseFloat(row[29]) +
          (parseFloat(row[32]) || 0) +
          (parseFloat(row[31]) || 0),
      },
    }));
};
