import { Shield, Sparkles, User, Bell, ArrowLeftRight, Clock, AlertTriangle } from 'lucide-react';
import { AdminUser, Booking } from '../../types';

interface AdminHeaderProps {
  currentAdmin: AdminUser;
  onToggleAdminRole: (isOwner: boolean) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchToCustomerPortal: () => void;
  pendingCount: number;
  deadLetterCount: number;
}

export default function AdminHeader({
  currentAdmin,
  onToggleAdminRole,
  activeTab,
  onSelectTab,
  onSwitchToCustomerPortal,
  pendingCount,
  deadLetterCount
}: AdminHeaderProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'bookings', label: 'Bookings', badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'customers', label: 'Customers' },
    { id: 'staff', label: 'Staff & Schedules' },
    { id: 'services', label: 'Services & Menu' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'settings', label: 'Policies & Audit' },
    { id: 'concurrency-test', label: 'Engine Test (§18.3)' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF2B72] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              M
            </div>
            <div>
              <span className="font-serif font-black tracking-wider text-sm text-white">MIKYAJ</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-800 text-pink-400 border border-pink-500/20">
                Admin Console
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Asia/Karachi • Engine Online</span>
          </div>
        </div>

        {/* Right Action Tools: Role Switcher & Customer Portal Switch */}
        <div className="flex items-center gap-3">
          {/* Dead-Letter Alert Pill if any */}
          {deadLetterCount > 0 && (
            <button
              onClick={() => onSelectTab('bookings')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/50 animate-pulse"
              title="Dead-Letter Notifications Detected"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{deadLetterCount} Dead-Letter Outbox</span>
            </button>
          )}

          {/* Role Switcher for Testing (§7 Enforced Levels) */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase tracking-wider">Role:</span>
            <button
              onClick={() => onToggleAdminRole(true)}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                currentAdmin.isOwner
                  ? 'bg-[#FF2B72] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Owner-flagged admin with full financial revenue & policy override access"
            >
              👑 Owner (Hayat)
            </button>
            <button
              onClick={() => onToggleAdminRole(false)}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                !currentAdmin.isOwner
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Standard admin with financial totals masked"
            >
              Staff Desk
            </button>
          </div>

          {/* Switch to Customer Portal Button */}
          <button
            onClick={onSwitchToCustomerPortal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-pink-300" />
            <span>Customer Portal</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3.5 py-2.5 text-xs font-bold whitespace-nowrap rounded-lg transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-slate-800 border-b-2 border-[#FF2B72]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF2B72] text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
