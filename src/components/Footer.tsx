import { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Heart, 
  Smile, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowUpRight, 
  MessageSquare, 
  CheckCircle,
  HelpCircle,
  Clock,
  Star
} from 'lucide-react';
import { Booking } from '../types';

interface FooterProps {
  activeUpcomingBooking?: Booking | null;
  onOpenBookingTab: () => void;
  onOpenSupport: () => void;
  onOpenReviews: () => void;
  onOpenPolicies: () => void;
  onSelectTab: (tab: string) => void;
}

export default function Footer({
  activeUpcomingBooking,
  onOpenBookingTab,
  onOpenSupport,
  onOpenReviews,
  onOpenPolicies,
  onSelectTab
}: FooterProps) {
  return (
    <footer className="bg-white border-t border-rose-100/80 pt-10 pb-8 mt-16 space-y-10">
      
      {/* 1. Active Appointment Floating/Pinned Tracking Ribbon */}
      {activeUpcomingBooking && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#FFF5F8] via-[#FFF9FA] to-[#FFF0F5] border border-rose-200 rounded-3xl p-4 sm:p-5 shadow-lux flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FF2B72] text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active Appointment Tracking
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    ID: {activeUpcomingBooking.id}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 mt-0.5">
                  Upcoming Booking: {activeUpcomingBooking.serviceTitle} on{' '}
                  <span className="text-[#FF2B72]">
                    {activeUpcomingBooking.date} at {activeUpcomingBooking.time}
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  {activeUpcomingBooking.branchName} • Stylist: {activeUpcomingBooking.stylistName}
                </p>
              </div>
            </div>

            <button
              id="footer-view-active-booking-btn"
              onClick={onOpenBookingTab}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Manage Booking</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. 5 Trust Highlights (Matching Reference Screenshot) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-8 border-y border-rose-100/70">
          
          <div className="text-center sm:text-left space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#FF2B72] flex items-center justify-center mx-auto sm:mx-0">
              <Award className="w-5 h-5" />
            </div>
            <h5 className="text-xs font-bold text-slate-900">Premium Products</h5>
            <p className="text-[11px] text-slate-500 leading-snug">
              Top quality imported products for the best care
            </p>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#FF2B72] flex items-center justify-center mx-auto sm:mx-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <h5 className="text-xs font-bold text-slate-900">Expert Professionals</h5>
            <p className="text-[11px] text-slate-500 leading-snug">
              Certified & highly experienced beauty experts
            </p>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h5 className="text-xs font-bold text-slate-900">Hygienic & Safe</h5>
            <p className="text-[11px] text-slate-500 leading-snug">
              We follow 100% autoclave hygiene & safety standards
            </p>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#FF2B72] flex items-center justify-center mx-auto sm:mx-0">
              <Heart className="w-5 h-5" />
            </div>
            <h5 className="text-xs font-bold text-slate-900">Personalized Care</h5>
            <p className="text-[11px] text-slate-500 leading-snug">
              Tailored treatments crafted uniquely for your skin & hair
            </p>
          </div>

          <div className="text-center sm:text-left space-y-1.5 col-span-2 md:col-span-1">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#FF2B72] flex items-center justify-center mx-auto sm:mx-0">
              <Smile className="w-5 h-5" />
            </div>
            <h5 className="text-xs font-bold text-slate-900">Satisfaction Guaranteed</h5>
            <p className="text-[11px] text-slate-500 leading-snug">
              Your happiness & glowing confidence is our priority
            </p>
          </div>

        </div>
      </div>

      {/* 3. Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FF2B72] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-serif font-bold text-slate-900">Mikyaj</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mikyaj Beauty Parlor delivers royal pampering, bespoke bridal artistry, and clinical skincare across Lahore, Karachi, and Islamabad.
            </p>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-slate-700 font-bold ml-1">4.9 / 5.0 Rating</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Navigation
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-[#FF2B72] transition-colors">
                  Services & Treatments
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('packages')} className="hover:text-[#FF2B72] transition-colors">
                  Special Bridal & Glow Packages
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('stylists')} className="hover:text-[#FF2B72] transition-colors">
                  Our Master Stylists & Aestheticians
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('branches')} className="hover:text-[#FF2B72] transition-colors">
                  Parlor Branches & Studios
                </button>
              </li>
              <li>
                <button onClick={onOpenBookingTab} className="hover:text-[#FF2B72] transition-colors font-semibold text-[#FF2B72]">
                  My Bookings Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Policies */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Support & Policies
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button onClick={onOpenSupport} className="hover:text-[#FF2B72] transition-colors">
                  Customer Support & Help Desk
                </button>
              </li>
              <li>
                <button onClick={onOpenPolicies} className="hover:text-[#FF2B72] transition-colors">
                  Salon Policies & Cancellation
                </button>
              </li>
              <li>
                <button onClick={onOpenReviews} className="hover:text-[#FF2B72] transition-colors">
                  Submit Customer Review
                </button>
              </li>
              <li>
                <button onClick={onOpenPolicies} className="hover:text-[#FF2B72] transition-colors">
                  Hygiene & Sterilization Protocol
                </button>
              </li>
              <li>
                <span className="text-slate-400">NTN: 8492041-3</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Contact & Hours
            </h5>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF2B72] shrink-0 mt-0.5" />
                <span>56, Main Boulevard, Gulberg III, Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF2B72] shrink-0" />
                <span>+92 42 3575 8899 / +92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF2B72] shrink-0" />
                <span>10:00 AM – 09:00 PM (Everyday)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-600">Portal Systems Operational • Autoclave Certified</span>
          </div>
          <p>© 2025 Mikyaj Beauty Parlor. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[11px]">
            <button onClick={onOpenPolicies} className="hover:underline">Privacy</button>
            <span>•</span>
            <button onClick={onOpenPolicies} className="hover:underline">Terms</button>
            <span>•</span>
            <button onClick={onOpenSupport} className="hover:underline">Concierge</button>
          </div>
        </div>

      </div>

    </footer>
  );
}
