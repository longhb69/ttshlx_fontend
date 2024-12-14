import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

const teacherCache = new Map()

const useListenData = (updateUI) => {
    const carsRef = collection(db, "cars");
    const coursesRef = collection(db, "courses");
    const teachersRef = collection(db, "teachers");

    onSnapshot(coursesRef, (snapshot) => {
        let isCourseCacheUpdated = false
        
    })
}