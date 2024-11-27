export default function CarModal(props) {
    return (props.trigger ? (
            <>
                <div className='fixed left-0 right-0 bottom-1 w-full h-screen mx-auto z-[997] flex justify-center'>
                    hi
                    <button className="w-10 h-10" onClick={() => props.setTrigger(false)}>
                        close
                    </button>
                </div>
                
            </>
        ) : null
    );
}