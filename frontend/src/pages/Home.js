import React from 'react';
import { Link } from 'react-router-dom';
import { FaHardHat, FaSearch, FaBriefcase, FaStar, FaShieldAlt, FaUserCheck } from 'react-icons/fa';

const Home = () => {
  const features = [
    { icon: <FaSearch className="text-3xl text-indigo-500" />, title: 'Find Work', desc: 'Browse hundreds of local jobs matching your skills and location.' },
    { icon: <FaBriefcase className="text-3xl text-green-500" />, title: 'Post Jobs', desc: 'Reach skilled workers in your area. Find the right person fast.' },
    { icon: <FaStar className="text-3xl text-yellow-500" />, title: 'Rating System', desc: 'Build your reputation through verified reviews and ratings.' },
    { icon: <FaShieldAlt className="text-3xl text-red-500" />, title: 'Secure Platform', desc: 'Your data is protected with enterprise-grade security.' },
    { icon: <FaUserCheck className="text-3xl text-purple-500" />, title: 'Verified Profiles', desc: 'All workers and hirers are verified for trust and safety.' },
    { icon: <FaHardHat className="text-3xl text-orange-500" />, title: 'Skilled Workers', desc: 'Plumbers, electricians, masons, painters and more — all in one place.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaHardHat className="text-5xl text-indigo-300" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Welcome to <span className="text-indigo-300">Shram Setu</span>
          </h1>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            India's trusted marketplace connecting skilled local workers with hirers.
            Find jobs, hire talent, and build your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl text-lg font-semibold border border-white/20 transition-all"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Why Choose Shram Setu?</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            A complete platform designed for India's workforce
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 group"
              >
                <div className="mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
            Join thousands of workers and hirers already using Shram Setu.
          </p>
          <Link
            to="/register"
            className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
