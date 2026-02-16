import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { FaBriefcase, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaStar } from 'react-icons/fa';

const WorkerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appsRes, jobsRes] = await Promise.all([
                    api.get('/applications/my-applications'),
                    api.get('/jobs?limit=6&status=open'),
                ]);
                setApplications(appsRes.data.data.applications);
                setRecentJobs(jobsRes.data.data.jobs);
                setPagination(jobsRes.data.pagination || { totalPages: 1 });
            } catch (err) {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statusCounts = {
        pending: applications.filter((a) => a.status === 'pending').length,
        accepted: applications.filter((a) => a.status === 'accepted').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
    };

    if (loading) return <div className="py-8 container mx-auto px-4"><LoadingSkeleton type="card" count={3} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user?.firstName}!</h1>
                <p className="text-gray-500 mb-8">Here's your activity overview</p>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-indigo-500">
                        <FaBriefcase className="text-3xl text-indigo-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{applications.length}</p>
                            <p className="text-sm text-gray-500">Total Applied</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-yellow-500">
                        <FaHourglassHalf className="text-3xl text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{statusCounts.pending}</p>
                            <p className="text-sm text-gray-500">Pending</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-green-500">
                        <FaCheckCircle className="text-3xl text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{statusCounts.accepted}</p>
                            <p className="text-sm text-gray-500">Accepted</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-red-500">
                        <FaTimesCircle className="text-3xl text-red-500" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{statusCounts.rejected}</p>
                            <p className="text-sm text-gray-500">Rejected</p>
                        </div>
                    </div>
                </div>

                {/* My Applications */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">My Applications</h2>
                    {applications.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No applications yet</p>
                            <Link to="/jobs" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">Browse Jobs</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {applications.slice(0, 5).map((app) => (
                                <Link key={app._id} to={`/jobs/${app.job?._id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{app.job?.title}</h3>
                                        <p className="text-sm text-gray-500">{app.job?.location} • ₹{app.job?.budget?.toLocaleString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Open Jobs */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Open Jobs For You</h2>
                        <Link to="/jobs" className="text-indigo-600 font-semibold hover:underline">View All →</Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentJobs.map((job) => (
                            <JobCard key={job._id} job={job} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
