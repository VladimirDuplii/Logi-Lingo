import React from "react";

export default function LeftSidebar({ className = "" }) {
    return (
        <div className={className}>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold uppercase text-gray-500">
                    Menu
                </div>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                    <li>
                        <a href="/dashboard" className="hover:text-gray-900">
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="/courses" className="hover:text-gray-900">
                            Courses
                        </a>
                    </li>
                    <li>
                        <a href="/profile" className="hover:text-gray-900">
                            Profile
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
