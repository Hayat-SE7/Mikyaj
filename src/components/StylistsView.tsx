import { Star, Award, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { Stylist } from '../types';

interface StylistsViewProps {
  stylists: Stylist[];
  onBookWithStylist: (stylist: Stylist) => void;
}

export default function StylistsView({ stylists, onBookWithStylist }: StylistsViewProps) {
  return (
    <div className="space-y-8 mb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFF5F8] via-[#FFF0F5] to-[#FFF5F8] rounded-3xl border border-rose-200/80 p-6 sm:p-10 text-center space-y-3 shadow-lux">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-xs font-bold text-[#FF2B72] border border-rose-200 shadow-xs">
          <Award className="w-3.5 h-3.5" />
          <span>Certified Master Artists</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E293B]">
          Meet Our Expert Beauty Professionals
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Every Mikyaj stylist is internationally certified with years of specialized training in bridal makeup, skincare dermatology, and modern hair aesthetics.
        </p>
      </div>

      {/* Stylist cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stylists.filter(s => s.id !== 'any').map((stylist) => (
          <div
            key={stylist.id}
            id={`stylist-card-${stylist.id}`}
            className="bg-white rounded-3xl border border-slate-200 hover:border-rose-300 shadow-lux hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group p-5 text-center space-y-4"
          >
            <div className="space-y-3">
              {/* Avatar with ring */}
              <div className="relative mx-auto w-24 h-24">
                <img
                  referrerPolicy="no-referrer"
                  src={stylist.avatarUrl}
                  alt={stylist.name}
                  className="w-full h-full rounded-full object-cover ring-4 ring-rose-100 group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white" title="Available Today" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#FF2B72] transition-colors">
                  {stylist.name}
                </h3>
                <p className="text-xs font-semibold text-[#FF2B72] mt-0.5">{stylist.role}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stylist.experience}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-800">{stylist.rating}</span>
                <span className="text-slate-400 text-[11px]">({stylist.reviewsCount} reviews)</span>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1 justify-center pt-2">
                {stylist.specialty.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-[#FFF5F8] text-[#FF2B72] text-[10px] font-medium border border-rose-100"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Book CTA */}
            <button
              id={`book-with-${stylist.id}`}
              onClick={() => onBookWithStylist(stylist)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book with {stylist.name.split(' ')[0]}</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
