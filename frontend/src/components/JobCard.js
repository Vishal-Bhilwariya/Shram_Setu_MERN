import React from 'react';
import { FaMapMarkerAlt, FaRupeeSign, FaClock, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
    const statusColors = {
        open: 'bg-green-100 text-green-700',
        closed: 'bg-red-100 text-red-700',
        completed: 'bg-blue-100 text-blue-700',
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800 hover:text-indigo-600 transition-colors">
                    <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status]}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                {job.skillsRequired?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full font-medium">
                        {skill}
                    </span>
                ))}
                {job.skillsRequired?.length > 3 && (
                    <span className="text-gray-400 text-xs self-center">+{job.skillsRequired.length - 3} more</span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-indigo-400" />
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FaRupeeSign className="text-green-500" />
                    <span>₹{job.budget?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FaClock className="text-orange-400" />
                    <span>{job.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FaUsers className="text-purple-400" />
                    <span>{job.applicantCount || 0} applied</span>
                </div>
            </div>

            {job.postedBy && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    Posted by <span className="font-medium text-gray-600">
                        {job.postedBy.firstName} {job.postedBy.lastName}
                        {job.postedBy.hirerDetails?.companyName && ` • ${job.postedBy.hirerDetails.companyName}`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default JobCard;
