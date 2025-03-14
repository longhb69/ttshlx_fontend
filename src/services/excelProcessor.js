const XLSX = require("xlsx")
const fs = require('fs');


class ExcelProcessor {
    static extractExcelData(filePath) {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(sheet);

            return jsonData;
        } catch (error) {
            console.error('Error reading Excel file:', error);
            return null;
        }
    } 
    static extractStudent(data) {
        let students = []
        for(let i = 1;i < data.length - 2; i++) {
            const extractStudent = {
                name: data[i]["Sở GTVT Hòa Bình\nTrung tâm đào tạo sát hạch lái xe Chi nhánh Hòa Bì"],
                status: data[i]["Ngày mãn khóa: "],
                address: data[i]["Ngày khai giảng: "],
                id: data[i]["DANH SÁCH THÍ SINH DỰ SÁT HẠCH\n"],
                birhday: data[i]["BÁO CÁO 2\nThời gian đào tạo:  3.8 tháng"],
            }
            students.push(extractStudent)
        }
        return students
    }
    static extractDSThiA1(data) {
        const transformedData = [];
        let beginRead = false
        for(let i=0;i<data.length;i++) {
            const row = data[i]
            const keys = Object.keys(row);

            if(row[keys[0]] === "TRUNG TÂM SÁT HẠCH\n(Ký tên)  " || row[keys[1]] === "TỔ TRƯỞNG TỔ SÁT HẠCH\n(Ký tên)") break;

            if(beginRead) {
                transformedData.push({
                    stt: row[keys[1]],
                    name: row[keys[2]],
                    id: row[keys[3]],
                    dateOfBirth: row[keys[4]],
                    address: "",
                    class: row[keys[5]],
                    note: row[keys[6]],
                    check: false,
                    checkTime: null,
                });
            }
            else if (row[keys[0]] === "STT") {
                beginRead = true
                continue
            }
        }
        return transformedData
    }
}

module.exports = ExcelProcessor