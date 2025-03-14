import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import formatTime from "../utils/fomatTime"
import Button from "../components/Button";
import { RotateCcw } from "lucide-react";


export default function DSA1() {
    const [value, setValue] = useState("");
    const [A1, setA1] = useState([])
    const [focusedRow, setFocusedRow] = useState(null);
    const [backspace, setBackSpace] = useState(false);
    const [typingValue, setTypingValue] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [searchFeedback, setSearchFeedback] = useState('');
    const [checkedCount, setCheckedCount] = useState(0);
    const inputFileRef = useRef()
    const TYPE_SPEED = 1000

    const handleFileUpload = async (e) => {
        const files = e.target.files;

        let jsonData = null
        const transformedData = [];

        
        for (let file of files) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "buffer" });
            jsonData = XLSX.utils.sheet_to_json(
                workbook.Sheets[workbook.SheetNames[0]]
            );
        }

        let beginRead = false
        for(let i=0;i<jsonData.length;i++) {
            const row = jsonData[i]
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

        setA1(transformedData)
    }

    useEffect(() => {
        const matchedIndex = A1.findIndex(item => item.stt?.toString() === value);
        console.log("Match index ", matchedIndex)
        setFocusedRow(matchedIndex >= 0 ? matchedIndex : null);
        if (matchedIndex >= 0) {
            const element = document.getElementById(`row-${matchedIndex}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [value])

    const handleChange = (event) => {
        if (backspace) {
            console.log("is backspace")
            setBackSpace(false)
            return;
        }
        updateSearchValueDebounce(event.target.value);
    };

    const updateSearchValueDebounce = debounce(query => {
        let search = A1.find((s) => s.stt === query)
        if(search) {
            console.log("find ", query)
            setValue(query);
        }
        else {
            console.log("Student not found")
            setValue(null)
        }
    })

    function debounce(cb, delay=100) {
        let timeout

        return(...args) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                cb(...args)
            }, delay)
        }
    }

    const clearSearch = () => {
        setTypingValue('');
        setSearchFeedback('');
        //setValue('');
    };

    const handleReset = () => {
        setA1([])
        setValue([])
        clearSearch()
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Backspace') {
                console.log("backspace")
                setTypingValue(prev => prev.slice(0, -1));
                setSearchFeedback(prev => prev ? `Searching: ${typingValue.slice(0, -1)}` : '');
                setBackSpace(true);
            }
            else if(event.key === 'Enter') {
                console.log(focusedRow)
                if(focusedRow || focusedRow === 0) {
                    console.log(focusedRow, A1[focusedRow])
                    const updatedA1 = [...A1]
                    updatedA1[focusedRow].check = !updatedA1[focusedRow].check
                    updatedA1[focusedRow].checkTime = updatedA1[focusedRow].checkTime ? null : formatTime(new Date());
                    setA1(updatedA1);
                }
                else {
                    console.log("Cannot check ", focusedRow)
                }
            }
            else if(event.key === 'Escape') {
                clearSearch();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [focusedRow, typingValue]);

    useEffect(() => {
        console.log("listner call")
        const handleNumberPress = (event) => {
            const key = event.key;
            if(/^[0-9]$/.test(key)) {
                if(A1.length >= 1) {
                    if (searchTimeout) clearTimeout(searchTimeout);
                    
                    const newValue = typingValue + key;
                    setTypingValue(newValue);
                    setSearchFeedback(`Searching: ${newValue}`);
                    
                    const timeout = setTimeout(() => {
                        clearSearch();
                    }, TYPE_SPEED);
                    setSearchTimeout(timeout);
                    
                    updateSearchValueDebounce(newValue);
                }
            }
        };

        window.addEventListener('keypress', handleNumberPress);
        return () => {
            window.removeEventListener('keypress', handleNumberPress);
            if (searchTimeout) clearTimeout(searchTimeout);
        }
    }, [typingValue, searchTimeout, A1]);

    //useEffect(() => {
    //    console.log("value state change", value)
    //}, [value])

    useEffect(() => {
        const count = A1.reduce((acc, item) => {
            return acc + (item.check ? 1 : 0)
        }, 0);
        setCheckedCount(count)
    }, [A1])

    return <div className="w-full h-full p-12 py-10 flex ">
        <div className="w-full">
            <div className="text-xl font-bold mb-5">Tổng số học viên check in: {checkedCount} / {A1.length}</div>
            <div className="flex gap-5 mb-3 items-center">
                <div className="flex gap-4">
                    <input
                        className=""
                        multiple
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="file-upload"
                        ref={inputFileRef}
                    />
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        onClick={() => inputFileRef.current.click()}
                    >
                        Tải File Excel
                    </Button>
                    <Button
                        onClick={handleReset}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                        <RotateCcw className="w-4 h-4" />
                        Xóa Tất Cả
                    </Button>
                </div>
                <div className="mx-auto">
                    <input className="w-[200px] px-6 py-2 rounded-lg border border-gray-300 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                     placeholder:text-gray-400 text-gray-600
                                     transition-all duration-200"
                            type="text" id="fname" name="fname" placeholder="Tìm kiếm" onChange={handleChange}/>
                </div>
            </div>
            <div className="overflow-x-auto w-full shadow-md sm:rounded-lg relative pb-10">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                                <tr className="relative sticky top-0 z-10">
                                    <th scope="col" className="w-[5%] px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">STT</th>
                                    <th scope="col" className="w-[20%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                                    <th scope="col" className="w-[10%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ID</th>
                                    <th scope="col" className="w-[10%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date of Birth</th>
                                    <th scope="col" className="w-[15%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase hidden md:table-cell">Address</th>
                                    <th scope="col" className="w-[10%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase hidden sm:table-cell">Class</th>
                                    <th scope="col" className="w-[10%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase hidden lg:table-cell">Note</th>
                                    <th scope="col" className="w-[10%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                                    <th scope="col" className="w-[10%] px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {A1.length > 1 && A1.map((item, index) => (
                                    <tr 
                                        key={item.id || index} 
                                        id={`row-${index}`}
                                        className={`
                                            ${item.check ? 'bg-green-100' : ''} 
                                            ${focusedRow === index ? 'bg-blue-100 ring-2 ring-blue-500' : ''} 
                                            cursor-pointer
                                            transition-all duration-200 
                                            hover:bg-gray-200
                                        `}
                                        onClick={() => {
                                            setValue((index+1).toString())
                                        }}
                                    >
                                        <td className="px-3 py-4 text-sm text-center text-gray-500 whitespace-nowrap">{item.stt}</td>
                                        <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{item.name}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{item.id}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{item.dateOfBirth}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap hidden md:table-cell">{item.address}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap hidden sm:table-cell">{item.class}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap hidden lg:table-cell">{item.note}</td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                                            <span 
                                                className={`${
                                                    item.check 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                                } text-xs font-medium px-2 py-0.5 rounded`}
                                            >
                                                {item.check ? 'Checked' : 'Unchecked'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{item.checkTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
}