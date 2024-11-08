import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function DAT() {
  const [studentData, setStudentData] = useState([]);

  const addStudentData = (newData) => {
    setStudentData((prevData) => [...prevData, newData]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "buffer" });
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    const test = jsonData.slice(14);
    const transformedData = [];

    for (let i = 0; i < test.length; i++) {
      const row = test[i];
      if (row["CTY CP CÔNG NGHỆ SÁT HẠCH TOÀN PHƯƠNG"] == "Tổng: ") break;
      transformedData.push({
        stt: row["CTY CP CÔNG NGHỆ SÁT HẠCH TOÀN PHƯƠNG"], // You can set this to whatever index or value you need
        sessionId: row["__EMPTY"], // Value for the first column
        carPlate: row["__EMPTY_2"], // Value for the second column
        carClass: row["__EMPTY_3"], // Value for the third column
        trainingDate: row["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"], // Date value
        trainingTime: row["__EMPTY_4"], // Time value
        nightHours: row["__EMPTY_5"], // Time value
        distance: row["__EMPTY_6"], // Value for the last column
      });
    }

    addStudentData(calculateTotal(transformedData));
  };

  function calculateTotal(data) {
    const totals = {};
    data.forEach((entry) => {
      const date = entry.trainingDate.split(" ")[0];
      const [hours, minutes] = entry.trainingTime.split(":").map(Number);
      const time = Number(hours) * 60 + Number(minutes);

      const distance = entry.distance;
      if (!totals[date]) {
        totals[date] = { totalHours: 0, totalDistance: 0 };
      }
      totals[date].totalHours += time;
      totals[date].totalDistance += Number(distance.replace(",", "."));
    });
    return totals;
  }

  function convertMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60); // Get the full hours
    const remainingMinutes = minutes % 60; // Get the remaining minutes
    return `${hours}:${remainingMinutes < 10 ? "0" : ""}${remainingMinutes}`; // Format with leading zero if needed
  }

  useEffect(() => {
    console.log(studentData);
  }, [studentData]);

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <h3>Excel Data:</h3>
    </div>
  );
}
