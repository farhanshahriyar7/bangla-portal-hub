"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

type Calendar22Props = {
  value?: Date | undefined
  onChange?: (date?: Date) => void
  label?: string
  id?: string
}
export function Calendar22({ value, onChange, label, id }: Calendar22Props) {
  const [open, setOpen] = React.useState(false)
  const date = value

  // viewMonth controls which month the calendar displays (used for month/year selectors)
  const [viewMonth, setViewMonth] = React.useState<Date>(date ?? new Date())

  // keep viewMonth in sync when the selected value changes externally
  React.useEffect(() => {
    if (value) setViewMonth(value)
  }, [value])

  const months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ]

  const currentYear = new Date().getFullYear()
  const startYear = 1900
  const futureYears = 5
  const years = Array.from({ length: currentYear - startYear + 1 + futureYears }, (_, i) => startYear + i)

  const handleMonthChange = (m: number) => {
    const newDate = new Date(viewMonth.getFullYear(), m, 1)
    setViewMonth(newDate)
  }

  const handleYearChange = (y: number) => {
    const newDate = new Date(y, viewMonth.getMonth(), 1)
    setViewMonth(newDate)
  }

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id ?? 'date'}
            className="w-48 justify-between font-normal"
          >
            {date ? format(date, "MM/dd/yyyy") : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-2">
                <div className="w-36">
                  <Select value={String(viewMonth.getMonth())} onValueChange={(v) => handleMonthChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m, idx) => (
                        <SelectItem key={m} value={String(idx)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-28">
                  <Select value={String(viewMonth.getFullYear())} onValueChange={(v) => handleYearChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Calendar
              mode="single"
              selected={date}
              month={viewMonth}
              onSelect={(d) => {
                onChange?.(d)
                setOpen(false)
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default Calendar22
