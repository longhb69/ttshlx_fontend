import { useEffect, useRef, useState } from "react";
import TrackItem from "../components/tracking/TrackItem";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import Plate from "../components/tracking/Plate";
import CourseList from "../components/tracking/CourseList";

const tracking = [
    {
        id: 0,
        plate: 0,
        teacher: 0,
        course: 1,
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
    },
];

export default function Tracking() {
    const [teacherList, setTeacherList] = useState([]);
    const [cars, setCars] = useState([]);
    const [courses, setCourses] = useState([])

    const teachersCollectionRef = collection(db, "teachers");
    const carsCollectionRef = collection(db, "cars");
    const coursesCollectionRef = collection(db, "courses")

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
                setCourses(querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
            } catch(err) {
                console.log(err)
            }
        }

        getTeacherList();
        getCoursesList();
    }, []);

    useEffect(() => {
        console.log(courses)
    }, [courses])

    return (
        <div className="flex justify-between p-4">
            <div className="flex flex-wrap">
                <div className="flex flex-col gap-2">
                    {cars.length > 1 &&
                        cars.map((car) => {
                            return (
                                <Plate
                                    plate={car.plate}
                                    expiry_date={car.expiry_date}
                                    owner_name={car.owner_name}
                                    owner_id={car.owner_id}
                                    car_class={car.class}
                                />
                            );
                        })}
                </div>
            </div>
            <div className="flex relative border-box w-[1200px] h-[800px] max-h-full rounded mr-5">
                <ol className="flex gap-1">
                    {courses.length > 1 && courses.map((course) => {
                        return <li className="block shirk-0 px-[6px] h-full whitespace-nowrap">
                            <CourseList 
                                name={course.id}
                                state={course.state}
                            />
                        </li>
                    })}
                </ol>
                
            </div>
        </div>
    );
}
