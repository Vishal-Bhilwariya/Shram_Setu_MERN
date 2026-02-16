import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    if (type === 'card') {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skeletons.map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                        <div className="flex gap-2 mb-4">
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </div>
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-4">
                {skeletons.map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'profile') {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 animate-pulse max-w-2xl mx-auto">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return null;
};

export default LoadingSkeleton;
