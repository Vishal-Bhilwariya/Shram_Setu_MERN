import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBriefcase, FaArrowLeft } from 'react-icons/fa';

const schema = yup.object({
    title: yup.string().trim().min(3).max(100).required('Title is required'),
    description: yup.string().trim().min(20, 'Min 20 chars').max(2000).required('Description is required'),
    location: yup.string().trim().required('Location is required'),
    budget: yup.number().typeError('Must be a number').min(100, 'Min ₹100').required('Budget is required'),
    duration: yup.string().trim().required('Duration is required'),
    skillsRequired: yup.string().required('Enter skills (comma-separated)'),
});

const PostJob = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                skillsRequired: data.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
            };
            await api.post('/jobs', payload);
            toast.success('Job posted successfully!');
            navigate('/my-jobs');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm`;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6">
                    <FaArrowLeft /> Back
                </button>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <FaBriefcase className="text-4xl text-indigo-600 mx-auto mb-3" />
                        <h1 className="text-3xl font-bold text-gray-800">Post a Job</h1>
                        <p className="text-gray-500 mt-1">Find the right worker for your job</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input {...register('title')} className={inputClass('title')} placeholder="e.g. Plumber needed for bathroom renovation" />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={5}
                                className={inputClass('description')}
                                placeholder="Describe the job in detail — what work needs to be done, requirements, etc."
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input {...register('location')} className={inputClass('location')} placeholder="e.g. Andheri, Mumbai" />
                                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                                <input {...register('budget')} type="number" className={inputClass('budget')} placeholder="5000" />
                                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                <input {...register('duration')} className={inputClass('duration')} placeholder="e.g. 3 days, 1 week" />
                                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required</label>
                                <input {...register('skillsRequired')} className={inputClass('skillsRequired')} placeholder="Plumbing, Pipe Fitting" />
                                {errors.skillsRequired && <p className="text-red-500 text-xs mt-1">{errors.skillsRequired.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;
