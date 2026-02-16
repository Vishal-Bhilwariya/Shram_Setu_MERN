import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { toast } from 'react-toastify';
import {
    FaUsers, FaBriefcase, FaClipboardList, FaChartBar,
    FaBan, FaCheck, FaTrash, FaSearch
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, usersRes] = await Promise.all([
                    api.get('/admin/analytics'),
                    api.get('/admin/users'),
                ]);
                setAnalytics(analyticsRes.data.data.analytics);
                setUsers(usersRes.data.data.users);
            } catch (err) {
                toast.error('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBlockUser = async (userId, isBlocked) => {
        try {
            await api.patch(`/admin/users/${userId}/block`);
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, isBlocked: !isBlocked } : u))
            );
            toast.success(isBlocked ? 'User unblocked' : 'User blocked');
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleSearchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter) params.append('role', roleFilter);
            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data.data.users);
        } catch (err) {
            toast.error('Search failed');
        }
    };

    if (loading) return <div className="py-8 container mx-auto px-4"><LoadingSkeleton type="card" count={4} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-500 mb-8">Platform overview and management</p>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6">
                    {['overview', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors capitalize ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && analytics && (
                    <>
                        {/* Stats */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-indigo-500">
                                <FaUsers className="text-3xl text-indigo-500" />
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                                    <p className="text-sm text-gray-500">Total Users</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-green-500">
                                <FaBriefcase className="text-3xl text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalJobs}</p>
                                    <p className="text-sm text-gray-500">Total Jobs</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-purple-500">
                                <FaClipboardList className="text-3xl text-purple-500" />
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalApplications}</p>
                                    <p className="text-sm text-gray-500">Total Applications</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-yellow-500">
                                <FaChartBar className="text-3xl text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold">{analytics.totalReviews}</p>
                                    <p className="text-sm text-gray-500">Total Reviews</p>
                                </div>
                            </div>
                        </div>

                        {/* Role Breakdown */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Users by Role</h3>
                                <div className="space-y-3">
                                    {analytics.usersByRole?.map((r) => (
                                        <div key={r._id} className="flex justify-between items-center">
                                            <span className="capitalize text-gray-600">{r._id}</span>
                                            <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">{r.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Application Status</h3>
                                <div className="space-y-3">
                                    {analytics.applicationsByStatus?.map((s) => (
                                        <div key={s._id} className="flex justify-between items-center">
                                            <span className="capitalize text-gray-600">{s._id}</span>
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">{s.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Recent Users</h3>
                            <div className="space-y-3">
                                {analytics.recentUsers?.map((u) => (
                                    <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                                                {u.firstName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                        <span className="capitalize bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">{u.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex gap-3 mb-6">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">All Roles</option>
                                <option value="worker">Worker</option>
                                <option value="hirer">Hirer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button onClick={handleSearchUsers} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
                                Search
                            </button>
                        </div>

                        <div className="space-y-3">
                            {users.map((u) => (
                                <div key={u._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {u.firstName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{u.firstName} {u.lastName}</p>
                                            <p className="text-sm text-gray-500">{u.email} • {u.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {u.isBlocked && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">Blocked</span>
                                        )}
                                        <button
                                            onClick={() => handleBlockUser(u._id, u.isBlocked)}
                                            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${u.isBlocked
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                        >
                                            {u.isBlocked ? <><FaCheck /> Unblock</> : <><FaBan /> Block</>}
                                        </button>
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

export default AdminDashboard;
