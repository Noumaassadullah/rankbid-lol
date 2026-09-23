'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
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
        setError(data.error || 'Google login failed');
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);

      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError('An error occurred during Google login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-10 border border-gray-200">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0F3460] to-[#1a5490] rounded-lg flex items-center justify-center text-white font-black text-xl">
                ⚡
              </div>
              <span className="text-3xl font-black text-[#0F3460]">RankBid</span>
            </Link>
            <p className="text-gray-600 text-sm mt-4">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0F3460] text-white font-bold rounded-lg hover:bg-[#0D2A50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span> Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Login */}
          <div className="mt-6 flex justify-center">
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                text="signin_with"
                size="large"
              />
            )}
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <p className="text-xs text-gray-500">Google login not configured</p>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#0F3460] font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Demo Account:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-semibold">Email:</span> demo@rankbid.com</p>
              <p><span className="font-semibold">Password:</span> demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
