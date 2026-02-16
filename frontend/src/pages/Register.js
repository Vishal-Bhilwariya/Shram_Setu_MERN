import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaHardHat, FaEye, FaEyeSlash, FaUser, FaBriefcase } from 'react-icons/fa';

const baseSchema = {
  firstName: yup.string().trim().min(2, 'Min 2 chars').max(50).required('Required'),
  lastName: yup.string().trim().min(2, 'Min 2 chars').max(50).required('Required'),
  email: yup.string().email('Invalid email').required('Required'),
  phone: yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone').required('Required'),
  password: yup.string().min(6, 'Min 6 chars').matches(/\d/, 'Must have a number').required('Required'),
  address: yup.string().trim().required('Required'),
  city: yup.string().trim().required('Required'),
  state: yup.string().trim().required('Required'),
  pincode: yup.string().matches(/^\d{6}$/, 'Must be 6 digits').required('Required'),
  dob: yup.string().required('Required'),
};

const workerSchema = yup.object({
  ...baseSchema,
  skills: yup.string().required('Enter skills (comma-separated)'),
  experience: yup.number().typeError('Must be a number').min(0).required('Required'),
  dailyWage: yup.number().typeError('Must be a number').min(1, 'Min ₹1').required('Required'),
});

const hirerSchema = yup.object({
  ...baseSchema,
  companyName: yup.string().trim(),
  workLocation: yup.string().trim().required('Required'),
});

const Register = () => {
  const [role, setRole] = useState('worker');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const schema = role === 'worker' ? workerSchema : hirerSchema;

  const { register: reg, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, role };

      if (role === 'worker') {
        payload.skills = data.skills.split(',').map((s) => s.trim()).filter(Boolean);
        delete payload.companyName;
        delete payload.workLocation;
      } else {
        delete payload.skills;
        delete payload.experience;
        delete payload.dailyWage;
      }

      const res = await api.post('/auth/register', payload);
      login(res.data.data.accessToken, res.data.data.user);
      toast.success('Registration successful!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border ${errors[field] ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <FaHardHat className="text-4xl text-indigo-600 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-1">Join Shram Setu today</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            type="button"
            onClick={() => handleRoleChange('worker')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${role === 'worker'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <FaUser /> Worker
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('hirer')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${role === 'hirer'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <FaBriefcase /> Hirer
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
              <input {...reg('firstName')} className={inputClass('firstName')} placeholder="Rajesh" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
              <input {...reg('lastName')} className={inputClass('lastName')} placeholder="Kumar" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input {...reg('email')} type="email" className={inputClass('email')} placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input {...reg('phone')} className={inputClass('phone')} placeholder="9876543210" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input
                  {...reg('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={inputClass('password')}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
              <input {...reg('dob')} type="date" className={inputClass('dob')} />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <input {...reg('address')} className={inputClass('address')} placeholder="Street address" />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input {...reg('city')} className={inputClass('city')} placeholder="Mumbai" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <input {...reg('state')} className={inputClass('state')} placeholder="Maharashtra" />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
              <input {...reg('pincode')} className={inputClass('pincode')} placeholder="400001" />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
            </div>
          </div>

          {/* Role-specific fields */}
          {role === 'worker' ? (
            <div className="bg-indigo-50 p-4 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-indigo-700">Worker Details</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Skills (comma-separated)</label>
                <input {...reg('skills')} className={inputClass('skills')} placeholder="Plumbing, Electrical, Painting" />
                {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Experience (years)</label>
                  <input {...reg('experience')} type="number" className={inputClass('experience')} placeholder="5" />
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Daily Wage (₹)</label>
                  <input {...reg('dailyWage')} type="number" className={inputClass('dailyWage')} placeholder="800" />
                  {errors.dailyWage && <p className="text-red-500 text-xs mt-1">{errors.dailyWage.message}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-green-700">Hirer Details</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company Name (optional)</label>
                <input {...reg('companyName')} className={inputClass('companyName')} placeholder="ABC Constructions" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Work Location</label>
                <input {...reg('workLocation')} className={inputClass('workLocation')} placeholder="Andheri, Mumbai" />
                {errors.workLocation && <p className="text-red-500 text-xs mt-1">{errors.workLocation.message}</p>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
