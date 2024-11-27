export default function Tag({text, background}) {
    return (
        <span className={`inline-flex items-center text-[11px] min-w-0 h-[15px] mx-[3px] my-[2px] p-0 relative rouned cursor-default rounded`}
            style={{"backgroundColor" : background}}>
            <span className="overflow-hidden px-[4px] overflow-ellipsis nowrap">{text}</span>
        </span>
    )
}