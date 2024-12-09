import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc, onSnapshot, query, where,updateDoc, orderBy } from "firebase/firestore";
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
    const [courseFocus, setCourseFocus] = useState()
    const [currentCourseFocusId, setCurrentCourseFocusId] = useState("")
    const [notes, setNotes] = useState([]);
    const [coursesName, setCoursesName] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterCar, setFilterCar] = useState([]);
    const [currentTags, setCurrentTags] = useState("");
    const [isCourseModal, setIsCourseModal] = useState(false);
    const [currentNoteId, setCurrentNoteId] = useState("");
    const [tags, setTags] = useState([]);
    const [noteMode, setNoteMode] = useState(false);
    const [fullCarMode, setFullCarMode] = useState(true)
    const [fullCarScreen, setFullCarScreen] = useState(92)
    const [emptyResult, setEmptyResult] = useState(false)
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
        console.log(filteredResults)
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

    const deleteFromNote = async (plate) => {
        const docRef = doc(db, "notes", currentNoteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const updateCars = docSnap.data().cars.filter((c) => c !== plate);
            await updateDoc(docRef, {
                cars: updateCars,
            });  
            setFilterCar(filterCar.filter(car=> car.plate !== plate))          
        }
    };

    useEffect(() => {
        if(courseFocus) {
            setFullCarScreen(35)
        }
        else {
            setFullCarScreen(92)
        }
    }, [courseFocus])

    useEffect(() => {
        //console.log(courseFocus);
    }, [courses]);

    const RenderCarList = ({ filterCar, cars, noteMode, currentNoteId }) => {
        if(filterCar.length > 0) {
            return filterCar.map((car) => (
                <Plate
                    key={car.id}
                    car={car}
                    noteMode={noteMode}
                    currentNoteId={currentNoteId}
                    deleteFromNote={deleteFromNote}
                    className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                />
            ));
        } 
        else if(filterCar.length === 0 && currentNoteId !== "") {
            return <p className="text-gray-500 text-center mt-4">Không có xe nào khớp với kết quả tìm kiếm.</p>;
        }
        if (cars.length > 0) {
            return cars.map((car) => (
                <Plate
                    key={car.id}
                    car={car}
                    noteMode={false}
                    className="border rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow duration-200 mr-2"
                />
            ));
        }
    }

    return (
        <>
            <div className="flex justify-between pl-8 pr-4 gap-4 py-4 h-full bg-white">
                <div className="flex h-full flex-col nowrap gap-5 basis-[80%]">
                    <div className="flex flex-col overflow-hidden gap-2 w-full h-full rounded ">
                        <div className="rounded-lg h-[5%] min-h-[5%] w-full bg-[#EFEAE6]">
                            <ToolBar
                                handleSearch={handleSearch}
                                coursesName={coursesName}
                                filterClass={filterClass}
                                tags={tags}
                                setTags={setTags}
                                resetNote={resetNote}
                            />
                        </div>
                        <div className="flex w-full h-[85%] p-2 rounded-md bg-[#EFEAE6]" style={{height: `${fullCarScreen}%`}}>
                            <div className="w-full max-h-full overflow-y-scroll custom-scrollbar scrollbar-hidden">
                                <ol className={`h-full min-h-full w-full plate-scroll rounded-md shadow-md`}>
                                    <RenderCarList 
                                        filterCar={filterCar}
                                        cars={cars}
                                        noteMode={noteMode}
                                        currentNoteId={currentNoteId}
                                    />
                                </ol>
                            </div>
                        </div>
                        <div className={`${courseFocus? "h-[55%]" : ""} w-full`}>
                            {courseFocus ? 
                                <CourseModal course={courseFocus} setCourseFocus={setCourseFocus} setFullCarMode={setFullCarMode}/> 
                            :
                                null
                            }
                        </div>
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
                                                <CourseList 
                                                    course={course} 
                                                    currentCars={cars} 
                                                    setCourseFocus={setCourseFocus} 
                                                    currentCourseFocusId={currentCourseFocusId} 
                                                    setCurrentCourseFocusId={setCurrentCourseFocusId} 
                                                    fullCarMode={fullCarMode}
                                                    setFullCarMode={setFullCarMode}
                                                />
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
