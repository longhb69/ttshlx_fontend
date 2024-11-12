import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import * as XLSX from "xlsx";

export default function DAT() {
  const [studentData, setStudentData] = useState([]);
  const [studentInfo, setStudentInfo] = useState([]);

  const addStudentData = (newData) => {
    setStudentData((prevData) => [...prevData, newData]);
  };

  const addStudentInfo = (newData) => {
    setStudentInfo((prevData) => [...prevData, newData]);
  };


  const handleFileUpload = async (e) => {
    const files = e.target.files;

    for(let file of files) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      const test = jsonData.slice(14);
      const info = jsonData.slice(5, 10)
      const transformedData = [];

      const infoData = {
        name: info[1]["__EMPTY_1"],
        id: info[2]["__EMPTY_1"],
        dateOfBirth: info[3]["__EMPTY_1"],
        class: info[4]["__EMPTY_1"],
      }

      addStudentInfo(infoData);

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
    }
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

  useEffect(() => {
    console.log(studentInfo);
  }, [studentInfo]);

  const inputRef = useRef(null);
  const onInputTriggerClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <>
      <ol className="gap-5 flex">
        {studentInfo.map((info, index) => {
          return (
            <li className="text-sm mb-7">
              <p>{index}</p>
              <p>{info.name}</p>
              <p>{info.id}</p>
              <p>{info.dateOfBirth}</p>
              <p>{info.class}</p>
              <h1>Data Summary</h1>
              <ul className="text-base">
                  {Object.entries(studentData[index]).map(([date, details]) => (
                      <li key={date} className="flex gap-5">
                          <h2>{date}</h2>
                          <p>Total Hours: {convertMinutesToTime(details.totalHours)}</p>
                          <p>Total Distance: {details.totalDistance.toFixed(3)}</p>
                      </li>
                  ))}
              </ul>
            </li>
          )
        })}
      </ol>
      <div>
        <Button onClick={onInputTriggerClick}>Upload File</Button>
        <input 
          className="hidden"
          ref={inputRef}
          multiple
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
        />
      </div>
    </>
  );
}
