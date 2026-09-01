import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  DollarSign, 
  Sparkles, 
  Plus, 
  Eye, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  MessageSquare,
  Lock
} from 'lucide-react';
import { Booking, Stylist, AdminUser, Branch, AuditLogItem } from '../../types';

interface AdminDashboardProps {
  bookings: Booking[];
  stylists: Stylist[];
  currentBranch: Branch;
  currentAdmin: AdminUser;
  onAcceptBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason?: string) => void;
  onOpenBookingDetails: (booking: Booking) => void;
  onOpenWalkInModal: () => void;
  onNavigateToBookings: () => void;
  auditLogs: AuditLogItem[];
}

export default function AdminDashboard({
  bookings,
  stylists,
  currentBranch,
  currentAdmin,
  onAcceptBooking,
  onRejectBooking,
  onOpenBookingDetails,
  onOpenWalkInModal,
  onNavigateToBookings,
  auditLogs
}: AdminDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>('2025-06-12');

  // Filter bookings for today / selected date
  const dateBookings = bookings.filter(b => b.date === selectedDate);
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const acceptedBookings = dateBookings.filter(b => b.status === 'ACCEPTED');
  const inProgressBookings = dateBookings.filter(b => b.status === 'IN_PROGRESS');
  const completedBookings = dateBookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = dateBookings.filter(b => b.status === 'CANCELLED');

  // Revenue Calculation (PKR) - Same-day revenue (FR-A-DASH-04)
  const todayRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const projectedRevenue = dateBookings
    .filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Time grid slots (10:00 AM to 08:00 PM)
  const timeHeaders = [
    '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
    '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Salon Operations Dashboard</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#FF2B72]">
              {currentBranch.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time schedule grid, pending approval queues, and staff dispatch overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white"
          />
          <button
            onClick={onOpenWalkInModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Walk-in Booking</span>
          </button>
        </div>
      </div>

      {/* 1. Today's Metric Stat Cards (FR-A-DASH-01, FR-A-DASH-04) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Bookings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Today</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{dateBookings.length}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Active appointments</span>
        </div>

        {/* Pending Approvals */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Action</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">{pendingBookings.length}</p>
          <span className="text-[10px] text-amber-700 mt-1 block">Sorted oldest first</span>
        </div>

        {/* Accepted / Confirmed */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Confirmed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{acceptedBookings.length}</p>
          <span className="text-[10px] text-emerald-700 mt-1 block">Ready for check-in</span>
        </div>

        {/* In Progress */}
        <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">In Service</span>
          <p className="text-2xl font-bold text-purple-900 mt-1">{inProgressBookings.length}</p>
          <span className="text-[10px] text-purple-700 mt-1 block">Currently on chair</span>
        </div>

        {/* Completed */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{completedBookings.length}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Reviews requested</span>
        </div>

        {/* Revenue PKR (Owner-Flagged Admin Only per FR-A-DASH-04 / §7) */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          currentAdmin.isOwner 
            ? 'bg-rose-50/70 border-rose-200' 
            : 'bg-slate-100 border-slate-200 opacity-90'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
              {currentAdmin.isOwner ? 'Today Revenue' : 'Financials'}
            </span>
            {currentAdmin.isOwner ? (
              <DollarSign className="w-4 h-4 text-[#FF2B72]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          {currentAdmin.isOwner ? (
            <>
              <p className="text-lg sm:text-xl font-bold text-[#FF2B72] mt-1">
                Rs. {todayRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-rose-700 mt-0.5 block">
                Proj: Rs. {projectedRevenue.toLocaleString()}
              </span>
            </>
          ) : (
            <div className="mt-2 text-[10px] text-slate-500">
              <span className="font-semibold block text-slate-700">Owner Confidential</span>
              <span>Requires Hayat role</span>
            </div>
          )}
        </div>

      </div>

      {/* 2. Main 2-Column Split: Pending Queue (5 cols) & Today's Schedule Grid (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Pending Approval Queue (FR-A-DASH-02, sorted oldest-first) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>Pending Approvals Queue</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {pendingBookings.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">Sorted oldest first for fast dispatch</p>
            </div>

            <button
              onClick={onNavigateToBookings}
              className="text-xs font-bold text-[#FF2B72] hover:underline flex items-center gap-1"
            >
              <span>All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">All caught up!</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No bookings awaiting admin confirmation.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {pendingBookings.map((b) => (
                <div 
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-pink-300 transition-all bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {b.reference}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 mt-1">{b.serviceTitle}</h4>
                      <p className="text-[11px] text-slate-600">{b.customerName} • {b.customerPhone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#FF2B72]">
                        Rs. {b.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {b.date} • {b.time}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] bg-white p-2 rounded-lg border border-slate-100 flex items-center justify-between text-slate-600">
                    <span>Stylist: <strong>{b.stylistName}</strong></span>
                    <span className="text-[10px] text-slate-400">{b.duration} mins</span>
                  </div>

                  {b.specialRequests && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200/60 line-clamp-2">
                      <strong>Note:</strong> {b.specialRequests}
                    </p>
                  )}

                  {/* Accept / Reject Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id={`accept-bkg-btn-${b.id}`}
                      onClick={() => onAcceptBooking(b.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept & Notify</span>
                    </button>

                    <button
                      id={`reject-bkg-btn-${b.id}`}
                      onClick={() => onRejectBooking(b.id, 'Slot unavailable')}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenBookingDetails(b)}
                      title="Details"
                      className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Today's Schedule Grid (FR-A-DASH-03, Staff-by-time grid) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF2B72]" />
                <span>Today&apos;s Staff Schedule Matrix</span>
              </h2>
              <p className="text-[11px] text-slate-500">Live booking slots for {selectedDate}</p>
            </div>

            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {dateBookings.filter(b => b.status !== 'CANCELLED').length} Sessions
            </span>
          </div>

          {/* Schedule Grid */}
          <div className="space-y-3">
            {stylists.filter(s => s.id !== 'any').map((stylist) => {
              const stylistBookings = dateBookings.filter(b => 
                b.stylistId === stylist.id && b.status !== 'CANCELLED'
              );

              return (
                <div key={stylist.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        referrerPolicy="no-referrer"
                        src={stylist.avatarUrl}
                        alt={stylist.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{stylist.name}</h4>
                        <p className="text-[10px] text-slate-500">{stylist.role} • Shift: {stylist.workingHours || '10 AM - 8 PM'}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {stylistBookings.length} bookings today
                    </span>
                  </div>

                  {/* Slot chips for this stylist */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {stylistBookings.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">No bookings scheduled yet today. Available for walk-ins.</span>
                    ) : (
                      stylistBookings.map((b) => {
                        const statusColor = 
                          b.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700 border-slate-300' :
                          b.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                          b.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          'bg-amber-100 text-amber-800 border-amber-300';

                        return (
                          <button
                            key={b.id}
                            onClick={() => onOpenBookingDetails(b)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-transform hover:scale-105 shrink-0 ${statusColor}`}
                          >
                            <span>{b.time}</span>
                            <span className="mx-1">•</span>
                            <span className="font-mono">{b.reference}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Recent Activity & Audit Log Stream (FR-A-DASH-05, DEC-020) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Immutable Activity & System Audit Feed</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Append-Only Application Trail</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {auditLogs.slice(0, 3).map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-700">{log.actorName} ({log.actorRole})</span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="font-bold text-slate-900">{log.action}</p>
              {log.reason && <p className="text-[11px] text-slate-600">Reason: &quot;{log.reason}&quot;</p>}
              <span className="text-[10px] text-pink-600 font-mono block">Entity: {log.entityType} #{log.entityId}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
