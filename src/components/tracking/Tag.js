export default function Tag({ text, background }) {
    return (
        <span
            className={`inline-flex items-center text-[14px] font-semibold min-w-0 h-[15px] mx-[2px] my-[4px] p-0 relative rouned cursor-default rounded text-[#282425]`}
            style={{ backgroundColor: background }}
        >
            <span className="overflow-hidden px-[4px] overflow-ellipsis nowrap">{text}</span>
        </span>
    );
}
