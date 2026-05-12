import React from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

function PageHeader({
    title,
    subtitle,
    statusBadge,
    searchPlaceholder,
    onSearch,
    searchValue,
    children,
    showSearch = true,
}) {
    return (
        <header className="bg-white border-b border-gray-200 pt-8 pb-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        {statusBadge && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-xl border border-primary/20">
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                    {statusBadge}
                                </span>
                            </div>
                        )}
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-600 font-medium text-base max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {children && <div className="flex-1">{children}</div>}
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="w-full max-w-md">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative bg-white border border-gray-300 p-2 rounded-xl flex items-center shadow-sm focus-within:shadow-md focus-within:border-primary transition-all">
                                <div className="pl-4 text-gray-400">
                                    <HiOutlineMagnifyingGlass className="text-lg" />
                                </div>
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={onSearch}
                                    placeholder={searchPlaceholder || "Search..."}
                                    className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-gray-400 px-4 py-3 font-medium"
                                />
                                <button className="bg-primary text-white p-3 rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition-all active:scale-95">
                                    <HiOutlineMagnifyingGlass />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

export default PageHeader;
