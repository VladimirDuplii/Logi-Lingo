import React from "react";
import { ToastProvider } from "@/Components/Toast";
import DuoSidebarNav from "@/Components/Layout/DuoSidebarNav";

export default function DuoLayout({
    children,
    right = null,
    centerMaxClass = "",
    currentPath,
}) {
    const path =
        typeof window !== "undefined"
            ? window.location.pathname
            : currentPath || "/";
    const centerClass = centerMaxClass
        ? `min-w-0 w-full flex-auto ${centerMaxClass}`
        : `min-w-0 w-full ${right ? "xl:basis-2/3" : ""}`;
    return (
        <ToastProvider>
            <div id="app-shell" className="w-full">
                <DuoSidebarNav current={path} />
                <div
                    id="main-content"
                    className="flex justify-center gap-3 px-4 pt-14 sm:px-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12"
                >
                    <div id="content-center" className={centerClass}>
                        {children}
                    </div>
                    {right && (
                        <div
                            id="sidebar-right"
                            className="hidden xl:block shrink-0 min-w-[320px] max-w-[400px] w-[400px]"
                        >
                            {right}
                        </div>
                    )}
                </div>
            </div>
        </ToastProvider>
    );
}
