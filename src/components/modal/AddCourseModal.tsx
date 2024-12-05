import { useEffect, useState, Fragment } from "react";
import Blanket from "@atlaskit/blanket";
import { X } from "lucide-react";
import Form, { Field, ErrorMessage, FormFooter } from "@atlaskit/form";
import { DatePicker, DateTimePicker } from "@atlaskit/datetime-picker";
import { RadioGroup } from "@atlaskit/radio";
import Textfield from "@atlaskit/textfield";
import { collection, doc, addDoc, setDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import React from "react";
import Button from "../Button";
import Select, {
	components,
	type OptionProps,
	type SingleValueProps,
	type ValueType,
} from '@atlaskit/select';

interface CarModalProps {
    trigger: boolean;
    setTrigger: (value: boolean) => void;
}

interface Option {
	label: string;
	value: string;
}

const sates = [
	{ label: 'Chưa bắt đầu', value: 'Chưa bắt đầu' },
	{ label: 'Đang thực hiện', value: 'Đang thực hiện' },
	{ label: 'Tiếp tục', value: 'Tiếp tục' },
	{ label: 'Đã hoàn thành', value: 'Đã hoàn thành' },
];

const validateField = (value?: string) => {
    if (!value) {
        return "REQUIRED";
    }
};

export default function AddCourseModal(props: CarModalProps) {
    const [isClosing, setIsClosing] = useState(false);

    const handleAddCourse = async (data) => {
        const docRef = doc(db, "courses", data.name);
        try {
            await setDoc(docRef, {
                cars: {},
                end_date: Timestamp.fromDate(new Date(data.end_date)),
                start_date: Timestamp.fromDate(new Date(data.start_date)),
                state: data.states.value,
                createdAt: serverTimestamp(),
            });
            handleClose();
            console.log("Document added with ID:", docRef.id);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            props.setTrigger(false);
            setIsClosing(false);
        }, 200);
    };

    return props.trigger ? (
        <Fragment>
            <Blanket isTinted={true} testId="basic-blanket">
                <div className={`modal-container w-[600px] ${isClosing ? "closing" : ""}`}>
                    <section className="modal w-full bg-[#FAF7F5]">
                        <div className="flex relative items-center justify-between px-[1.5rem] pb-[1rem] pt-[1.5rem]">
                            <div className="grid grid-cols-2 w-full">
                                <div className="flex border-box justify-start">
                                    <h1 className="text-[#172B4D] font-semibold">Thêm khóa học mới</h1>
                                </div>
                                <div className="flex border-box justify-end">
                                    <button
                                        className="w-[2rem] h-[2rem] my-auto transition hover:bg-gray-200 flex justify-center rounded"
                                        onClick={() => handleClose()}
                                    >
                                        <span className="self-center">
                                            <X />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                width: "400px",
                                maxWidth: "100%",
                                margin: "0 auto",
                                flexDirection: "column",
                            }}
                        >
                            <Form onSubmit={(data) => handleAddCourse(data)}>
                                {({ formProps }: any) => (
                                    <form {...formProps}>
                                        <Field label="Tên khóa" name="name">
                                            {({ fieldProps }: any) => (
                                                <Fragment>
                                                    <Textfield placeholder="" {...fieldProps} />
                                                </Fragment>
                                            )}
                                        </Field>
                                        <Field name="start_date" label="Ngày bắt đầu" validate={validateField} isRequired defaultValue="">
                                            {({ fieldProps, error, meta: { valid } }) => (
                                                <>
                                                    <DatePicker
                                                        {...fieldProps}
                                                        defaultValue=""
                                                        clearControlLabel="Clear start day"
                                                        shouldShowCalendarButton
                                                        inputLabel="Ngày bắt đầu"
                                                        openCalendarLabel="open calendar"
                                                        locale="vi-VN"
                                                    />
                                                    {error === "REQUIRED" && <ErrorMessage>Hãy nhập ngày bắt đầu</ErrorMessage>}
                                                </>
                                            )}
                                        </Field>
                                        <Field name="end_date" label="Ngày kết thúc" validate={validateField} isRequired defaultValue="">
                                            {({ fieldProps, error, meta: { valid } }) => (
                                                <>
                                                    <DatePicker
                                                        {...fieldProps}
                                                        defaultValue=""
                                                        clearControlLabel="Clear end day"
                                                        shouldShowCalendarButton
                                                        inputLabel="Ngày kết thúc"
                                                        openCalendarLabel="open calendar"
                                                        locale="vi-VN"
                                                    />
                                                    {error === "REQUIRED" && <ErrorMessage>Hãy nhập ngày kết thúc</ErrorMessage>}
                                                </>
                                            )}
                                        </Field>
                                        <Field name="states" label="Trạng thái" defaultValue={sates[0]} >
                                            {({ fieldProps: { id, ...rest }, error }) => (
                                                <Fragment>
                                                   <Select inputId={id} {...rest} options={sates} />
                                                   {error && <ErrorMessage>{error}</ErrorMessage>}
                                                </Fragment>
                                            )}
                                        </Field>
                                        <FormFooter>
                                            <Button type="submit">Thêm mới</Button>
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
