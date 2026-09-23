'use client';

import Header from '@/components/Header';
import { User, Settings, LogOut, TrendingUp, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Manage your products and account</p>
          </div>

          {/* User Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0F3460] to-[#1a5490] rounded-full flex items-center justify-center text-white">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome, Maker!</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign in to manage your products</p>
              </div>
            </div>

            {/* Auth Message */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-6">
              <p className="text-blue-900 dark:text-blue-200 font-medium mb-4">
                Sign in to view and manage your products
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-[#0F3460] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
                <button className="px-6 py-2 bg-white dark:bg-gray-700 text-[#0F3460] dark:text-blue-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-blue-200 dark:border-blue-700">
                  Create Account
                </button>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Listed Products</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-100 dark:text-orange-900" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Spent</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">$0</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-100 dark:text-green-900" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Best Ranking</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">—</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-100 dark:text-blue-900" />
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all text-left group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0F3460]/10 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#0F3460]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#0F3460] dark:group-hover:text-orange-400 transition-colors">
                    My Products
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your listings</p>
                </div>
              </div>
            </button>

            <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all text-left group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0F3460]/10 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-[#0F3460]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#0F3460] dark:group-hover:text-blue-400 transition-colors">
                    Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account preferences</p>
                </div>
              </div>
            </button>

            <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all text-left group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Billing
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payment history</p>
                </div>
              </div>
            </button>

            <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-red-300 dark:hover:border-red-600 transition-all text-left group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    Sign Out
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Log out of your account</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
