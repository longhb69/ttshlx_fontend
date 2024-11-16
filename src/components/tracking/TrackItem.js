import Calendar from '@atlaskit/calendar';
import { useState, useRef, useEffect } from 'react';
import { useOnClickOutside } from "usehooks-ts";
const plate = [
    {
        id: 0,
        number: "28A-093.83",
        expirationDate: "2025-4-2",
    },
    {
        id: 1,
        number: "28A-124.18",
        expirationDate: "2026-4-6",
    },
    {
        id: 2,
        number: "28A-100.97",
        expirationDate: "2026-3-25",
    },
];

const teacher = [
    {
        id: 0,
        name: 'T. Lạc hb (thay xe xếp Nhung)',
    },
    {
        id: 1,
        name: 'Sếp Nhung',
    },
    {
        id: 2,
        name: 'T.Hoà hb',
    }, 
    {
        id: 3,
        name: 'T.Đại tn',
    }

]

const courseState = [
    {
        id: 0,
        name: 'Đang học',
    },
    {
        id: 1,
        name: 'Đã hoàn thành'
    },
    {
        id: 2,
        name: 'Khoá mới'
    }
]

const status = [
    {
        id: 0,
        name: 'Chưa bắt đầu',
    },
    {
        id: 1,
        name: 'Đang thực hiện',
    },
    {
        id: 2,
        name: 'Tip tục',
    },
    {
        id: 3,
        name: 'Đã hoàn thành',
    }
]

const course = [
    {
        id: 0,
        name: 'B11K56',
        
    },
    {
        id: 1,
        name: 'B11K57',
    },
    {
        id: 2,
        name: 'B11K58',
    },
]

const tracking = [
    {
        id: 0,
        plate: 0,
        teacher: 0,
        course: 2,
        numberOfStudent: 1,
        courseState: 0,
        startDate: null,
        endDate: null,
        status: 1,
    },
    {
        id: 1,
        plate: 1,
        teacher: 1,
        course: 1,
        numberOfStudent: 2,
        courseState: 0,
        startDate: null,
        endDate: null,
        status: 1,
    }
]



export default function TrackItem({ track }) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [statusColor, setStatusColor] = useState('');
    const [courseStateColor, setCourseStateColor] = useState('');
    const calendarRef = useRef(null);
    useOnClickOutside(calendarRef, () => setShowCalendar(false));

    const getPlateNumber = (plateId) => plate.find(p => p.id === plateId)?.number || 'N/A';
    const getPlateExpiration = (plateId) => {
        const date = plate.find(p => p.id === plateId)?.expirationDate;
        if (!date) return 'N/A';
        const [year, month, day] = date.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    };
    const getTeacherName = (teacherId) => teacher.find(t => t.id === teacherId)?.name || 'N/A';
    const getCourseName = (courseId) => course.find(c => c.id === courseId)?.name || 'N/A';
    const getCourseState = (stateId) => courseState.find(s => s.id === stateId)?.name || 'N/A';
    const getStatus = (statusId) => {
        return status.find(s => s.id === statusId)?.name || 'N/A'
    };

    useEffect(() => {
        if (track.status === 1) {
            setStatusColor('bg-red-100 text-red-800')
        }
        if (track.courseState === 0) {
            setCourseStateColor('bg-red-100 text-red-800')
        }
    }, [track.status, track.courseState])

    return (
        <div key={track.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-400 border-2 border-black px-2 py-1 rounded text-xs max-w-[60px]">
                    <span className="font-mono font-bold">{getPlateNumber(track.plate)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">HĐ: {getPlateExpiration(track.plate)}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
                {getStatus(track.status)}
              </span>
            </div>
            
            <div className="space-y-2">
                <div className='flex gap-2 flex-col'>
                    <div className="flex justify-between flex-col items-center justify-center">
                        <span className="text-gray-600">Giáo viên:</span>
                        <span className="font-medium max-w-[100%] text-center truncate hover:text-clip hover:whitespace-normal" title={getTeacherName(track.teacher)}>
                            {getTeacherName(track.teacher)}
                        </span>
                    </div>  
                    <div className="flex justify-between">    
                        <div className="flex justify-between flex-col items-center justify-center">
                            <span className="text-gray-600">Khoá học:</span>
                            <span className="font-medium">{getCourseName(track.course)}</span>
                        </div>  
                        <div className="flex justify-between flex-col items-center">
                            <span className="text-gray-600">Số học viên:</span>
                            <span className="font-medium">{track.numberOfStudent}</span>
                        </div>
                    </div>  
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Khoá học:</span>
                <div className={`font-base px-3 py-1 rounded-full ${courseStateColor}`}>{getCourseState(track.courseState)}</div>
              </div>
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-gray-600">Ngày bắt đầu:</span>
                        <div className="relative">
                        <div 
                            className="cursor-pointer bg-slate-200 rounded-md px-2 py-1 hover:bg-slate-300" 
                            onClick={() => setShowCalendar(!showCalendar)}
                        >
                            {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'Chọn ngày'}
                        </div>
                        {showCalendar && (
                            <div className="absolute left-0 z-10 bg-white">
                                <Calendar 
                                    ref={calendarRef}
                                    maxDate={'2045-12-25'}
                                    defaultMonth={new Date().getMonth() + 1}
                                    defaultYear={new Date().getFullYear()}
                                    testId={'calendar'}
                                    onSelect={(date) => {
                                        const currentDate = new Date(date.iso)
                                        const endDate = new Date(currentDate)
                                        endDate.setDate(endDate.getDate() + 65 - 3 - 2)
                                        console.log(currentDate.toLocaleDateString('vi-VN'))
                                        console.log(endDate.toLocaleDateString('vi-VN'))
                                        setStartDate(currentDate)
                                        setEndDate(endDate.toLocaleDateString('vi-VN'))
                                        setShowCalendar(false);
                                    }}
                                />
                            </div>
                        )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className='flex items-center flex-col'>
                            <span className="text-gray-600">Ngày kết thúc:</span>
                            <div className="font-medium">{endDate}</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
    )
}   
