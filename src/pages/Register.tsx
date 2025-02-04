import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, Loader2, BookOpen, Target, Award } from 'lucide-react';
import { signUp } from '../lib/auth';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!fullName.trim() || !phoneNumber.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    const result = await signUp(fullName, phoneNumber, password);
    if (result.success) {
      window.location.href = '/onboarding';
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex">
      {/* Left Side - Features */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-lg mx-auto flex flex-col justify-center p-12">
          <h2 className="text-3xl font-bold mb-8">Begin Your NEET Journey</h2>
          
          <div className="space-y-8">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <BookOpen className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Structured Learning Path</h3>
              <p className="text-indigo-100">Follow our proven study methodology designed specifically for NEET success</p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <Target className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
              <p className="text-indigo-100">Monitor your performance with detailed analytics and insights</p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <Award className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Achieve Excellence</h3>
              <p className="text-indigo-100">Join thousands of successful medical aspirants who trust NCERT Nichod</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Join NCERT Nichod
            </h1>
            <p className="text-gray-600">Create your account to start your journey</p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  disabled={isLoading}
                  inputMode="numeric"
                  pattern="\d*"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white rounded-lg py-3 font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
              <div className="text-center">
                <a
                  href="/login"
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}