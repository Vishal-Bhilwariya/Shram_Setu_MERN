import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { toast } from 'react-toastify';
import {
    FaMapMarkerAlt, FaRupeeSign, FaClock, FaUser, FaCheckCircle,
    FaTimesCircle, FaHourglassHalf, FaArrowLeft
} from 'react-icons/fa';

const JobDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await api.get(`/jobs/${id}`);
                setJob(res.data.data.job);
                setApplications(res.data.data.applications || []);
                if (user?.role === 'worker') {
                    const myApp = (res.data.data.applications || []).find(
                        (app) => app.worker?._id === user.id
                    );
                    setHasApplied(!!myApp);
                }
            } catch (err) {
                toast.error('Failed to load job details');
                navigate('/jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]); // eslint-disable-line

    const handleApply = async () => {
        setApplying(true);
        try {
            await api.post(`/applications/${id}`);
            toast.success('Applied successfully!');
            setHasApplied(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const handleApplicationAction = async (appId, status) => {
        try {
            await api.patch(`/applications/${appId}/status`, { status });
            toast.success(`Application ${status}`);
            setApplications((prev) =>
                prev.map((app) => (app._id === appId ? { ...app, status } : app))
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleComplete = async () => {
        try {
            await api.patch(`/jobs/${id}/complete`);
            toast.success('Job marked as completed!');
            setJob((prev) => ({ ...prev, status: 'completed' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    if (loading) return <div className="py-8"><LoadingSkeleton type="profile" /></div>;
    if (!job) return null;

    const statusColors = {
        open: 'bg-green-100 text-green-700',
        closed: 'bg-red-100 text-red-700',
        completed: 'bg-blue-100 text-blue-700',
    };
    const appStatusIcons = {
        pending: <FaHourglassHalf className="text-yellow-500" />,
        accepted: <FaCheckCircle className="text-green-500" />,
        rejected: <FaTimesCircle className="text-red-500" />,
        completed: <FaCheckCircle className="text-blue-500" />,
    };

    const isOwner = user?.id === job.postedBy?._id;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                    <FaArrowLeft /> Back
                </button>

                {/* Job Details Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusColors[job.status]}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-6 leading-relaxed">{job.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 text-gray-500">
                            <FaMapMarkerAlt className="text-indigo-500 text-lg" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                            <FaRupeeSign className="text-green-500 text-lg" />
                            <span>₹{job.budget?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                            <FaClock className="text-orange-400 text-lg" />
                            <span>{job.duration}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                            <FaUser className="text-purple-400 text-lg" />
                            <span>{applications.length} applicant(s)</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skillsRequired?.map((skill, idx) => (
                                <span key={idx} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {job.postedBy && (
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-500">
                                Posted by <span className="font-semibold text-gray-700">{job.postedBy.firstName} {job.postedBy.lastName}</span>
                                {job.postedBy.hirerDetails?.companyName && ` • ${job.postedBy.hirerDetails.companyName}`}
                            </p>
                        </div>
                    )}

                    {/* Worker: Apply button */}
                    {user?.role === 'worker' && job.status === 'open' && (
                        <div className="mt-6">
                            <button
                                onClick={handleApply}
                                disabled={hasApplied || applying}
                                className={`px-8 py-3 rounded-xl font-semibold transition-colors ${hasApplied
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                            >
                                {hasApplied ? '✓ Already Applied' : applying ? 'Applying...' : 'Apply Now'}
                            </button>
                        </div>
                    )}

                    {/* Hirer: Complete button */}
                    {isOwner && job.status === 'open' && (
                        <div className="mt-6 flex gap-3">
                            <button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                                Mark Completed
                            </button>
                        </div>
                    )}
                </div>

                {/* Hirer: View Applicants */}
                {isOwner && applications.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Applicants ({applications.length})</h2>
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-bold text-indigo-600">
                                            {app.worker?.firstName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{app.worker?.firstName} {app.worker?.lastName}</p>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                {app.worker?.workerDetails?.skills?.slice(0, 3).join(', ')}
                                                {app.worker?.workerDetails?.rating > 0 && (
                                                    <StarRating rating={app.worker.workerDetails.rating} size="sm" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {app.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApplicationAction(app._id, 'accepted')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleApplicationAction(app._id, 'rejected')}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span className="flex items-center gap-2 text-sm font-medium capitalize">
                                                {appStatusIcons[app.status]} {app.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetail;
