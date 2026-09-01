import { Sparkles, Check, ArrowRight, Clock, Star, Gift } from 'lucide-react';
import { PackageOffer } from '../types';

interface PackagesViewProps {
  packages: PackageOffer[];
  onSelectPackage: (pkg: PackageOffer) => void;
}

export default function PackagesView({ packages, onSelectPackage }: PackagesViewProps) {
  return (
    <div className="space-y-8 mb-12 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FFF5F8] via-[#FFF0F5] to-[#FFF5F8] rounded-3xl border border-rose-200/80 p-6 sm:p-10 text-center space-y-3 shadow-lux">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-xs font-bold text-[#FF2B72] border border-rose-200 shadow-xs">
          <Gift className="w-3.5 h-3.5" />
          <span>Exclusive Seasonal Curations</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E293B]">
          Special Packages & Pampering Bundles
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Save up to 30% with our all-inclusive beauty, skincare, and bridal rituals crafted by master aesthetic specialists.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            id={`package-card-${pkg.id}`}
            className="bg-white rounded-3xl border border-slate-200 hover:border-rose-300 shadow-lux hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  referrerPolicy="no-referrer"
                  src={pkg.imageUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#FF2B72] text-white shadow-md">
                  {pkg.badge}
                </span>

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-slate-800 shadow-md">
                  {pkg.duration}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-[#FF2B72] transition-colors leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{pkg.tagline}</p>
                </div>

                {/* Price block */}
                <div className="p-3 bg-[#FFF5F8] rounded-2xl border border-rose-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block line-through">
                      Rs. {pkg.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-[#FF2B72]">
                      Rs. {pkg.discountedPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                    Save {pkg.discountPercentage}%
                  </span>
                </div>

                {/* Services included list */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Included Treatments:
                  </span>
                  <div className="space-y-1.5">
                    {pkg.servicesIncluded.map((serviceName, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-[#FF2B72] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{serviceName}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* CTA Button */}
            <div className="p-5 sm:p-6 pt-0">
              <button
                id={`book-package-btn-${pkg.id}`}
                onClick={() => onSelectPackage(pkg)}
                className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Book This Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">{pkg.validTill}</p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
