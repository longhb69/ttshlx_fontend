import { useEffect, useState, Fragment } from "react";
import Blanket from "@atlaskit/blanket";
import { X } from "lucide-react";
import Form, { Field, ErrorMessage, FormFooter } from "@atlaskit/form";
import { DatePicker, DateTimePicker } from "@atlaskit/datetime-picker";
import { RadioGroup } from "@atlaskit/radio";
import Textfield from "@atlaskit/textfield";
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc, Timestamp, serverTimestamp, FieldValue, deleteField } from "firebase/firestore";
import { db } from "../../config/firebase";
import React from "react";
import Button from "../Button";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestampV2";

const encodeKey = (key) => key.replace(/\./g, "_DOT_");
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

interface Car {
    plate: string;
    expiry_date: { seconds: number }; // Adjust this type based on your actual structure
    owner_name: string;
    car_class: string;
    available_slot: number; // Adjust type if necessary
    current_slot: number; // Adjust type if necessary
    courses?: Array<{ name: string; number_of_students: number }>; // Optional property
}

interface EditCarModalProps {
    trigger: boolean;
    setTrigger: (value: boolean) => void;
    car: Car;
}

export default function EditCarModal(props: EditCarModalProps) {
    const [isClosing, setIsClosing] = useState(false);

    //to do update in courses V
    const handleEditCar = async (data) => {
        const docRef = doc(db, "cars", data.plate);
        try {
            if(data.plate !== props.car.plate) {
                const updatePromises = (props.car.courses || []).map(async (course) => {
                    const oldCarRef = doc(db, "cars", props.car.plate)
                    await deleteDoc(oldCarRef)
                    
                    const coursesRef = doc(db, "courses", course.name)
                    const docSnap = await getDoc(coursesRef)
                    if (docSnap.exists()) {
                        const oldData = docSnap.data();
                        const info = oldData.cars[`${encodeKey(props.car.plate)}`]
                        await updateDoc(coursesRef, {
                            [`cars.${encodeKey(data.plate)}`] : info,
                            [`cars.${encodeKey(props.car.plate)}`]: deleteField()
                        })

                    }
                })
                await Promise.all(updatePromises);
            }
            await setDoc(docRef, {
                available_slot: props.car.available_slot,
                car_class: data.car_class,
                courses: props.car.courses,
                current_slot: props.car.current_slot,
                expiry_date: Timestamp.fromDate(new Date(data.expiry_date)),
                owner_name: data.teacher,
                plate: data.plate,
            });
            handleClose();
            console.log("Document updated with ID:", docRef.id);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            props.setTrigger(false);
            setIsClosing(false);
        }, 200);
    };

    useEffect(() => {
        console.log("Mount");
    }, []);

    return props.trigger ? (
        <Fragment>
            <Blanket isTinted={true} testId="edit-car-blanket">
                <div className={`modal-container w-[600px] ${isClosing ? "closing" : ""}`}>
                    <section className="modal pb-4 w-full bg-[#FAF7F5]">
                        <div className="flex relative items-center justify-between px-[1.5rem] pb-[1rem] pt-[1.5rem]">
                            <h1 className="text-[#172B4D] font-semibold">Chỉnh sửa xe</h1>
                            <button onClick={handleClose}>
                                <X />
                            </button>
                        </div>
                        <div style={{ display: "flex", width: "400px", margin: "0 auto", flexDirection: "column" }}>
                            <Form onSubmit={(data) => handleEditCar(data)}>
                                {({ formProps }: any) => (
                                    <form {...formProps}>
                                        <Field label="Biển số" name="plate" defaultValue={props.car.plate}>
                                            {({ fieldProps }: any) => <Textfield placeholder="" {...fieldProps} />}
                                        </Field>
                                        <Field
                                            name="expiry_date"
                                            label="Ngày hết đăng kiểm"
                                            defaultValue={formatFirebaseTimestamp(props.car.expiry_date)}
                                        >
                                            {({ fieldProps }) => <DatePicker {...fieldProps} inputLabel="Ngày hết đăng kiểm" locale="vi-VN" />}
                                        </Field>
                                        <Field label="Thầy giáo" name="teacher" defaultValue={props.car.owner_name}>
                                            {({ fieldProps }: any) => <Textfield placeholder="" {...fieldProps} />}
                                        </Field>
                                        <Field name="car_class" defaultValue={props.car.car_class} label="Hạng xe">
                                            {({ fieldProps }) => (
                                                <RadioGroup
                                                    options={[
                                                        { name: "C", value: "C", label: "C" },
                                                        { name: "B1+B2", value: "B1+B2", label: "B1+B2" },
                                                        { name: "B11", value: "B11", label: "B11" },
                                                    ]}
                                                    {...fieldProps}
                                                />
                                            )}
                                        </Field>
                                        <FormFooter>
                                            <Button type="submit">Cập nhật</Button>
                                        </FormFooter>
                                    </form>
                                )}
                            </Form>
                        </div>
                    </section>
                </div>
            </Blanket>
        </Fragment>
    ) : null;
}
