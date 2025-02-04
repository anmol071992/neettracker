import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Loader2, AlertCircle, BookOpen, Brain, Stethoscope } from 'lucide-react';
import { signIn } from '../lib/auth';

export function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    // Clean phone number before sending
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const result = await signIn(cleanPhone, password);
    
    if (result.success) {
      window.location.href = '/';
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 10 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              NCERT Nichod
            </h1>
            <p className="text-gray-600">Your Gateway to NEET Excellence</p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
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
                  placeholder="Enter your 10-digit number"
                  maxLength={10}
                  disabled={isLoading}
                  inputMode="numeric"
                  pattern="\d*"
                  required
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
                  required
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
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              <div className="text-center">
                <a
                  href="/register"
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
                >
                  New to NEET Tracker? Create Account
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-lg mx-auto flex flex-col justify-center p-12">
          <h2 className="text-3xl font-bold mb-8">Why Choose NCERT Nichod?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <BookOpen className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Comprehensive NCERT Coverage</h3>
                <p className="text-indigo-100">Master every concept with our detailed chapter-wise approach</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Brain className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Smart Study Planner</h3>
                <p className="text-indigo-100">Personalized study schedules to optimize your preparation</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Stethoscope className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">NEET-Focused Approach</h3>
                <p className="text-indigo-100">Tailored specifically for medical aspirants</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <blockquote className="text-lg italic">
              "Your journey to becoming a doctor starts with the right preparation. Let us guide you to success."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}