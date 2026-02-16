import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { toast } from 'react-toastify';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave,
    FaTimes, FaCamera, FaBriefcase, FaStar, FaCheckCircle, FaRupeeSign
} from 'react-icons/fa';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setProfile(res.data.data.user);
            } catch (err) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const startEditing = () => {
        setEditData({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            pincode: profile.pincode,
            ...(profile.role === 'worker' && {
                skills: profile.workerDetails?.skills?.join(', ') || '',
                experience: profile.workerDetails?.experience || 0,
                dailyWage: profile.workerDetails?.dailyWage || 0,
            }),
            ...(profile.role === 'hirer' && {
                companyName: profile.hirerDetails?.companyName || '',
                workLocation: profile.hirerDetails?.workLocation || '',
            }),
        });
        setEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...editData };
            if (profile.role === 'worker' && typeof payload.skills === 'string') {
                payload.skills = payload.skills.split(',').map((s) => s.trim()).filter(Boolean);
            }
            const res = await api.put('/auth/profile', payload);
            setProfile(res.data.data.user);
            updateUser({ firstName: res.data.data.user.firstName, lastName: res.data.data.user.lastName });
            setEditing(false);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const res = await api.post('/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile((prev) => ({ ...prev, profileImage: res.data.data.profileImage }));
            toast.success('Profile image updated!');
        } catch (err) {
            toast.error('Image upload failed');
        }
    };

    if (loading) return <div className="py-8"><LoadingSkeleton type="profile" /></div>;
    if (!profile) return null;

    const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
                    <div className="px-8 pb-8 -mt-16">
                        <div className="flex items-end gap-6">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                                    {profile.profileImage ? (
                                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
                                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg">
                                    <FaCamera className="text-sm" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                            <div className="mb-4 flex-1">
                                <h1 className="text-2xl font-bold text-gray-800">{profile.firstName} {profile.lastName}</h1>
                                <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium capitalize mt-1">
                                    {profile.role}
                                </span>
                            </div>
                            <button
                                onClick={editing ? () => setEditing(false) : startEditing}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${editing ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                    }`}
                            >
                                {editing ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h2>

                    {editing ? (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">First Name</label>
                                    <input value={editData.firstName} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Last Name</label>
                                    <input value={editData.lastName} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Phone</label>
                                <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Address</label>
                                <input value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className={inputClass} />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">City</label>
                                    <input value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">State</label>
                                    <input value={editData.state} onChange={(e) => setEditData({ ...editData, state: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Pincode</label>
                                    <input value={editData.pincode} onChange={(e) => setEditData({ ...editData, pincode: e.target.value })} className={inputClass} />
                                </div>
                            </div>

                            {profile.role === 'worker' && (
                                <div className="bg-indigo-50 p-4 rounded-xl space-y-3 mt-4">
                                    <h3 className="text-sm font-bold text-indigo-700">Worker Details</h3>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Skills (comma-separated)</label>
                                        <input value={editData.skills} onChange={(e) => setEditData({ ...editData, skills: e.target.value })} className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Experience</label>
                                            <input type="number" value={editData.experience} onChange={(e) => setEditData({ ...editData, experience: e.target.value })} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Daily Wage (₹)</label>
                                            <input type="number" value={editData.dailyWage} onChange={(e) => setEditData({ ...editData, dailyWage: e.target.value })} className={inputClass} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profile.role === 'hirer' && (
                                <div className="bg-green-50 p-4 rounded-xl space-y-3 mt-4">
                                    <h3 className="text-sm font-bold text-green-700">Hirer Details</h3>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Company Name</label>
                                        <input value={editData.companyName} onChange={(e) => setEditData({ ...editData, companyName: e.target.value })} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Work Location</label>
                                        <input value={editData.workLocation} onChange={(e) => setEditData({ ...editData, workLocation: e.target.value })} className={inputClass} />
                                    </div>
                                </div>
                            )}

                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
                                <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaEnvelope className="text-indigo-400" />
                                    <span>{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaPhone className="text-indigo-400" />
                                    <span>{profile.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaMapMarkerAlt className="text-indigo-400" />
                                    <span>{profile.address}, {profile.city}, {profile.state} - {profile.pincode}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FaUser className="text-indigo-400" />
                                    <span>DOB: {new Date(profile.dob).toLocaleDateString('en-IN')}</span>
                                </div>
                            </div>

                            {profile.role === 'worker' && profile.workerDetails && (
                                <div className="bg-indigo-50 p-6 rounded-xl mt-4">
                                    <h3 className="font-bold text-indigo-700 mb-3">Worker Profile</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-500">Skills</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {profile.workerDetails.skills?.map((s, i) => (
                                                    <span key={i} className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaStar className="text-yellow-400" />
                                            <StarRating rating={profile.workerDetails.rating || 0} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaBriefcase className="text-indigo-400" />
                                            <span className="text-sm">{profile.workerDetails.experience} yrs experience</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaRupeeSign className="text-green-500" />
                                            <span className="text-sm">₹{profile.workerDetails.dailyWage}/day</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCheckCircle className="text-green-500" />
                                            <span className="text-sm">{profile.workerDetails.completedJobs || 0} jobs completed</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profile.role === 'hirer' && profile.hirerDetails && (
                                <div className="bg-green-50 p-6 rounded-xl mt-4">
                                    <h3 className="font-bold text-green-700 mb-3">Hirer Profile</h3>
                                    <div className="space-y-2 text-sm">
                                        {profile.hirerDetails.companyName && <p><strong>Company:</strong> {profile.hirerDetails.companyName}</p>}
                                        {profile.hirerDetails.workLocation && <p><strong>Work Location:</strong> {profile.hirerDetails.workLocation}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
