import TaskBlock from "../components/TaskBlock"

const task = [
    {
        name: "task1"
    },
    {
        name: "task2"
    }
]

export default function Accountant() {
    return (
        <div>
            Ke toan
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
                <button>Add Task</button>
            </div>
            <TaskBlock name = { task[0].name} />
        </div>
    )
}