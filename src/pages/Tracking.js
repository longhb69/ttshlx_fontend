import { useEffect, useRef, useState } from "react";
import { Plus } from 'lucide-react';
import TrackItem from "../components/tracking/TrackItem";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc, onSnapshot } from "firebase/firestore";
import Plate from "../components/tracking/Plate";
import CourseList from "../components/tracking/CourseList";

export default function Tracking() {
    const [teacherList, setTeacherList] = useState([]);
    const [cars, setCars] = useState([]);
    const [courses, setCourses] = useState([]);

    const teachersCollectionRef = collection(db, "teachers");
    const carsCollectionRef = collection(db, "cars");
    const coursesCollectionRef = collection(db, "courses");
    const addCarModalRef = useRef()

    useEffect(() => {
        const getTeacherList = async () => {
            try {
                const querySnapshot = await getDocs(carsCollectionRef);
                setCars(querySnapshot.docs.map((doc) => doc.data()));
            } catch (err) {
                console.log(err);
            }
        };
    
        getTeacherList();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            coursesCollectionRef,
            (querySnapshot) => {
                setCourses(
                    querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
                )
                console.log("Something change")
            },
            (error) => {
                console.error('Error fetching real-time updates:', error);
            }
        ) 

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        console.log(courses);
    }, [courses]);

    return (
        <div className="flex justify-between pl-8 py-4 h-full">
            <div className="flex justify-between flex-wrap max-h-full h-full w-[360px] min-w-[300px] bg-[#faf6f5] rounded p-2.5 mb-5">
                <input
                        type="text"
                        placeholder="Tìm kiếm xe..."
                        className="mb-2 p-2 border rounded w-[180px] h-[35px]"
                        onChange={(e) => console.log(e.target.value)}
                    />
                <ol className="grid grid-cols-2 gap-x-4 gap-y-2.5 overflow-y-auto max-h-[85%] w-full plate-scroll">
                    {cars.length > 1 &&
                        cars.map((car) => {
                            return <Plate car={car} />;
                        })}
                </ol>
                <div className="hover:bg-gray-200 pt-[8px] px-[8px]">
                    <button 
                        onClick={()=>addCarModalRef.current.showModal()}
                        className="flex grow items-center justify-start m-0 pb-[6px] pr-[8px] rounded bg-transparent select-none text-[#44546f] w-full curosr-pointer font-medium text-[14px] leading-5"
                    >
                        <span className="mr-[8px] leading-1 inline-block"><Plus className="w-[20px] h-[20px]"/></span> Thêm xe
                    </button>
                </div>
            </div>
            <div className="flex relative border-box w-[1200px] max-h-full rounded mr-5 basis-[60%]">
                <ol className="flex gap-1">
                    {courses.length > 1 &&
                        courses.map((course) => {
                            return (
                                <li className="block shirk-0 px-[6px] h-full whitespace-nowrap">
                                    <CourseList course={course}/>
                                </li>
                            );
                        })}
                </ol>
            </div>
        </div>
    );
}
