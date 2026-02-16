import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const JobListing = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ search: '', skill: '', location: '', minBudget: '', maxBudget: '' });
    const [showFilters, setShowFilters] = useState(false);

    const fetchJobs = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 9, status: 'open' });
            if (filters.search) params.append('search', filters.search);
            if (filters.skill) params.append('skill', filters.skill);
            if (filters.location) params.append('location', filters.location);
            if (filters.minBudget) params.append('minBudget', filters.minBudget);
            if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);

            const res = await api.get(`/jobs?${params}`);
            setJobs(res.data.data.jobs);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []); // eslint-disable-line

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs(1);
    };

    const clearFilters = () => {
        setFilters({ search: '', skill: '', location: '', minBudget: '', maxBudget: '' });
        setTimeout(() => fetchJobs(1), 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Jobs</h1>
                    <p className="text-gray-500">Find your next opportunity</p>
                </div>

                {/* Search & Filter Bar */}
                <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Search jobs..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <FaFilter className="text-indigo-500" /> Filters
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                            Search
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                            <input
                                type="text"
                                value={filters.skill}
                                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                                placeholder="Skill (e.g. plumbing)"
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                placeholder="Location"
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <input
                                type="number"
                                value={filters.minBudget}
                                onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                                placeholder="Min Budget (₹)"
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <input
                                type="number"
                                value={filters.maxBudget}
                                onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                                placeholder="Max Budget (₹)"
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <button type="button" onClick={clearFilters} className="text-sm text-red-500 flex items-center gap-1 hover:text-red-600">
                                <FaTimes /> Clear Filters
                            </button>
                        </div>
                    )}
                </form>

                {/* Jobs Grid */}
                {loading ? (
                    <LoadingSkeleton type="card" count={6} />
                ) : jobs.length === 0 ? (
                    <div className="text-center py-16">
                        <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600">No jobs found</h3>
                        <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <JobCard key={job._id} job={job} />
                            ))}
                        </div>
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={fetchJobs}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default JobListing;
