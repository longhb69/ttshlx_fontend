import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc, onSnapshot, query, where, orderBy } from "firebase/firestore";
import Plate from "../components/tracking/Plate";
import CourseList from "../components/tracking/CourseList";
import ToolBar from "../components/tracking/ToolBar.js";
import Notes from "../components/tracking/Notes.js";
import ScrollableList from "../components/ScrollableList.tsx";
import AddCourseModal from "../components/modal/AddCourseModal.tsx";
import { useParams } from "react-router-dom";
import { CarsContext } from "../Context/CarsContext.js";
import Button from "../components/Button.js";
import CourseModal from "../components/modal/CourseModal.js";

export default function Tracking() {
    const { param1 } = useParams();
    const [currentClass, setCurrentClass] = useState("C");
    const [cars, setCars] = useState([]);
    const [courses, setCourses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [coursesName, setCoursesName] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterCar, setFilterCar] = useState([]);
    const [currentTags, setCurrentTags] = useState("");
    const [isCourseModal, setIsCourseModal] = useState(false);
    const [currentNoteId, setCurrentNoteId] = useState("");
    const [tags, setTags] = useState([]);
    const [noteMode, setNoteMode] = useState(false);
    const { gobalCars, setGobalCars, setGobalCourse } = useContext(CarsContext);

    const carsCollectionRef = collection(db, "cars");
    const coursesCollectionRef = collection(db, "courses");
    const notesCollectionRef = collection(db, "notes");

    useEffect(() => {
        const orderedQuery = query(carsCollectionRef, where("car_class", "==", param1));
        const unsubscribe = onSnapshot(
            orderedQuery,
            (querySnapshot) => {
                const query = querySnapshot.docs.map((doc) => doc.data());
                setCars(query);
                setGobalCars(query);
            },
            (error) => {
                console.error("Error fetching real-time updates:", error);
            }
        );

        return () => unsubscribe();
    }, [param1]);

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
        setGobalCourse(courses)
    }, [courses]);

    const handleSearch = async (searchTerm) => {
        setNoteMode(false);
        if (searchTerm.trim() === "") {
            setFilterCar([]);
            return;
        }
        const filteredResults = cars.filter((car) => {
            return car.plate.includes(searchTerm) || car.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
        });

        setFilterCar(filteredResults);
    };

    const filterClass = (tags) => {
        // check if note is current check
        if (currentNoteId !== "") return;

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

        setCurrentTags(tags);
        setFilterCar(filteredResults);
    };

    const filterByNote = (id) => {
        if (currentNoteId === id) {
            setCurrentNoteId("");
            setFilterCar([]);
            return;
        }
        setCurrentNoteId(id);
        setFilterCar([]);
        setTags([]);
        const filteredNote = notes.filter((note) => note.id === id);
        const filteredResults = cars.filter((car) => {
            return filteredNote[0].cars.includes(car.plate);
        });
        if (filteredResults.length === 0) {
            setFilterCar([]);
            setNoteMode(false);
        } else {
            setFilterCar(filteredResults);
            setNoteMode(true);
        }
    };
    const resetNote = () => {
        setCurrentNoteId("");
    };

    useEffect(() => {
        console.log(param1);
    }, [param1]);

    return (
        <>
            <div className="flex justify-between pl-8 pr-4 gap-4 py-4 h-full bg-white">
                <div className="flex flex-col nowrap gap-5 basis-[80%]">
                    <div className="flex flex-col h-[45%] gap-2 w-full rounded">
                        <div className="toolbar-sections rounded-lgh-[15%]  w-full bg-[#EFEAE6]">
                            <ToolBar
                                handleSearch={handleSearch}
                                coursesName={coursesName}
                                filterClass={filterClass}
                                tags={tags}
                                setTags={setTags}
                                resetNote={resetNote}
                            />
                        </div>
                        <div className="mt-1 flex w-full h-[85%]">
                            <div className="w-full overflow-hidden max-h-full overflow-y-scroll custom-scrollbar scrollbar-hidden">
                                <ol className={`h-full min-h-full w-full plate-scroll rounded-md shadow-md`}>
                                    {filterCar.length > 0
                                        ? filterCar.map((car) => {
                                            return (
                                                <Plate
                                                    car={car}
                                                    noteMode={noteMode}
                                                    currentNoteId={currentNoteId}
                                                    className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                                                />
                                            );
                                        })
                                        : cars.length > 0 &&
                                        cars.map((car) => {
                                            return (
                                                <Plate
                                                    car={car}
                                                    noteMode={false}
                                                    className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200 mr-2"
                                                />
                                            );
                                    })}
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="h-[55%] w-full">
                        <CourseModal/>
                    </div>
                </div>
                {/* <div className="border border-1 w-[98%] mx-auto border-gray-300 mt-3.5"></div> */}
                <div className="basis-[20%] flex flex-col gap-4 relative border-box rounded justify-between">
                    <Notes notes={notes} filterByNote={filterByNote} currentNoteId={currentNoteId} currentClass={currentClass} />
                    {/* <div className="w-[85%]">
                        <CourseModal/>
                    </div> */}
                    <div className="overflow-hidden h-[70%] bg-[#EFEAE6] p-1 rounded-md">
                        <div className="flex items-center h-[10%] px-[12px] text-[14px] font-semibold mb-1 p-[6px] justify-between">
                            <span className="text-lg">Khóa học</span>
                            <Button onClick={() => setIsCourseModal(true)}>Thêm khóa học</Button>
                        </div>
                       <ScrollableList>
                            <ol className="flex flex-col basis-[95%] pb-2 w-full gap-2">
                                {courses.length > 1 &&
                                    courses.map((course) => {
                                        return (
                                            <li className="block shirk-0 px-[6px]  whitespace-nowrap">
                                                <CourseList course={course} currentCars={cars} />
                                            </li>
                                        );
                                    })}
                            </ol>
                        </ScrollableList> 
                    </div>
                    <AddCourseModal trigger={isCourseModal} setTrigger={setIsCourseModal} />
                </div> 
            </div>
        </>
    );
}
