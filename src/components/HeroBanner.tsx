import { Sparkles, ArrowRight, Star, ShieldCheck, HeartHandshake, Award, Users, Gift } from 'lucide-react';

interface HeroBannerProps {
  onBookClick: () => void;
  onExplorePackages: () => void;
}

export default function HeroBanner({ onBookClick, onExplorePackages }: HeroBannerProps) {
  return (
    <div className="space-y-6 mb-8">
      {/* 1. Main Editorial Gradient Banner (Signature Look) */}
      <section className="relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#FF2B72] via-[#FF4585] to-[#FF85AB] overflow-hidden shadow-lg shadow-pink-100 text-white p-6 sm:p-10 lg:p-12">
        {/* Decorative Geometric Rings */}
        <div className="absolute inset-0 opacity-15 flex flex-wrap gap-4 p-4 pointer-events-none">
          <div className="w-28 h-28 sm:w-44 sm:h-44 border-2 border-white rounded-full -top-10 -left-10 absolute"></div>
          <div className="w-56 h-56 sm:w-80 sm:h-80 border-2 border-white rounded-full -bottom-20 right-10 absolute"></div>
          <div className="w-32 h-32 border border-white rounded-full top-6 right-1/3 absolute hidden md:block"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/30 shadow-xs">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Special Seasonal Curations • Up to 20% Off</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold italic leading-tight text-white">
                Hydra Facial & Skincare Packages
              </h1>
              <p className="text-xs sm:text-sm lg:text-base mt-2 opacity-95 font-light leading-relaxed max-w-xl text-pink-50">
                Experience clinical dermatology facials, bespoke bridal makeovers, and luxury hair styling crafted by internationally certified master aestheticians.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-book-now-btn"
                onClick={onBookClick}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#FF2B72] bg-white hover:bg-pink-50 shadow-md shadow-pink-900/20 active:scale-95 transition-all flex items-center gap-2 group"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-explore-packages-btn"
                onClick={onExplorePackages}
                className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/40 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>View Packages</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/20">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  referrerPolicy="no-referrer"
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Client"
                />
                <img
                  referrerPolicy="no-referrer"
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                  alt="Client"
                />
                <img
                  referrerPolicy="no-referrer"
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Client"
                />
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white text-[#FF2B72] text-[10px] font-bold ring-2 ring-white">
                  +10k
                </div>
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-300 text-amber-300" />
                  ))}
                  <span className="font-bold text-white ml-1">4.9/5</span>
                </div>
                <p className="text-[11px] text-pink-100">10,000+ Happy Parlor Clients</p>
              </div>
            </div>
          </div>

          {/* Right Image Visual Box */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl border-2 border-white/50 aspect-[4/3.5] bg-rose-900/30">
              <img
                referrerPolicy="no-referrer"
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"
                alt="Mikyaj Beauty Transformation"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/60 flex items-center justify-between text-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900">Mikyaj Signature Bridal</p>
                  <p className="text-[10px] text-[#FF2B72] font-semibold">✨ Master Stylist Sana Malik</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 line-through">Rs. 18,000</p>
                  <p className="text-xs font-bold text-[#FF2B72]">Rs. 15,000</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Editorial Trust Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#FFF5F8] text-[#FF2B72] flex items-center justify-center shrink-0 border border-[#FF2B72]/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Top Experts</h4>
            <p className="text-[10px] text-slate-500">Certified Specialists</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#FFF5F8] text-[#FF2B72] flex items-center justify-center shrink-0 border border-[#FF2B72]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Premium Products</h4>
            <p className="text-[10px] text-slate-500">Imported Formulations</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/50">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Hygienic & Safe</h4>
            <p className="text-[10px] text-slate-500">Autoclave Sterilized</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#FFF5F8] text-[#FF2B72] flex items-center justify-center shrink-0 border border-[#FF2B72]/20">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Affordable Luxury</h4>
            <p className="text-[10px] text-slate-500">Transparent Pricing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
