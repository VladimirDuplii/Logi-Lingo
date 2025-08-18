import React from "react";

const NavItem = ({ href = "#", active = false, icon, label }) => {
    const base =
        "flex grow items-center gap-3 rounded-xl px-2 py-1 text-sm font-bold uppercase";
    const activeCls = "border-2 border-[#84d8ff] bg-[#ddf4ff] text-blue-400";
    const inactiveCls = "text-gray-400 hover:bg-gray-100";
    return (
        <li className="flex flex-1">
            <a
                href={href}
                className={`${base} ${active ? activeCls : inactiveCls}`}
            >
                {icon}
                <span className="sr-only lg:not-sr-only">{label}</span>
            </a>
        </li>
    );
};

export default function DuoSidebarNav({ current = "/" }) {
    const isActive = (path) => current.startsWith(path);
    return (
        <nav
            id="nav-left"
            className="fixed bottom-0 left-0 top-0 hidden flex-col gap-5 border-r-2 border-[#e5e5e5] bg-white p-3 md:flex lg:w-64 lg:p-5"
        >
            <a
                className="mb-5 ml-5 mt-5 hidden text-3xl font-bold text-[#58cc02] lg:block"
                href="/courses"
            >
                LogicLingo
            </a>
            <ul className="flex flex-col items-stretch gap-3">
                <NavItem
                    href="/courses"
                    active={isActive("/courses")}
                    label="Learn"
                    icon={
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            className="h-[50px] w-[50px]"
                        >
                            <path
                                d="M24.5852 25.2658C24.2883 26.8243 22.9257 27.9519 21.3392 27.9519H10.6401C9.05354 27.9519 7.69094 26.8243 7.39408 25.2658L4.98096 12.5969L15.9001 4.52225L26.9988 12.5941L24.5852 25.2658Z"
                                fill="#FFC800"
                            />
                            <path
                                opacity=".5"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M13.1558 23.1111C13.1558 22.522 13.6333 22.0444 14.2224 22.0444H18.4891C19.0782 22.0444 19.5558 22.522 19.5558 23.1111C19.5558 23.7002 19.0782 24.1778 18.4891 24.1778H14.2224C13.6333 24.1778 13.1558 23.7002 13.1558 23.1111Z"
                                fill="#945151"
                            />
                            <path
                                d="M19.4785 16.2998C19.4785 18.2208 17.9212 19.778 16.0002 19.778C14.0792 19.778 12.522 18.2208 12.522 16.2998C12.522 14.3788 14.0792 12.8215 16.0002 12.8215C17.9212 12.8215 19.4785 14.3788 19.4785 16.2998Z"
                                fill="#945151"
                            />
                            <path
                                d="M16.1685 2.84462C16.6431 2.84231 17.1233 2.98589 17.5361 3.28558L29.9455 12.2319C30.9781 12.9822 31.207 14.4275 30.4568 15.4601C29.7067 16.4924 28.262 16.7215 27.2294 15.9719L16.1602 7.99185L5.09208 15.9712C4.05865 16.7213 2.61395 16.4923 1.86391 15.4599C1.11367 14.4273 1.34258 12.982 2.3752 12.2318L14.7839 3.28596C15.2022 2.98229 15.6887 2.83889 16.1685 2.84462Z"
                                fill="#FF4B4B"
                            />
                        </svg>
                    }
                />
                <NavItem
                    href="/shop"
                    active={isActive("/shop")}
                    label="Shop"
                    icon={
                        <svg
                            width="46"
                            height="46"
                            viewBox="0 0 46 46"
                            fill="none"
                            className="h-[50px] w-[50px]"
                        >
                            <path
                                d="M40 36V17H6V36C6 38.2091 7.73969 40 9.88571 40H36.1143C38.2603 40 40 38.2091 40 36Z"
                                fill="#A56644"
                            ></path>
                            <path
                                d="M4 10C4 7.79086 5.79086 6 8 6H17V17H4V10Z"
                                fill="#EA2B2B"
                            ></path>
                            <path
                                d="M4 17H17V17.5C17 21.0899 14.0899 24 10.5 24C6.91015 24 4 21.0899 4 17.5V17Z"
                                fill="#FF4945"
                            ></path>
                            <path
                                d="M17 17H29V17.5C29 21.0899 26.3137 24 23 24C19.6863 24 17 21.0899 17 17.5V17Z"
                                fill="white"
                            ></path>
                            <path
                                d="M29 17H42V17.5C42 21.0899 39.0899 24 35.5 24C31.9101 24 29 21.0899 29 17.5V17Z"
                                fill="#FF4945"
                            ></path>
                            <path d="M17 6H29V17H17V6Z" fill="#D0D0D0"></path>
                            <path
                                d="M29 6H38C40.2091 6 42 7.79086 42 10V17H29V6Z"
                                fill="#EA2B2B"
                            ></path>
                            <path
                                d="M11 30C11 28.8954 11.8954 28 13 28H18C19.1046 28 20 28.8954 20 30V40H11V30Z"
                                fill="#B9E8FF"
                            ></path>
                            <path
                                d="M24 30C24 28.8954 24.8954 28 26 28H34C35.1046 28 36 28.8954 36 30V34C36 35.1046 35.1046 36 34 36H26C24.8954 36 24 35.1046 24 34V30Z"
                                fill="#B9E8FF"
                            ></path>
                        </svg>
                    }
                />
                <NavItem
                    href="/profile"
                    active={isActive("/profile")}
                    label="Profile"
                    icon={
                        <svg
                            width="46"
                            height="46"
                            viewBox="0 0 46 46"
                            fill="none"
                            className="h-[50px] w-[50px]"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M23.1826 5.00195C14.3461 5.00195 7.18262 12.1654 7.18262 21.002V21.9375C4.21918 23.4102 2.18262 26.4682 2.18262 30.002C2.18262 34.9725 6.21206 39.002 11.1826 39.002H35.1826C40.1532 39.002 44.1826 34.9725 44.1826 30.002C44.1826 26.4682 42.1461 23.4102 39.1826 21.9375V21.002C39.1826 12.1654 32.0192 5.00195 23.1826 5.00195Z"
                                fill="#9069CD"
                            ></path>
                            <path
                                d="M11.1826 21.002C11.1826 14.3745 16.5552 9.00195 23.1826 9.00195C29.81 9.00195 35.1826 14.3745 35.1826 21.002V29.002C35.1826 35.6294 29.81 41.002 23.1826 41.002C16.5552 41.002 11.1826 35.6294 11.1826 29.002V21.002Z"
                                fill="#F3AD6D"
                            ></path>
                        </svg>
                    }
                />
                {/* More button placeholder */}
                <div
                    className="relative flex grow cursor-default items-center gap-3 rounded-xl px-2 py-1 font-bold uppercase text-gray-400 hover:bg-gray-100"
                    role="button"
                    tabIndex={0}
                >
                    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                        <circle
                            cx="23"
                            cy="23"
                            r="19"
                            fill="#CE82FF"
                            stroke="#CE82FF"
                            strokeWidth="2"
                        ></circle>
                        <circle cx="15" cy="23" r="2" fill="white"></circle>
                        <circle cx="23" cy="23" r="2" fill="white"></circle>
                        <circle cx="31" cy="23" r="2" fill="white"></circle>
                    </svg>
                    <span className="hidden text-sm lg:inline">More</span>
                </div>
            </ul>
        </nav>
    );
}
