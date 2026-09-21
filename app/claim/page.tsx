'use client';

import { useState } from 'react';

export default function ClaimPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    url: '',
    category: '',
    amount: '',
  });

  const categories = ['Marketing', 'SEO', 'Productivity', 'Agents', 'Crypto', 'Developer', 'Health', 'Games', 'Business', 'Ecommerce', 'Travel', 'Directories', 'AI Media', 'Agencies', 'Social', 'Education', 'People', 'Design', 'Hiring', 'Domains', 'Security', 'Sales', 'News', 'Real Estate', 'Writing', 'Audio', 'Analytics', 'Unlimited', 'Other'];

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="bg-black dark:bg-white px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-white dark:text-black mb-4 leading-none">CLAIM YOUR RANK</h1>
          <p className="text-lg md:text-xl font-bold text-white dark:text-black">3 steps to domination.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        {/* Step Indicator */}
        <div className="flex gap-4 md:gap-8 mb-16 md:mb-20">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-2 border-t-4 ${s <= step ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-700'}`} />
              <p className="text-center mt-4 text-xs font-black uppercase tracking-wider text-black dark:text-white">
                Step {s}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card-neobrutalism shadow-neobrutalism mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-6 border-b-4 border-black dark:border-white pb-6">Step 1 of 3</div>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-8">PRODUCT INFO</h2>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-black uppercase text-black dark:text-white mb-3">Product URL or @Handle</label>
                <input
                  type="text"
                  placeholder="example.com or @yourproduct"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-white dark:bg-black text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 px-6 py-4 font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase text-black dark:text-white mb-3">Description</label>
                <textarea
                  placeholder="What does it do?"
                  className="w-full bg-white dark:bg-black text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 px-6 py-4 font-bold text-lg"
                  rows={4}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.url}
              className="btn-neobrutalism w-full shadow-neobrutalism disabled:opacity-50"
            >
              NEXT STEP →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="card-neobrutalism shadow-neobrutalism mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-6 border-b-4 border-black dark:border-white pb-6">Step 2 of 3</div>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-8">CHOOSE CATEGORY</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`py-4 px-6 font-black text-lg border-4 transition-all ${
                    formData.category === cat
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 btn-neobrutalism-outline shadow-neobrutalism"
              >
                ← BACK
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.category}
                className="flex-1 btn-neobrutalism shadow-neobrutalism disabled:opacity-50"
              >
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="card-neobrutalism shadow-neobrutalism mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-6 border-b-4 border-black dark:border-white pb-6">Step 3 of 3</div>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-8">SET YOUR BID</h2>

            <div className="card-neobrutalism-dark shadow-neobrutalism mb-8">
              <p className="text-xs font-black uppercase text-white dark:text-black mb-2">CURRENT #1</p>
              <p className="text-5xl font-black text-white dark:text-black">Rs. 2,000</p>
              <p className="text-sm font-bold text-gray-300 dark:text-gray-600 mt-3">Bid Rs. 2,250+ to outrank</p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-black uppercase text-black dark:text-white mb-3">Your Bid</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-black dark:text-white font-black text-lg">Rs.</span>
                <input
                  type="number"
                  placeholder="500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-white dark:bg-black text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 pl-16 pr-6 py-4 font-black text-3xl"
                />
              </div>
            </div>

            <div className="card-neobrutalism-dark shadow-neobrutalism mb-8">
              <p className="text-sm font-bold text-white dark:text-black">Payment via JazzCash & EasyPaisa. Secure & instant.</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 btn-neobrutalism-outline shadow-neobrutalism"
              >
                ← BACK
              </button>
              <button
                onClick={() => alert(`Bid: Rs. ${formData.amount} for ${formData.category}`)}
                disabled={!formData.amount}
                className="flex-1 btn-neobrutalism shadow-neobrutalism disabled:opacity-50 text-lg"
              >
                PAY & RANK
              </button>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            { title: 'INSTANT', desc: 'Appear on leaderboard immediately' },
            { title: 'VISIBLE', desc: 'Seen by thousands daily' },
            { title: 'REAL TRAFFIC', desc: 'Genuine user interest' }
          ].map((benefit, idx) => (
            <div key={idx} className="card-neobrutalism shadow-neobrutalism text-center">
              <h3 className="text-3xl font-black text-black dark:text-white mb-3">{benefit.title}</h3>
              <p className="font-bold text-black dark:text-white">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black dark:bg-white px-4 sm:px-6 py-20 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white dark:text-black mb-8 leading-none">THE CLOCK IS TICKING</h2>
          <p className="text-lg font-bold text-white dark:text-black">Every second someone else is bidding for #1.</p>
        </div>
      </div>
    </div>
  );
}