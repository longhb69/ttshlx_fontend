import React from "react";

const Tag = React.memo(
    ({ text, number_of_students, background }) => {
        return (
            <div
                className={`items-center text-[14px] p-1 font-semibold relative rounded cursor-default text-[#282425]`}
                style={{ backgroundColor: background }}
            >
                <span className="overflow-hidden overflow-ellipsis nowrap">
                    {text} <span>:</span> {number_of_students}
                </span>
            </div>
        );
    },
    (prevProps, nextProps) => {
        // Custom comparison logic (optional)
        return (
            prevProps.text === nextProps.text &&
            prevProps.number_of_students === nextProps.number_of_students &&
            prevProps.background === nextProps.background
        );
    }
);

export default Tag;
