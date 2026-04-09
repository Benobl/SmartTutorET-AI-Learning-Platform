"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import Link from "next/link"
import React from "react"

export function BreadcrumbNav() {
    const pathname = usePathname()
    const paths = pathname.split("/").filter((path) => path !== "")

    return (
        <Breadcrumb className="mb-6">
            <BreadcrumbList className="text-white/40">
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {paths.map((path, index) => {
                    const href = `/${paths.slice(0, index + 1).join("/")}`
                    const isLast = index === paths.length - 1
                    const title = path.charAt(0).toUpperCase() + path.slice(1)

                    return (
                        <React.Fragment key={path}>
                            <BreadcrumbSeparator className="opacity-20" />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="text-white font-medium">{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={href} className="hover:text-white transition-colors">{title}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
