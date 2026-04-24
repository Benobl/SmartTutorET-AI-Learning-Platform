import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { adminUserList, adminTutorList, adminManagerList, adminStats, analyticsData } from "./admin-mock-data"

/**
 * Filter users based on search query, role, and status.
 */
export const filterUsers = (query: string, role: string, status: string) => {
    return adminUserList.filter(user => {
        const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            user.id.toLowerCase().includes(query.toLowerCase())
        const matchesRole = role === "All Roles" || user.role === role
        const matchesStatus = status === "All Status" || user.status === status
        return matchesQuery && matchesRole && matchesStatus
    })
}

/**
 * Filter tutors based on search query, status, and subjects.
 */
export const filterTutors = (query: string, status: string) => {
    return adminTutorList.filter(tutor => {
        const matchesQuery = tutor.name.toLowerCase().includes(query.toLowerCase()) ||
            tutor.email.toLowerCase().includes(query.toLowerCase()) ||
            tutor.subjects.some(s => s.toLowerCase().includes(query.toLowerCase()))
        const matchesStatus = status === "All Status" || tutor.status === status
        return matchesQuery && matchesStatus
    })
}

/**
 * Filter managers based on search query, department, and status.
 */
export const filterManagers = (query: string, status: string) => {
    return adminManagerList.filter(manager => {
        const matchesQuery = manager.name.toLowerCase().includes(query.toLowerCase()) ||
            manager.email.toLowerCase().includes(query.toLowerCase()) ||
            manager.department.toLowerCase().includes(query.toLowerCase())
        const matchesStatus = status === "All Status" || manager.status === status
        return matchesQuery && matchesStatus
    })
}

/**
 * Filter students based on search query and status.
 */
export const filterStudents = (query: string, status: string) => {
    return adminUserList.filter(user => {
        if (user.role !== "Student") return false
        const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            (user.grade && user.grade.toLowerCase().includes(query.toLowerCase()))
        const matchesStatus = status === "All Status" || user.status === status
        return matchesQuery && matchesStatus
    })
}

/**
 * Get stats for a specific timeframe.
 */
export const getStatsByTimeframe = (timeframe: "day" | "week" | "month" | "year") => {
    return adminStats[timeframe]
}

/**
 * Get analytics data for a specific timeframe.
 */
export const getAnalyticsByTimeframe = (timeframe: "day" | "week" | "month" | "year") => {
    if (timeframe === "day") return analyticsData.week // Use week data for day view for better visualization
    return analyticsData[timeframe as "week" | "month" | "year"]
}

/**
 * Export data to CSV.
 */
export const exportToCSV = (data: any[], fileName: string) => {
    if (!data.length) return

    const headers = Object.keys(data[0]).join(",")
    const rows = data.map(obj => Object.values(obj).join(",")).join("\n")
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${fileName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Export data to PDF using jsPDF.
 */
export const exportToPDF = (data: any[], title: string, fileName: string) => {
    if (!data.length) return

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    const headers = [Object.keys(data[0])]
    const rows = data.map(obj => Object.values(obj))

        ; (doc as any).autoTable({
            head: headers,
            body: rows,
            startY: 40,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillStyle: "f", fillColor: [59, 130, 246] }, // Blue-500
        })

    doc.save(`${fileName}.pdf`)
}
