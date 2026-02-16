import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <FaChevronLeft className="text-sm" />
            </button>

            {start > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-indigo-50 transition-colors">1</button>
                    {start > 2 && <span className="text-gray-400">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-lg border transition-colors ${page === currentPage
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 hover:bg-indigo-50'
                        }`}
                >
                    {page}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="text-gray-400">...</span>}
                    <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-indigo-50 transition-colors">{totalPages}</button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <FaChevronRight className="text-sm" />
            </button>
        </div>
    );
};

export default Pagination;
