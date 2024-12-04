import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import TrackItem from "../components/tracking/TrackItem";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc, onSnapshot, query, where, orderBy } from "firebase/firestore";
import Plate from "../components/tracking/Plate";
import CourseList from "../components/tracking/CourseList";
import Modal, { ModalTransition, useModal } from "@atlaskit/modal-dialog";
import CarModal from "../components/modal/CarModal.tsx";
import Blanket from "@atlaskit/blanket";
import Header from "../components/board/Header.js";
import Button from "@atlaskit/button/new";
import { Filter } from "lucide-react";
import ToolBar from "../components/tracking/ToolBar.js";
//import Notes from "../components/tracking/Notes.js";

export default function Tracking() {
    const [teacherList, setTeacherList] = useState([]);
    const [cars, setCars] = useState([]);
    const [courses, setCourses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [coursesName, setCoursesName] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterCar, setFilterCar] = useState([]);
    const [currentFilterClass, setCurrentFilterClass] = useState("");
    const [currentNoteId, setCurrentNoteId] = useState("");
    const [tags, setTags] = useState([]);

    const teachersCollectionRef = collection(db, "teachers");
    const carsCollectionRef = collection(db, "cars");
    const coursesCollectionRef = collection(db, "courses");
    const notesCollectionRef = collection(db, "notes");
    const addCarModalRef = useRef();

    useEffect(() => {
        const orderedQuery = query(carsCollectionRef, orderBy("createdAt", "desc"));
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
        const unsubscribe = onSnapshot(
            notesCollectionRef,
            (querySnapshot) => {
                setNotes(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            },
            (error) => {
                console.error("Error fetching real-time updates in notes:", error);
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
            return car.plate.includes(searchTerm) || car.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
        });

        console.log(filteredResults);
        setFilterCar(filteredResults);
    };

    const filterClass = (tags) => {
        setFilterCar([]);
        let filteredResults = [];
        tags.forEach((tag) => {
            const filter = cars.filter((car) => {
                if (car.courses) {
                    return car.courses.some((course) => {
                        if (course.name === tag) console.log("Found", course.name);
                        return course.name === tag;
                    });
                }
                return false;
            });
            filteredResults.push(...filter);
        });

        setCurrentFilterClass(tags);
        setFilterCar(filteredResults);
    };
    const filterByNote = (id) => {
        setFilterCar([]);
        setTags([]);
        if (currentNoteId === id) {
            setCurrentNoteId("");
            return;
        }
        setCurrentNoteId(id);
        const filteredNote = notes.filter((note) => note.id === id);
        const filteredResults = cars.filter((car) => {
            return filteredNote[0].cars.includes(car.plate);
        });
        if (filteredResults.length === 0) {
            setFilterCar([]);
        } else {
            setFilterCar(filteredResults);
        }
        console.log(filteredResults);
    };
    const resetNote = () => {
        setCurrentNoteId("");
    };
    useEffect(() => {
        if (filterCar.length > 0) {
            filterClass(currentFilterClass);
        }
    }, [cars]);

    return (
        <>
            <div className="flex flex-col justify-between px-8 py-4 h-full bg-[#ECE3CA]">
                <div className="flex nowrap h-[60%] min-h-[60%]">
                    <div className="flex flex-row gap-5 h-full w-full min-w-[300px] rounded py-2.5 mb-5">
                        {notes.length > 0 ? <Notes notes={notes} filterByNote={filterByNote} currentNoteId={currentNoteId} /> : null}
                        <ToolBar
                            handleSearch={handleSearch}
                            coursesName={coursesName}
                            filterClass={filterClass}
                            tags={tags}
                            setTags={setTags}
                            resetNote={resetNote}
                        />
                        <div className="max-w-[85%] min-w-[70%] min-h-full overflow-hidden max-h-full bg-[#E4D8B4] ">
                            <ol className={`px-4 h-full min-h-full w-full overflow-y-scroll plate-scroll rounded-md shadow-md`}>
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
                <div className="flex mt-5 relative border-box w-full h-[50%] rounded mr-5 justify-between overflow-hidden">
                    <div className="flex h-full w-[100%]">
                        <div
                            className="h-full bg-[#111111]/[.2]  w-[28px] rounded flex items-center cursor-pointer mr-4 transition-colors duration-100 hover:bg-[#2E282A] hover:text-white"
                            title="Thêm khóa học"
                        >
                            <span className="w-full">
                                <Plus className="w-full h-full" />
                            </span>
                        </div>
                        <ol className="flex flex-wrap h-full w-full gap-2">
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
                    {/* <div className="w-[40%] h-full bg-[#FAF7F5] rounded">
                        info
                    </div> */}
                </div>
            </div>
        </>
    );
}
