import Blanket from "@atlaskit/blanket";
import { X } from "lucide-react";
import { useState } from "react";
import Button from "../Button";

export default function DeleteCourseModal({trigger, setTrigger, course, deleteCourse}) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setTrigger(false);
            setIsClosing(false);
        }, 200);
    };
    return trigger ?
        <Blanket isTinted={true}>
            <div className={`modal-container w-[600px] ${isClosing ? "closing" : ""}`}>
                <section className="modal mt-[20%] p-4 w-full bg-[#FAF7F5]">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="">Xác nhận xoá khoá học <span className="font-semibold">{course.id}</span></div>
                            <Button onClick={() => deleteCourse()}>Đồng ý</Button>
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
                </section>
            </div>
        </Blanket>
    : null
}