import { useEffect, useRef, useState } from "react";
import { Plus } from 'lucide-react';
import TrackItem from "../components/tracking/TrackItem";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
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
        const getCoursesList = async () => {
            try {
                const querySnapshot = await getDocs(coursesCollectionRef);
                setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.log(err);
            }
        };

        getTeacherList();
        getCoursesList();
    }, []);

    useEffect(() => {
        console.log(courses);
    }, [courses]);

    return (
        <div className="flex justify-between px-8 py-4 h-full">
            <div className="flex flex-col justify-between flex-wrap max-h-full h-full min-w-[320px] bg-white rounded p-2 mb-5">
                <div className="w-full">
                    <input
                            type="text"
                            placeholder="Tìm kiếm xe..."
                            className="mb-2 p-2 border rounded"
                            onChange={(e) => console.log(e.target.value)}
                        />
                    <div className="">
                        <ol className="flex flex-wrap gap-2">
                            {cars.length > 1 &&
                                cars.map((car) => {
                                    return <Plate car={car} />;
                                })}
                        </ol>
                    </div>
                </div>
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
                                    <CourseList course={course} />
                                </li>
                            );
                        })}
                </ol>
            </div>
            <dialog id="my_modal_3" class="modal" ref={addCarModalRef}>
                <div class="modal-box">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div className="p-4">
                        <div className="flex justify-between">
                            <div className="flex flex-col">
                                <label htmlFor="car-plate" className="block mb-2">Biển số:</label>
                                <input
                                    id="car-plate"
                                    type="text"
                                    placeholder="Type here"
                                    class="input input-bordered input-sm w-full max-w-xs" />
                                </div>
                            <div className="flex flex-col">
                                <label htmlFor="car-class" className="block mb-2">Chọn loại xe:</label>
                                <select id="car-class" class="select select-bordered select-sm w-[100px] max-w-xs">
                                    <option>C</option>
                                    <option>B11</option>
                                    <option>B1+B2</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
