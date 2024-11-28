import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import TrackItem from "../components/tracking/TrackItem";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import Plate from "../components/tracking/Plate";
import CourseList from "../components/tracking/CourseList";
import Modal, { ModalTransition, useModal } from "@atlaskit/modal-dialog";
import CarModal from "../components/modal/CarModal.tsx";
import Blanket from "@atlaskit/blanket";
import Header from "../components/board/Header.js";
import Button from "@atlaskit/button/new";
import { Filter } from "lucide-react";
import ToolBar from "../components/tracking/ToolBar.js";

export default function Tracking() {
    const [teacherList, setTeacherList] = useState([]);
    const [cars, setCars] = useState([]);
    const [courses, setCourses] = useState([]);
    const [coursesName, setCoursesName] = useState([]);
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

    useEffect(() => {
        setCoursesName(
            courses.map((course) => {
                return course.id;
            })
        );
    }, [courses]);

    const handleSearch = async (searchTerm) => {
        if (searchTerm.trim() === "") {
            setFilterCar([]);
            return;
        }
        const filteredResults = cars.filter((car) => {
            return car.plate.includes(searchTerm);
        });

        console.log(filteredResults);
        setFilterCar(filteredResults);
    };

    const filterClass = (class_name) => {
        setFilterCar([]);
        if (class_name.trim() === "") {
            setFilterCar([]);
            return;
        }
        const filteredResults = cars.filter((car) => {
            console.log(car.car_class, class_name);
            return car.courses?.includes(class_name);
        });
        console.log(filteredResults);

        setFilterCar(filteredResults);
    };

    return (
        <>
            <div className="flex flex-col justify-between px-8 py-4 h-full bg-[#ECE3CA]">
                <div className="flex nowrap h-[45%] min-h-[45%]">
                    <div className="flex flex-row gap-10 h-full w-full min-w-[300px] rounded pl-2.5 py-2.5 mb-5">
                        <ToolBar handleSearch={handleSearch} coursesName={coursesName} filterClass={filterClass} />
                        <div className="max-w-[85%] min-w-[75%] min-h-full max-h-full bg-[#E4D8B4] ">
                            <ol className={`flex flex-wrap gap-4 p-4 h-full min-h-full w-full overflow-y-scroll plate-scroll rounded-md shadow-md`}>
                                {filterCar.length > 0
                                    ? filterCar.map((car) => {
                                          return (
                                              <Plate
                                                  car={car}
                                                  className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                                              />
                                          );
                                      })
                                    : cars.length > 1 &&
                                      cars.map((car) => {
                                          return (
                                              <Plate
                                                  car={car}
                                                  className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200 mr-2"
                                              />
                                          );
                                      })}
                            </ol>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col mt-7 relative border-box w-[1200px] max-h-[70%] rounded mr-5 basis-[60%] justify-between overflow-hidden">
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
        </>
    );
}
