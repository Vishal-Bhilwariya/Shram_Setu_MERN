import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-600 mb-6">Welcome to Shram Setu</h1>
          <p className="text-xl text-gray-700 mb-8">
            Connecting Local Workers with Hirers - Your Trusted Job Marketplace
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700">
              Get Started
            </Link>
            <Link to="/login" className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg border-2 border-blue-600 hover:bg-blue-50">
              Login
            </Link>
          </div>
        </div>
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">For Workers</h3>
            <p className="text-gray-600">Find local jobs, showcase your skills, and build your reputation</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">For Hirers</h3>
            <p className="text-gray-600">Post jobs, find skilled workers, and manage applications easily</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Trusted Platform</h3>
            <p className="text-gray-600">Rating system ensures quality and trust for both parties</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
