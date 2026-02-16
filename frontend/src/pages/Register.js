import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('worker');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    address: '', city: '', state: '', pincode: '', dob: '',
    skills: '', experience: '', dailyWage: '', availability: true,
    companyName: '', workLocation: '', hiringFor: '', preferredSkills: ''
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, role };
      if (role === 'worker') {
        data.skills = formData.skills.split(',').map(s => s.trim());
        delete data.companyName;
        delete data.workLocation;
        delete data.hiringFor;
        delete data.preferredSkills;
      } else {
        data.preferredSkills = formData.preferredSkills.split(',').map(s => s.trim());
        delete data.skills;
        delete data.experience;
        delete data.dailyWage;
        delete data.availability;
      }
      const res = await api.post('/auth/register', data);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Register as:</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" value="worker" checked={role === 'worker'} onChange={(e) => setRole(e.target.value)} className="mr-2" />
                Worker
              </label>
              <label className="flex items-center">
                <input type="radio" value="hirer" checked={role === 'hirer'} onChange={(e) => setRole(e.target.value)} className="mr-2" />
                Hirer
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required className="border p-2 rounded" />
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required className="border p-2 rounded" />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="border p-2 rounded" />
              <input type="tel" name="phone" placeholder="Phone" onChange={handleChange} required className="border p-2 rounded" />
              <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="border p-2 rounded" />
              <input type="date" name="dob" onChange={handleChange} required className="border p-2 rounded" />
            </div>
            
            <input type="text" name="address" placeholder="Address" onChange={handleChange} required className="border p-2 rounded w-full" />
            
            <div className="grid md:grid-cols-3 gap-4">
              <input type="text" name="city" placeholder="City" onChange={handleChange} required className="border p-2 rounded" />
              <input type="text" name="state" placeholder="State" onChange={handleChange} required className="border p-2 rounded" />
              <input type="text" name="pincode" placeholder="Pincode" onChange={handleChange} required className="border p-2 rounded" />
            </div>

            {role === 'worker' ? (
              <>
                <input type="text" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} required className="border p-2 rounded w-full" />
                <input type="number" name="experience" placeholder="Years of Experience" onChange={handleChange} required className="border p-2 rounded w-full" />
                <input type="number" name="dailyWage" placeholder="Daily Wage (₹)" onChange={handleChange} required className="border p-2 rounded w-full" />
              </>
            ) : (
              <>
                <input type="text" name="companyName" placeholder="Company Name (Optional)" onChange={handleChange} className="border p-2 rounded w-full" />
                <input type="text" name="workLocation" placeholder="Work Location" onChange={handleChange} required className="border p-2 rounded w-full" />
                <input type="text" name="hiringFor" placeholder="Hiring For" onChange={handleChange} required className="border p-2 rounded w-full" />
                <input type="text" name="preferredSkills" placeholder="Preferred Skills (comma separated)" onChange={handleChange} required className="border p-2 rounded w-full" />
              </>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
