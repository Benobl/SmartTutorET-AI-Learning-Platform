"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Search, Download, Printer, Filter, MoreHorizontal, ChevronRight, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Column<T> {
    header: string
    accessorKey: keyof T | string
    cell?: (item: T) => React.ReactNode
    className?: string
}

interface ModernDataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    title?: string
    description?: string
    searchPlaceholder?: string
    onRowClick?: (item: T) => void
    actions?: React.ReactNode
    filterComponent?: React.ReactNode
}

export function ModernDataTable<T extends { id?: string | number }>({
    data,
    columns,
    title,
    description,
    searchPlaceholder = "Search records...",
    onRowClick,
    actions,
    filterComponent,
}: ModernDataTableProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data
        return data.filter((item) => {
            return Object.values(item as any).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
        })
    }, [data, searchQuery])

    return (
        <div className="space-y-6">
            {/* Table Header / Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                {(title || description) && (
                    <div className="space-y-1">
                        {title && <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>}
                        {description && <p className="text-sm font-medium text-slate-500">{description}</p>}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-white border-slate-200 rounded-2xl focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {filterComponent}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-2xl border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-100 hover:bg-sky-50 transition-all shrink-0"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-2xl border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-100 hover:bg-sky-50 transition-all shrink-0"
                        >
                            <Printer className="w-4 h-4" />
                        </Button>
                        {actions}
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="relative bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden group/table-container">
                <div className="overflow-x-auto no-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100/50 bg-slate-50/50">
                                {columns.map((col, idx) => (
                                    <TableHead
                                        key={idx}
                                        className={cn(
                                            "h-14 text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 first:pl-8 last:pr-8",
                                            col.className
                                        )}
                                    >
                                        {col.header}
                                    </TableHead>
                                ))}
                                {onRowClick && (
                                    <TableHead className="w-[80px] h-14 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8" />
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, rowIdx) => (
                                    <TableRow
                                        key={item.id ?? rowIdx}
                                        onClick={() => onRowClick?.(item)}
                                        className={cn(
                                            "group/row border-slate-100/50 transition-all duration-300",
                                            onRowClick && "cursor-pointer hover:bg-slate-50/80"
                                        )}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <TableCell
                                                key={colIdx}
                                                className={cn(
                                                    "py-5 px-6 first:pl-8 last:pr-8 font-medium text-slate-600 group-hover/row:text-slate-900 transition-colors",
                                                    col.className
                                                )}
                                            >
                                                {col.cell ? col.cell(item) : (item as any)[col.accessorKey]}
                                            </TableCell>
                                        ))}
                                        {onRowClick && (
                                            <TableCell className="text-right pr-8">
                                                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-1 group-hover/row:bg-sky-50 group-hover/row:text-sky-500 transition-all duration-300">
                                                    <ChevronRight className="h-4 w-4" />
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (onRowClick ? 1 : 0)} className="h-[400px] text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mb-4 text-slate-200">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">No Results Found</h4>
                                            <p className="text-sm font-medium leading-relaxed italic opacity-70">
                                                {searchQuery
                                                    ? `We couldn't find any match for "${searchQuery}". Please try another search term.`
                                                    : "There are currently no records available in this section."
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Optional: Footer with Pagination Info */}
                <div className="flex items-center justify-between px-8 py-5 bg-slate-50/30 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {filteredData.length} of {data.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                        {/* Mock Pagination */}
                        <Button variant="ghost" disabled size="sm" className="h-8 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-400">Prev</Button>
                        <Button variant="ghost" disabled size="sm" className="h-8 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-400">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
