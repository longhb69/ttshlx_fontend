import { useEffect, useState, Fragment } from "react";
import Blanket from "@atlaskit/blanket";
import { Frown, X } from "lucide-react";
import Form, { Field, ErrorMessage, FormFooter } from "@atlaskit/form";
import { DatePicker, DateTimePicker } from "@atlaskit/datetime-picker";
import { RadioGroup } from "@atlaskit/radio";
import Textfield from "@atlaskit/textfield";
import React from "react";

interface CarModalProps {
    trigger: boolean;
    setTrigger: (value: boolean) => void;
}

const validateField = (value?: string) => {
    if (!value) {
        return "REQUIRED";
    }
};

export default function CarModal(props: CarModalProps) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        console.log("WTF");
        setTimeout(() => {
            props.setTrigger(false);
            setIsClosing(false);
        }, 200);
    };

    return props.trigger ? (
        <Fragment>
            <Blanket isTinted={true} testId="basic-blanket">
                <div className={`modal-container ${isClosing ? "closing" : ""}`}>
                    <section className="modal bg-[#FAF7F5]">
                        <div className="flex relative items-center justify-between px-[1.5rem] pb-[1rem] pt-[1.5rem]">
                            <div className="grid grid-cols-2 w-full">
                                <div className="flex border-box justify-start">
                                    <h1 className="text-[#172B4D] font-semibold">Thêm một xe mới</h1>
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
                            <Form
                                onSubmit={(data) => {
                                    console.log("form data", data);
                                }}
                            >
                                {({ formProps }: any) => (
                                    <form {...formProps}>
                                        <Field label="Biển số" name="plate">
                                            {({ fieldProps }: any) => (
                                                <Fragment>
                                                    <Textfield placeholder="" {...fieldProps} />
                                                </Fragment>
                                            )}
                                        </Field>
                                        <Field name="datepicker-validation" label="Start day" validate={validateField} isRequired defaultValue="">
                                            {({ fieldProps, error, meta: { valid } }) => (
                                                <>
                                                    <DatePicker
                                                        {...fieldProps}
                                                        defaultValue=""
                                                        clearControlLabel="Clear start day"
                                                        shouldShowCalendarButton
                                                        inputLabel="Ngày hết đăng kiểm"
                                                        openCalendarLabel="open calendar"
                                                        locale="vi-VN"
                                                    />
                                                    {error === "REQUIRED" && <ErrorMessage>Hãy nhập ngày hết đăng kiểm</ErrorMessage>}
                                                </>
                                            )}
                                        </Field>
                                        <Field label="Thầy giáo" name="teacher">
                                            {({ fieldProps }: any) => (
                                                <Fragment>
                                                    <Textfield placeholder="" {...fieldProps} />
                                                </Fragment>
                                            )}
                                        </Field>
                                        <Field name="car_class" defaultValue="" label="Hạng xe">
                                            {({ fieldProps }) => (
                                                <RadioGroup
                                                    options={[
                                                        { name: "C", value: "C", label: "C" },
                                                        {
                                                            name: "B1+B2",
                                                            value: "B1+B2",
                                                            label: "B1+B2",
                                                        },
                                                        {
                                                            name: "B11",
                                                            value: "B11",
                                                            label: "B11",
                                                        },
                                                    ]}
                                                    {...fieldProps}
                                                />
                                            )}
                                        </Field>
                                        <FormFooter>
                                            <button type="submit">Submit</button>
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
