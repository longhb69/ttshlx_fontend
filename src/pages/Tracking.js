import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import TrackItem from "../components/tracking/TrackItem";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc, onSnapshot, query, where, } from "firebase/firestore";
import Plate from "../components/tracking/Plate";
import CourseList from "../components/tracking/CourseList";
import Modal, { ModalTransition, useModal } from "@atlaskit/modal-dialog";
import CarModal from "../components/modal/CarModal.tsx";
import Blanket from "@atlaskit/blanket";
import Header from "../components/board/Header.js";
import Button from '@atlaskit/button/new';
import { Filter } from 'lucide-react';


export default function Tracking() {
    const [teacherList, setTeacherList] = useState([]);
    const [cars, setCars] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterCar, setFilterCar] = useState([]);

    const teachersCollectionRef = collection(db, "teachers");
    const carsCollectionRef = collection(db, "cars");
    const coursesCollectionRef = collection(db, "courses");
    const addCarModalRef = useRef();

    useEffect(() => {
        const unsubscribe = onSnapshot(
            carsCollectionRef,
            (querySnapshot) => {
                setCars(querySnapshot.docs.map((doc) => doc.data()));
            },
            (error) => {
                console.error("Error fetching real-time updates:", error);
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            coursesCollectionRef,
            (querySnapshot) => {
                setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                console.log("Something change");
            },
            (error) => {
                console.error("Error fetching real-time updates:", error);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleSearch = async (searchTerm) => {
        if (searchTerm.trim() === "") {
            setFilterCar([]); 
            return;
        }
        const filteredResults = cars.filter((car) => {
            return car.plate.includes(searchTerm)
        })

        console.log(filteredResults)
        setFilterCar(filteredResults)
    }

    return (
        <>
            <Header/>
            <div className="flex justify-between pl-8 py-4 h-full">
                <div className="flex justify-between flex-wrap max-h-full h-full w-[360px] min-w-[300px] bg-[#ECE3CA] rounded pl-2.5 py-2.5 mb-5 shadow-lg">
                    <div className="flex justify-center gap-2">
                        <input
                            type="text"
                            placeholder="Tìm kiếm xe..."
                            className="mb-2 p-2 border rounded w-[180px] h-[35px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <div className="">
                            <Button><span className="w-[8px] h-[8px]"><Filter /></span></Button>
                        </div>
                    </div>
                    <ol className={`grid gap-y-4 overflow-y-auto max-h-[85%] w-full plate-scroll ${filterCar.length <= 2 && filterCar.length !== 0 ? 'grid-cols-1 place-items-center' : 'grid-cols-2'} `}>
                        {filterCar.length > 0 
                            ? ( 
                                filterCar.map((car) => {
                                    return <Plate car={car} className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200"/>
                                })
                            )
                            :
                            cars.length > 1 &&
                                cars.map((car) => {
                                    return <Plate car={car} className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200" />;
                                })
                        }
                    </ol>
                    <div className="pt-[8px] px-[8px] rounded-md flex items-center justify-center">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center m-0 p-[2px] rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                        >
                            <span className="ml-[2px] mr-[5px] leading-1">
                                <Plus className="w-[20px] h-[20px]" />
                            </span>
                            <span className="pr-2">Thêm xe</span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col relative border-box w-[1200px] max-h-[70%] rounded mr-5 basis-[60%] justify-between overflow-hidden">
                    <ol className="flex">
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
            </div>
            <CarModal trigger={isModalOpen} setTrigger={setIsModalOpen} />
        </>
    );
}
