// resources/js/Components/Layout/Pagination.jsx
import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/Components/Ui/Button";

export function Pagination({ currentPage, totalPages, onPageChange, showFirstLast = true }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) rangeWithDots.push(l + 1);
                else if (i - l !== 1) rangeWithDots.push("...");
            }
            rangeWithDots.push(i);
            l = i;
        });
        return rangeWithDots;
    };

    return (
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-slate-200 shadow-sm">
            {showFirstLast && (
                <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
                    <ChevronsLeft size={14} />
                </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
                <ChevronLeft size={14} />
            </Button>

            <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((page, idx) => (
                    <Button
                        key={idx}
                        variant={currentPage === page ? "primary" : "secondary"}
                        onClick={() => typeof page === "number" && onPageChange(page)}
                        disabled={page === "..."}
                        className={`h-8 min-w-[2rem] px-2 rounded-xl text-[10px] font-black transition-all ${
                            currentPage === page 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                            : "text-slate-500 hover:bg-gray-400 hover:text-white"
                        }`}
                    >
                        {page}
                    </Button>
                ))}
            </div>

            <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                <ChevronRight size={14} />
            </Button>

            {showFirstLast && (
                <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                    <ChevronsRight size={14} />
                </Button>
            )}
        </div>
    );
}