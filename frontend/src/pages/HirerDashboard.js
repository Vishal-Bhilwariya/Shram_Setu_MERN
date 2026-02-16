import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { toast } from 'react-toastify';
import {
    FaBriefcase, FaUsers, FaCheckCircle, FaClock, FaPlus,
    FaMapMarkerAlt, FaRupeeSign, FaTrash, FaEdit
} from 'react-icons/fa';

const HirerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const res = await api.get('/jobs/my-jobs');
                setJobs(res.data.data.jobs);
            } catch (err) {
                toast.error('Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchMyJobs();
    }, []);

    const handleDelete = async (jobId) => {
        if (!window.confirm('Delete this job? This cannot be undone.')) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs((prev) => prev.filter((j) => j._id !== jobId));
            toast.success('Job deleted');
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const stats = {
        total: jobs.length,
        open: jobs.filter((j) => j.status === 'open').length,
        completed: jobs.filter((j) => j.status === 'completed').length,
        totalApplicants: jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0),
    };

    if (loading) return <div className="py-8 container mx-auto px-4"><LoadingSkeleton type="card" count={3} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Hirer Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage your job postings</p>
                    </div>
                    <Link
                        to="/post-job"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        <FaPlus /> Post New Job
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-indigo-500">
                        <FaBriefcase className="text-3xl text-indigo-500" />
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-gray-500">Total Jobs</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-green-500">
                        <FaClock className="text-3xl text-green-500" />
                        <div>
                            <p className="text-2xl font-bold">{stats.open}</p>
                            <p className="text-sm text-gray-500">Open Jobs</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-blue-500">
                        <FaCheckCircle className="text-3xl text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                            <p className="text-sm text-gray-500">Completed</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-purple-500">
                        <FaUsers className="text-3xl text-purple-500" />
                        <div>
                            <p className="text-2xl font-bold">{stats.totalApplicants}</p>
                            <p className="text-sm text-gray-500">Total Applicants</p>
                        </div>
                    </div>
                </div>

                {/* Job List */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">My Posted Jobs</h2>
                    {jobs.length === 0 ? (
                        <div className="text-center py-12">
                            <FaBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-3">No jobs posted yet</p>
                            <Link to="/post-job" className="text-indigo-600 font-semibold hover:underline">Post your first job</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map((job) => {
                                const statusColors = {
                                    open: 'bg-green-100 text-green-700',
                                    closed: 'bg-red-100 text-red-700',
                                    completed: 'bg-blue-100 text-blue-700',
                                };
                                return (
                                    <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <Link to={`/jobs/${job._id}`} className="flex-1">
                                            <h3 className="font-semibold text-gray-800 hover:text-indigo-600">{job.title}</h3>
                                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                                                <span className="flex items-center gap-1"><FaRupeeSign /> ₹{job.budget?.toLocaleString()}</span>
                                                <span className="flex items-center gap-1"><FaUsers /> {job.applicantCount || 0} applicants</span>
                                            </div>
                                        </Link>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status]}`}>
                                                {job.status}
                                            </span>
                                            <button onClick={() => navigate(`/jobs/${job._id}`)} className="text-indigo-500 hover:text-indigo-700 p-2">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(job._id)} className="text-red-400 hover:text-red-600 p-2">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HirerDashboard;
