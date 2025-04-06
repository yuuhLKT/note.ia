import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useKanbanStore } from '@/store/kanban'
import type { ColumnType, Task } from '@/types'
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DropResult,
    Droppable,
    DroppableProvided,
} from '@hello-pangea/dnd'
import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { AddTaskForm, KanbanCard, KanbanFilters } from '.'

const columns = [
    {
        id: 'TODO',
        title: 'To Do',
        color: 'border-blue-500/20 bg-blue-50/50',
        accent: 'bg-blue-500',
    },
    {
        id: 'IN_PROGRESS',
        title: 'In Progress',
        color: 'border-yellow-500/20 bg-yellow-50/50',
        accent: 'bg-yellow-500',
    },
    {
        id: 'DONE',
        title: 'Done',
        color: 'border-green-500/20 bg-green-50/50',
        accent: 'bg-green-500',
    },
] as const

interface Filters {
    search: string
    assignee: string
    label: string
    startDate: string
    endDate: string
}

export function KanbanBoard() {
    const { tasks, moveTask, syncWithDrive, syncFromDrive, isLoading } =
        useKanbanStore()
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
    const [filters, setFilters] = useState<Filters>({
        search: '',
        assignee: '',
        label: '',
        startDate: '',
        endDate: '',
    })

    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters)
    }

    const handleSync = async () => {
        try {
            // First sync local changes to Drive
            await syncWithDrive()
            // Then sync from Drive to local
            await syncFromDrive()
        } catch (error) {
            console.error('Error during sync:', error)
        }
    }

    const filterTasks = (tasks: Task[]) => {
        return tasks.filter((task) => {
            const matchesSearch = filters.search
                ? task.title
                      .toLowerCase()
                      .includes(filters.search.toLowerCase()) ||
                  task.description
                      ?.toLowerCase()
                      .includes(filters.search.toLowerCase())
                : true

            const matchesAssignee = filters.assignee
                ? task.assignee === filters.assignee
                : true

            const matchesLabel = filters.label
                ? task.labels?.includes(filters.label)
                : true

            const matchesDate = () => {
                if (!filters.startDate && !filters.endDate) return true
                if (!task.dueDate) return false

                const taskDate = new Date(task.dueDate)
                const startDate = filters.startDate
                    ? new Date(filters.startDate)
                    : null
                const endDate = filters.endDate
                    ? new Date(filters.endDate)
                    : null

                if (startDate && taskDate < startDate) return false
                if (endDate && taskDate > endDate) return false
                return true
            }

            return (
                matchesSearch &&
                matchesAssignee &&
                matchesLabel &&
                matchesDate()
            )
        })
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const { draggableId, destination } = result
        moveTask(draggableId, destination.droppableId as ColumnType)
    }

    const filteredTasks = filterTasks(tasks)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kanban Board</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                        />
                        Sync
                    </Button>
                    <KanbanFilters
                        tasks={tasks}
                        onFilterChange={handleFilterChange}
                    />
                    <Dialog
                        open={isAddTaskOpen}
                        onOpenChange={setIsAddTaskOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Task</DialogTitle>
                                <DialogDescription>
                                    Create a new task for your Kanban board
                                </DialogDescription>
                            </DialogHeader>
                            <AddTaskForm
                                onClose={() => setIsAddTaskOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map((column) => {
                        const columnTasks = filteredTasks.filter(
                            (task) => task.column === column.id
                        )

                        return (
                            <div
                                key={`column-${column.id}`}
                                className="space-y-4"
                            >
                                <div
                                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${column.color} ${column.accent} border-l-4`}
                                >
                                    <h3 className="font-semibold">
                                        {column.title}
                                    </h3>
                                    <span className="text-sm text-muted-foreground bg-white/50 px-2 py-1 rounded-full text-black">
                                        {columnTasks.length} tasks
                                    </span>
                                </div>
                                <Droppable droppableId={column.id}>
                                    {(provided: DroppableProvided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`space-y-2 min-h-[200px] p-4 rounded-lg ${column.color} border`}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <Draggable
                                                    key={`task-${task.id}`}
                                                    draggableId={task.id}
                                                    index={index}
                                                >
                                                    {(
                                                        provided: DraggableProvided
                                                    ) => (
                                                        <div
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <KanbanCard
                                                                task={task}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )
                    })}
                </div>
            </DragDropContext>
        </div>
    )
}
