import { Button } from '@/components/ui/button'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import type { Task } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Filter, Search, X } from 'lucide-react'
import { useState } from 'react'

interface KanbanFiltersProps {
    tasks: Task[]
    onFilterChange: (filters: {
        search: string
        assignee: string
        label: string
        startDate: string
        endDate: string
    }) => void
}

export function KanbanFilters({ tasks, onFilterChange }: KanbanFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [assignee, setAssignee] = useState('')
    const [label, setLabel] = useState('')
    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()

    const uniqueAssignees = Array.from(
        new Set(tasks.map((task) => task.assignee).filter(Boolean))
    )
    const uniqueLabels = Array.from(
        new Set(tasks.flatMap((task) => task.labels || []))
    )

    const handleFilterChange = () => {
        onFilterChange({
            search,
            assignee,
            label,
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        })
        setIsOpen(false)
    }

    const clearFilters = () => {
        setSearch('')
        setAssignee('')
        setLabel('')
        setStartDate(undefined)
        setEndDate(undefined)
        onFilterChange({
            search: '',
            assignee: '',
            label: '',
            startDate: '',
            endDate: '',
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filter Tasks</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Assignee
                            </label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            >
                                <option value="">All assignees</option>
                                {uniqueAssignees.map((assignee) => (
                                    <option key={assignee} value={assignee}>
                                        {assignee}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Label</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            >
                                <option value="">All labels</option>
                                {uniqueLabels.map((label) => (
                                    <option key={label} value={label}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Start Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {startDate ? (
                                            format(startDate, 'dd/MM/yyyy', {
                                                locale: ptBR,
                                            })
                                        ) : (
                                            <span>Select a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarPicker
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                End Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {endDate ? (
                                            format(endDate, 'dd/MM/yyyy', {
                                                locale: ptBR,
                                            })
                                        ) : (
                                            <span>Select a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarPicker
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                    <Button onClick={handleFilterChange}>Apply Filters</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
