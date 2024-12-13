import { Link } from "react-router-dom"
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from "../../config/firebase";
import { useEffect, useState } from "react";

export default function Car({}) {
    const [cars, setCars] = useState()
    const carsCollectionRef = collection(db, "cars");
    const teachersCollectionRef = collection(db, "teachers")
    const coursesCollectionRef = collection(db, "courses")
    const [courses, setCourses] = useState([])
    const [teachers, setTeachers] = useState([]);


    useEffect(() => {
        const unsubscribe = onSnapshot(carsCollectionRef, async (querySnapshot) => {
            const docs = await Promise.all(
                querySnapshot.docs.map(async (document) => {
                    const data = document.data();

                    let relation_data = {
                        teacher: null,
                        courses: null
                    }
                    // If the teacher field has a value (a reference)
                    if (data.teacher?.value) {
                        const teacherRef = doc(db, data.teacher.value.path);
                        try {
                            const teacherSnap = await getDoc(teacherRef);
                            const teacherData = teacherSnap.exists() ? teacherSnap.data() : null;

                            const relationValue = {
                                type: "relation",
                                value: {
                                    key: teacherSnap.id,
                                    value: teacherData
                                }
                            }

                            relation_data.teacher = relationValue

                        } catch (teacherError) {
                            console.error('Error fetching teacher data:', teacherError);
                            return {
                                doc_id: document.id,
                                ...data,
                                teacher: null 
                            };
                        }
                    }

                    if(data.courses?.value) {
                        //re do this, this can handle one course but car can have many courses
                        const courseRef = doc(db, data.courses.value.path)
                        try {
                            const coursesSnap = await getDoc(courseRef);
                            const coursesData = coursesSnap.exists() ? coursesSnap.data() : null

                            let joinData = {
                                key: null,
                                number_of_students: null,
                                note: null
                            }

                            Object.entries(coursesData.cars?.value.cars).forEach(([key, value]) => {
                                if (key === document.id) {
                                    joinData.key = coursesSnap.id;
                                    joinData.number_of_students = value.number_of_students;
                                    joinData.note = value.note;
                                }
                            });

                            const relationValue = {
                                type: "relation",
                                value: joinData
                            }

                            relation_data.courses = relationValue

                        } catch (error) {
                            console.error('Error fetching course data:', error);
                            return {
                                doc_id: document.id,
                                ...data,
                                courses: null 
                            };
                        }
                    }

                    // Return the document data with the teacher information (initially null if not available)
                    return {
                        doc_id: document.id,
                        ...data,
                        teacher: relation_data.teacher,
                        courses: relation_data.courses 
                    };
                })
            );

            setCars(docs);
        });

        return () => unsubscribe(); 
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(teachersCollectionRef, async (querySnapshot) => {
            const docs = await Promise.all(
                querySnapshot.docs.map((document) => {
                    const data = document.data();

                    // Update the car state with the teacher data when teacher changes
                    if(cars) {
                        setCars((prevCars) =>
                            prevCars.map((car) =>
                                car.teacher?.value.key === document.id ? { ...car, teacher: { ...car.teacher, value: {...car.teacher.value, value: data }} } : car
                            )
                        );
                    }
                    return {
                        id: document.id,
                        ...data,
                    };
                })
            );
            setTeachers(docs)
        })

        return () => unsubscribe();  
    }, [])

    useEffect(() => {
        const unsubscribe = onSnapshot(coursesCollectionRef, async (querySnapshot) => {
            const docs = await Promise.all(
                querySnapshot.docs.map((document) => {
                    const data = document.data();

                    // Update the car state with the teacher data when teacher changes
                    //car.courses? this ensure the case that an car have empty field
                    if(cars) {
                        // let courseData = null;

                        // if (Array.isArray(data.courses?.value)) {
                        //     courseData = data.courses.value.find(course => course.id === document.id);
                        // }
                        // setCars((prevCars) =>

                        //     prevCars.map((car) =>
                        //         car.courses?.value.key === document.id ? { ...car, courses: { ...car.courses, value: {...car.courses.value, value: data }} } : car
                        //     )
                        // );
                    }
                    return {
                        id: document.id,
                        ...data,
                    };
                })
            );
            setCourses(docs)
        })

        return () => unsubscribe();  
    }, [])


    useEffect(() => {
        console.log(cars)
    }, [cars])
    return (
        <div className="w-full self-center my-[1px]" style={{}}>
            {/* <div className="rounded-lg h-[7%] min-h-[7%] w-full bg-[#EFEAE6]">
                <ToolBar
                    handleSearch={handleSearch}
                    coursesName={coursesName}
                    filterClass={filterClass}
                    tags={tags}
                    setTags={setTags}
                    resetNote={resetNote}
                />
            </div> */}
            {/*tool bar */}
            <div className="min-h-[40px] pl-[96px] pr-[96px] w-full relative left-[-96px] ">
                <div>
                    <div className="flex items-center h-[40px] w-full border-b mb-[1px]">
                        <div className="flex items-center h-full flex-grow overflow-hidden">
                            <div className="inline-flex h-full m-0 ">
                                <div className="cursor-grab flex items-center bg-none h-full">
                                    <div className="selcet-none transition cursor-pointer flex items-center shrink-0 whitespace-nowrap h-[28px] rounded text-[14px] leading-5 min-w-[0px] px-[8px] font-semibold max-w-[220px] text-[#37352FA6]">
                                        <div className="w-fit h-[16px] mr-[6px]">
                                            icon 
                                        </div>
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis mt-[1px]">Theo khoá học</span>
                                    </div>
                                </div>
                                <div className="cursor-grab flex items-center bg-none h-full">
                                    <div className="selcet-none transition cursor-pointer flex items-center shrink-0 whitespace-nowrap h-[28px] 
                                                rounded text-[14px] leading-5 min-w-[0px] px-[8px] font-semibold max-w-[220px] text-[#37352FA6]
                                                border-b border-[#37352F]
                                    ">
                                        <div className="w-fit h-[16px] mr-[6px]">
                                            icon 
                                        </div>
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis mt-[1px]">Tất cả</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-[2px] transition-opacity duration-200" style={{"opacity" : "1"}}>
                            <div className="relative">
                                <div className="select-none transition cursor-pointer flex items-center justify-center rounded h-[28px] w-[28px] p-[6px] text-[14px] leading-4">
                                    <svg role="graphics-symbol" viewBox="0 0 16 16" className="w-[16px] block shrink-0 fill-[#111111]/[.5]"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 4C2 3.58579 2.33579 3.25 2.75 3.25H13.25C13.6642 3.25 14 3.58579 14 4C14 4.41421 13.6642 4.75 13.25 4.75H2.75C2.33579 4.75 2 4.41421 2 4Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 8C3.75 7.58579 4.08579 7.25 4.5 7.25H11.5C11.9142 7.25 12.25 7.58579 12.25 8C12.25 8.41421 11.9142 8.75 11.5 8.75H4.5C4.08579 8.75 3.75 8.41421 3.75 8Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 12C5.5 11.5858 5.83579 11.25 6.25 11.25H9.75C10.1642 11.25 10.5 11.5858 10.5 12C10.5 12.4142 10.1642 12.75 9.75 12.75H6.25C5.83579 12.75 5.5 12.4142 5.5 12Z"></path></svg>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="select-none transition cursor-pointer flex items-center justify-center rounded h-[28px] w-[28px] p-[6px] text-[14px] leading-4">
                                    <svg role="graphics-symbol" viewBox="0 0 24 24" className="w-[18px] h-[18px] block shrink-0 fill-[#111111]/[.5]"><path d="M7.50879 5.80273L4.06348 9.32324C3.92676 9.4668 3.83789 9.67188 3.83789 9.85645C3.83789 10.2803 4.13184 10.5674 4.54883 10.5674C4.75391 10.5674 4.91797 10.499 5.04785 10.3623L6.46289 8.89941L7.37891 7.83984L7.32422 9.30273V17.8477C7.32422 18.2715 7.625 18.5723 8.04199 18.5723C8.45898 18.5723 8.75977 18.2715 8.75977 17.8477V9.30273L8.70508 7.83984L9.62793 8.89941L11.0361 10.3623C11.166 10.499 11.3369 10.5674 11.5352 10.5674C11.9521 10.5674 12.2461 10.2803 12.2461 9.85645C12.2461 9.67188 12.1641 9.4668 12.0205 9.32324L8.58203 5.80273C8.28125 5.48828 7.80957 5.48145 7.50879 5.80273ZM16.4912 18.3398L19.9365 14.8057C20.0732 14.6689 20.1621 14.4639 20.1621 14.2793C20.1621 13.8555 19.8682 13.5684 19.4512 13.5684C19.2461 13.5684 19.082 13.6367 18.9453 13.7734L17.5371 15.2295L16.6211 16.2959L16.6758 14.833V6.28809C16.6758 5.87109 16.375 5.56348 15.958 5.56348C15.541 5.56348 15.2334 5.87109 15.2334 6.28809V14.833L15.2881 16.2959L14.3721 15.2295L12.9639 13.7734C12.8271 13.6367 12.6631 13.5684 12.4648 13.5684C12.0479 13.5684 11.7539 13.8555 11.7539 14.2793C11.7539 14.4639 11.8359 14.6689 11.9727 14.8057L15.418 18.3398C15.7188 18.6475 16.1904 18.6543 16.4912 18.3398Z"></path></svg>
                                </div>
                            </div>
                            <div role="button" className="select-none transition cursor-pointer flex items-center justify-center rounded h-[28px] w-[28px] p-[6px] text-[14px] leading-4">
                                <svg role="graphics-symbol" viewBox="0 0 16 16" class="collectionSearch" className="w-[14px] block shrink-0 fill-[#111111]/[.5]"><path d="M0 6.35938C0 9.86719 2.85156 12.7188 6.35938 12.7188C7.66406 12.7188 8.85938 12.3203 9.85938 11.6406L13.4531 15.2344C13.6719 15.4609 13.9766 15.5625 14.2812 15.5625C14.9453 15.5625 15.4219 15.0625 15.4219 14.4141C15.4219 14.1016 15.3125 13.8125 15.1016 13.5938L11.5312 10.0156C12.2734 8.99219 12.7188 7.72656 12.7188 6.35938C12.7188 2.85156 9.86719 0 6.35938 0C2.85156 0 0 2.85156 0 6.35938ZM1.65625 6.35938C1.65625 3.76562 3.75781 1.65625 6.35938 1.65625C8.95312 1.65625 11.0625 3.76562 11.0625 6.35938C11.0625 8.95312 8.95312 11.0625 6.35938 11.0625C3.75781 11.0625 1.65625 8.95312 1.65625 6.35938Z"></path></svg>
                            </div>
                            <Link role="link" className="select-none transition cursor-pointer flex items-center justify-center rounded h-[28px] w-[28px] p-[6px] text-[14px] leading-4">
                                <svg role="graphics-symbol" viewBox="0 0 16 16" class="openAsPageThick" className="w-[16px] h-[14px] block shrink-0 fill-[#111111]/[.5]"><path d="M2.16895 7.19629C2.59277 7.19629 2.90723 6.88867 2.90723 6.45801V5.96582L2.75684 3.81934L4.35645 5.50098L6.3252 7.4834C6.46875 7.63379 6.65332 7.70215 6.85156 7.70215C7.30957 7.70215 7.6377 7.39453 7.6377 6.93652C7.6377 6.72461 7.55566 6.54004 7.41211 6.39648L5.43652 4.4209L3.74805 2.82129L5.91504 2.96484H6.44141C6.86523 2.96484 7.18652 2.65723 7.18652 2.22656C7.18652 1.7959 6.87207 1.48145 6.44141 1.48145L2.64746 1.48145C1.86816 1.48145 1.41699 1.93262 1.41699 2.71875L1.41699 6.45801C1.41699 6.88184 1.73828 7.19629 2.16895 7.19629ZM9.55176 14.6543H13.3389C14.125 14.6543 14.5762 14.2031 14.5762 13.417V9.67773C14.5762 9.25391 14.2549 8.93945 13.8242 8.93945C13.4004 8.93945 13.0859 9.24707 13.0859 9.67773V10.1699L13.2295 12.3164L11.6299 10.6348L9.66113 8.65234C9.52441 8.50195 9.33984 8.43359 9.1416 8.43359C8.68359 8.43359 8.35547 8.74121 8.35547 9.19922C8.35547 9.41113 8.43066 9.5957 8.57422 9.73926L10.5566 11.7148L12.2383 13.3145L10.0781 13.1709H9.55176C9.12793 13.1709 8.80664 13.4785 8.80664 13.9092C8.80664 14.3398 9.12109 14.6543 9.55176 14.6543Z"></path></svg>
                            </Link>
                            <div className="relative inline-flex shrink-0 rounded overflow-hidden h-[28px] text-[14px] ml-[2px]">
                                <div className="select-none transition cursor-pointer flex items-center whitespace-nowrap px-[8px] font-semibold text-white bg-blue-400 hover:bg-[#2b81c2]">
                                    Thêm Xe
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full">
                        <div className="pt-[8px] w-full flex items-center justify-between">
                            <div className="flex items-center mx-[4px]">
                                <div className="relative w-[24px] h-[24px] mr-[4px]">i</div>
                                <div className="max-w-full w-full whitespace-pre-wrap break-words text-black font-bold text-xl overflow-hidden mr-[4px]">Xe</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col grow shrink-0 relative w-full">
                <div className="relative">
                    <div className="h-full overflow-auto mr-0 mb-0">
                        <div className="relative float-left min-w-full select-none pb-[15px] pl-[96px] pr-[96px]">
                            <div className="relative">
                                <div className="h-[34px]">
                                    <div style={{"overflow-x": "initial", "width": "100%"}}>
                                        <div style={{"width": "initial"}}>
                                            <div className="relative">
                                                <div className="flex bg-white z-[87] h-[34px] border-b left-0 right-0 relative border-box">
                                                    <div className="inline-flex m-0">
                                                        <div className="flex flex-row cursor-grab hover:bg-slate-100">
                                                            <div className="flex relative">
                                                                <div className="flex shrink-0 overflow-hidden text-[14px] p-0" style={{"width": "142px"}}>
                                                                    <div role="button" className="select-none flex items-center transition cursor-pointer w-full h-full pl-[8px] pr-[8px]">
                                                                        <div className="flex items-center leading-[120%] min-w-[0px] text-[14px] flex-auto">
                                                                            <div className="mr-[4px] grid justify-center items-center">
                                                                                icon
                                                                            </div>
                                                                            <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                                                Xe
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row cursor-grab hover:bg-slate-100">
                                                            <div className="flex relative">
                                                                <div className="flex shrink-0 overflow-hidden text-[14px] p-0" style={{"width": "142px"}}>
                                                                    <div role="button" className="select-none flex items-center  transition cursor-pointer w-full h-full pl-[8px] pr-[8px]">
                                                                        <div className="flex items-center leading-[120%] min-w-[0px] text-[14px] flex-auto">
                                                                            <div className="mr-[4px] grid justify-center items-center">
                                                                                icon
                                                                            </div>
                                                                            <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                                                Thầy Giáo
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative" style={{"min-width": "calc(100% - 192px)", "isolation": "auto"}}>
                                    <div className="z-[87] flex abs w-full h-full cursor-grab pointer-events-none">
                                        <div className="flex h-full" style={{"height" : "calc(100%+2px)"}}>
                                            <div className="flex border-b-[1px] w-full ">
                                                <div className="flex h-full" style={{"width": "calc(100%-64px)"}}>
                                                    <div className="flex h-full relative border-r-[1px]" style={{"width": "142px"}}>
                                                        <div className="flex overflow-x-clip h-full" style={{"width": "142px"}}>
                                                            <div className="select-none transition cursor-pointer relative block text-[14px] overflow-clip w-full whitespace-normal min-h-[32px] py-[5px] px-[8px]">
                                                                <div className="select-none transition cursor-pointer inline-flex items-center justify-center h-[22px] w-[22px] rounded-sm mr-[4px]">
                                                                    icon
                                                                </div>
                                                                <div className="leading-6 whitespace-pre-wrap break-words inline font-semibold mr-[5px]">
                                                                    28A-093.83
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex h-full relative border-r-[1px]" style={{"width": "142px"}}>
                                                        <div className="flex overflow-x-clip h-full" style={{"width": "142px"}}>
                                                            <div className="select-none transition cursor-pointer relative block text-[14px] overflow-clip w-full whitespace-normal min-h-[32px] py-[5px] px-[8px]">
                                                                <div className="select-none transition cursor-pointer inline-flex items-center justify-center h-[22px] w-[22px] rounded-sm mr-[2px]">
                                                                    car icon
                                                                </div>
                                                                <div className="leading-6 whitespace-pre-wrap break-words inline font-semibold mr-[5px]">
                                                                    
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div role="button" className="select-none transition cursor-pointer flex items-center h-[33px] w-full pl-[8px] leading-[20px] bg-white hover:bg-slate-200">
                                    <span className="text-[14px] text-[#111111]/[.5] inline-flex items-center sticky left-[40px] transition-opacity duration-200"
                                            style={{"opacity": "1"}}
                                    >
                                        <svg role="graphics-symbol" viewBox="0 0 16 16" className="w-[14px] h-[14px] block fill-[#111111]/[.5] shrink-0 ml-[1px] mr-[7px]"><path d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"></path></svg>
                                        Thêm xe
                                    </span>
                                </div>
                            </div>  
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}