import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import * as XLSX from "xlsx";
import { Clock8 } from "lucide-react";

export default function DAT() {
  const [studentData, setStudentData] = useState([]);
  const [studentInfo, setStudentInfo] = useState([]);
  const [DatResult, setDatResult] = useState([]);

  const addStudentData = (newData) => {
    setStudentData((prevData) => [...prevData, newData]);
  };

  const addStudentInfo = (newData) => {
    setStudentInfo((prevData) => [...prevData, newData]);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;

    for (let file of files) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      const test = jsonData.slice(14);
      const info = jsonData.slice(5, 10);
      const transformedData = [];

      const infoData = {
        name: info[1]["__EMPTY_1"],
        id: info[2]["__EMPTY_1"],
        dateOfBirth: info[3]["__EMPTY_1"],
        class: info[4]["__EMPTY_1"],
      };

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
    const result = {};
    for (let i = 0; i < studentData.length; i++) {
      for (let date in studentData[i]) {
        if (!result[date]) {
          result[date] = {
            totalHours: 0,
            totalDistance: 0,
          };
        }
        result[date].totalHours += studentData[i][date].totalHours;
        result[date].totalDistance += studentData[i][date].totalDistance;
      }
    }

    const sortedResult = Object.fromEntries(
      Object.entries(result).sort((a, b) => {
        const dateA = new Date(a[0].split("/").reverse().join("-"));
        const dateB = new Date(b[0].split("/").reverse().join("-"));
        return dateA - dateB;
      })
    );

    setDatResult(sortedResult);
  }, [studentData]);

  useEffect(() => {
    console.log("DatResult", DatResult);
  }, [DatResult]);

  const inputRef = useRef(null);
  const onInputTriggerClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Student List - Updated grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {studentInfo.map((info, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="mb-3">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Student {index + 1}
              </span>
              <h3 className="text-lg font-semibold mt-1">{info.name}</h3>
              <div className="text-gray-600 text-xs">
                <p>ID: {info.id}</p>
                <p>DOB: {info.dateOfBirth}</p>
                <p>Class: {info.class}</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 text-sm">Tóm tắt dữ liệu</h4>
              <div className="space-y-1">
                {Object.entries(studentData[index]).map(([date, details]) => (
                  <div
                    key={date}
                    className="bg-gray-50 p-2 rounded text-xs flex gap-6 items-center border border-2"
                  >
                    <p className="font-medium">{date}</p>
                    <div className="flex flex-col text-gray-600 font-semibold">
                      <div className="flex items-center gap-0.5">
                        <Clock8 className="w-3" />
                        <p>{convertMinutesToTime(details.totalHours)}</p>
                      </div>
                      <p>{details.totalDistance.toFixed(3)} km</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final Results Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Kết Quả</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng Số Giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng Quãng Đường
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(DatResult).map(([date, details]) => (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {convertMinutesToTime(details.totalHours)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {details.totalDistance.toFixed(3)} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Button */}
      <div className="text-center">
        <Button
          onClick={onInputTriggerClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Tải File Lên
        </Button>
        <input
          className="hidden"
          ref={inputRef}
          multiple
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
