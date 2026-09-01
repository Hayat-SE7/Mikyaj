import { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Bell, 
  User, 
  Calendar, 
  ChevronDown, 
  Phone, 
  Check, 
  Clock, 
  X,
  Heart,
  LogOut,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Branch, CustomerNotification, Booking } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  branches: Branch[];
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  notifications: CustomerNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  upcomingBookingCount: number;
  onOpenBooking: () => void;
  customerName?: string;
  activeBookings: Booking[];
  onSwitchToAdmin?: () => void;
}

export default function Header({
  currentTab,
  onSelectTab,
  branches,
  selectedBranch,
  onSelectBranch,
  notifications,
  onMarkNotificationAsRead,
  upcomingBookingCount,
  onOpenBooking,
  customerName = 'Hayat Khan',
  onSwitchToAdmin
}: HeaderProps) {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services & Treatments' },
    { id: 'packages', label: 'Special Packages' },
    { id: 'stylists', label: 'Our Stylists' },
    { id: 'branches', label: 'Locations / Branches' },
    { id: 'bookings', label: 'My Bookings', badge: upcomingBookingCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all">
      {/* Top micro-bar for announcements */}
      <div className="bg-[#FFF5F8] border-b border-rose-100/60 px-4 lg:px-8 py-1.5 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF2B72] text-white">
            Special Promo
          </span>
          <span className="font-medium text-slate-700">
            ✨ Hydra Facial & Skincare Packages – 20% Off This Week at All Branches!
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-xs">
          <span className="flex items-center gap-1 text-slate-600">
            <Phone className="w-3 h-3 text-[#FF2B72]" />
            Helpline: +92 42 3575 8899
          </span>
          <span className="text-rose-300">|</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Sterilized & Safe
          </span>
          {onSwitchToAdmin && (
            <>
              <span className="text-rose-300">|</span>
              <button
                id="header-switch-admin-btn"
                onClick={onSwitchToAdmin}
                className="px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] tracking-wide transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>⚙️ Staff / Admin Desk</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Stylized Mikyaj Logo */}
          <div 
            id="header-logo-btn"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF2B72] text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B] group-hover:text-[#FF2B72] transition-colors">
                  Mikyaj
                </span>
                <span className="text-xl sm:text-2xl font-light text-[#FF2B72]">
                  Parlor
                </span>
              </div>
              <span className="text-[9px] tracking-[0.2em] font-bold text-slate-400 uppercase -mt-1">
                Customer Portal
              </span>
            </div>
          </div>

          {/* Center: Main Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#FF2B72] bg-[#FFF5F8] border-b-2 border-[#FF2B72] shadow-xs'
                      : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FF2B72] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Branch Selector, Notifications, Profile & Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Branch Selector Dropdown */}
            <div className="relative">
              <button
                id="header-branch-selector"
                onClick={() => {
                  setShowBranchDropdown(!showBranchDropdown);
                  setShowNotificationMenu(false);
                  setShowProfileMenu(false);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FF2B72] bg-[#FFF5F8] hover:bg-pink-100/70 border border-[#FF2B72]/25 rounded-full transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FF2B72]" />
                <span className="max-w-[130px] truncate">{selectedBranch.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-[#FF2B72]" />
              </button>

              {showBranchDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-rose-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Your Preferred Branch
                  </div>
                  <div className="py-1 space-y-1">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        id={`branch-option-${branch.id}`}
                        onClick={() => {
                          onSelectBranch(branch);
                          setShowBranchDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedBranch.id === branch.id
                            ? 'bg-[#FFF5F8] text-[#FF2B72] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-slate-800">{branch.name}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{branch.address}</p>
                        </div>
                        {selectedBranch.id === branch.id && (
                          <Check className="w-4 h-4 text-[#FF2B72] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                id="header-notifications-btn"
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowBranchDropdown(false);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-slate-600 hover:text-[#FF2B72] hover:bg-[#FFF5F8] rounded-full transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF2B72] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-rose-100 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#FF2B72]" /> Notifications ({notifications.length})
                    </span>
                    <button 
                      onClick={() => setShowNotificationMenu(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          n.unread ? 'bg-[#FFF5F8] border border-rose-100' : 'bg-slate-50 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown ("Welcome, Hayat / Ayesha") */}
            <div className="relative">
              <button
                id="header-profile-btn"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowBranchDropdown(false);
                  setShowNotificationMenu(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-rose-50/70 border border-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#FF2B72]/10 text-[#FF2B72] flex items-center justify-center font-bold text-xs">
                  {customerName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 leading-none">Welcome,</span>
                  <span className="text-xs font-semibold text-slate-800 leading-none mt-0.5">
                    {customerName.split(' ')[0]}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-rose-100 p-2 z-50">
                  <div className="p-3 bg-[#FFF5F8] rounded-xl mb-2">
                    <p className="text-xs font-bold text-slate-900">{customerName}</p>
                    <p className="text-[11px] text-slate-500">hayatkhan@gmail.com</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold text-[10px] rounded-full">
                      👑 VIP Royal Member
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <button 
                      onClick={() => {
                        onSelectTab('bookings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#FF2B72]" /> My Appointments
                    </button>
                    <button 
                      onClick={() => {
                        onSelectTab('packages');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Percent className="w-3.5 h-3.5 text-[#FF2B72]" /> Member Offers & Perks
                    </button>
                    <button 
                      onClick={() => {
                        onSelectTab('services');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#FF2B72]" /> Favorite Treatments
                    </button>
                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button 
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400" /> Switch Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Book Appointment CTA Button */}
            <button
              id="header-book-cta-btn"
              onClick={onOpenBooking}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

          </div>

        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 bg-white gap-2 text-xs no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              currentTab === item.id
                ? 'bg-[#FF2B72] text-white font-semibold'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
