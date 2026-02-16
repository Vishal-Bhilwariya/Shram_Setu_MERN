import React from 'react';
import { FaHardHat, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaHardHat className="text-indigo-400 text-xl" />
                            <span className="text-white text-xl font-bold">Shram Setu</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Connecting local workers with hirers. Your trusted job marketplace for skilled professionals.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/jobs" className="hover:text-indigo-400 transition-colors">Browse Jobs</a></li>
                            <li><a href="/register" className="hover:text-indigo-400 transition-colors">Register</a></li>
                            <li><a href="/login" className="hover:text-indigo-400 transition-colors">Login</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-3">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-indigo-400 text-xl transition-colors"><FaGithub /></a>
                            <a href="#" className="text-gray-400 hover:text-indigo-400 text-xl transition-colors"><FaLinkedin /></a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} Shram Setu. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
