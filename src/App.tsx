import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { parseData, User } from "./Series";

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch and read the Excel file
        const workbook = XLSX.read(
          await fetch("table.xlsx").then((res) => res.arrayBuffer()),
          { type: "array" }
        );

        // Initialize an empty object to hold users by series
        const usersBySeries: Record<string, User[]> = {};

        // Iterate through each sheet (1 серия to 48 серия)
        for (let i = 1; i <= 48; i++) {
          const sheetName = `${i} серия`;
          const sheet = workbook.Sheets[sheetName];

          // Continue only if the sheet exists
          if (sheet) {
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const parsedData = parseData(rawData);

            // Add parsed data to the object with the series number as the key
            usersBySeries[sheetName] = parsedData;
          }
        }

        // Now usersBySeries is an object with keys as series numbers and values as parsed data
        console.log(usersBySeries);
      } catch (error) {
        console.error("Error processing Excel file:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Результаты игр</h1>
      {users.map((user, index) => (
        <div key={index}>
          <h2>{user.name}</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default App;
