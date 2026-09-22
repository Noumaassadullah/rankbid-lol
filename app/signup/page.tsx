'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);

      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Google signup failed');
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);

      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError('An error occurred during Google signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F3460] to-[#1a5490] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl md:text-4xl font-black text-[#0F3460]">
              RankBid
            </Link>
            <p className="text-gray-600 text-sm mt-2">Create a new account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#1F2937] mb-2">
                Full Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#1F2937] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0F3460] text-white font-bold rounded-lg hover:bg-[#0D2A50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span> Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Signup */}
          <div className="mt-6 flex justify-center">
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google signup failed')}
                text="signup_with"
                size="large"
              />
            )}
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <p className="text-xs text-gray-500">Google login not configured</p>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0F3460] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
