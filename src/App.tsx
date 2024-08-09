import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { parseData, User } from "./Series";
import { calculateSeriesInfo, CommonInfo } from "./calculateSeriesInfo";

const App: React.FC = () => {
  const [seriesInfo, setSeriesInfo] = useState<Record<string, CommonInfo>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch and read the Excel file
        const workbook = XLSX.read(
          await fetch("table.xlsx").then((res) => res.arrayBuffer()),
          { type: "array" }
        );

        const usersBySeries: Record<string, CommonInfo> = {};

        for (let i = 1; i <= 48; i++) {
          const sheetName = `${i} серия`;
          const sheet = workbook.Sheets[sheetName];

          if (sheet) {
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const users = parseData(rawData);

            // Используем calculateSeriesInfo для вычисления информации о серии
            const commonInfo = calculateSeriesInfo(users);

            usersBySeries[sheetName] = commonInfo;
          }
        }

        setSeriesInfo(usersBySeries);
        console.log(seriesInfo);
      } catch (error) {
        console.error("Error processing Excel file:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Результаты игр</h1>
      {Object.entries(seriesInfo).map(([series, info], index) => (
        <div key={index}>
          <h2>{series}</h2>
          <pre>{JSON.stringify(info, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default App;
