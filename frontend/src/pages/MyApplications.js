import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { toast } from 'react-toastify';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaClipboardList } from 'react-icons/fa';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await api.get('/applications/my-applications');
                setApplications(res.data.data.applications);
            } catch (err) {
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);

    const statusIcon = {
        pending: <FaHourglassHalf className="text-yellow-500" />,
        accepted: <FaCheckCircle className="text-green-500" />,
        rejected: <FaTimesCircle className="text-red-500" />,
        completed: <FaCheckCircle className="text-blue-500" />,
    };

    const statusBg = {
        pending: 'bg-yellow-100 text-yellow-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        completed: 'bg-blue-100 text-blue-700',
    };

    if (loading) return <div className="py-8 container mx-auto px-4"><LoadingSkeleton type="list" count={5} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Applications</h1>
                <p className="text-gray-500 mb-6">Track your job applications</p>

                {/* Filters */}
                <div className="flex gap-3 mb-6 flex-wrap">
                    {['all', 'pending', 'accepted', 'rejected', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${filter === status ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
                                }`}
                        >
                            {status} {status !== 'all' && `(${applications.filter((a) => a.status === status).length})`}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow">
                        <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600">No applications found</h3>
                        <Link to="/jobs" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">Browse Jobs</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((app) => (
                            <Link
                                key={app._id}
                                to={`/jobs/${app.job?._id}`}
                                className="flex items-center justify-between p-5 bg-white rounded-xl shadow hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    {statusIcon[app.status]}
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{app.job?.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {app.job?.location} • ₹{app.job?.budget?.toLocaleString()} • {app.job?.duration}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBg[app.status]}`}>
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
