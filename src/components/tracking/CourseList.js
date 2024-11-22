import { Pencil } from 'lucide-react';

export default function CourseList({name, state}) {
    return <div className="flex flex-col relate border-box w-[280px] h-[600px] max-h-full pb-[8px] rounded-xl bg-[#F1F2F4] align-top whitespace-normal scroll-m-[8px]">
        <div className="flex relative grow flex-wrap items-start justify-between px-[8px] pt-[8px]"> 
            <div className="relative flex items-start grow pt-[8px] px-[8px] shrink min-h-[35px] text-[#172b4d]">
                <h2 className="block px-[6px] pr-[8px] pl-[12px] bg-transparent text-[25px] font-semibold whitespace-normal leading-5">{name}</h2>
            </div>
            <div className="inline-block text-base pt-[3px] pr-[8px]">
                <div className="bg-green-300 text-green-800 px-2 py-1 rounded-full">
                    {state}
                </div>
            </div>
            <div className='w-[18px] h-[18px] mt-[10px] cursor-pointer'>
                <Pencil className='w-full h-full'/>
            </div>
        </div>
        <div>
            body
        </div>
    </div>
}