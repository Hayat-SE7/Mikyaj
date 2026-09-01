import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download, 
  Users, 
  Percent, 
  Lock, 
  Award,
  AlertCircle
} from 'lucide-react';
import { Booking, Stylist, ServiceItem, AdminUser } from '../../types';

interface AdminReportsViewProps {
  bookings: Booking[];
  stylists: Stylist[];
  services: ServiceItem[];
  currentAdmin: AdminUser;
}

export default function AdminReportsView({
  bookings,
  stylists,
  services,
  currentAdmin
}: AdminReportsViewProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Completed & valid bookings
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');
  const noShowBookings = bookings.filter(b => b.status === 'NO_SHOW');

  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTax = completedBookings.reduce((sum, b) => sum + b.tax, 0);

  const cancellationRate = bookings.length > 0
    ? ((cancelledBookings.length / bookings.length) * 100).toFixed(1)
    : '0.0';

  const noShowRate = bookings.length > 0
    ? ((noShowBookings.length / bookings.length) * 100).toFixed(1)
    : '0.0';

  // Calculate service ranking
  const serviceCounts: Record<string, { count: number; revenue: number; title: string }> = {};
  bookings.forEach(b => {
    if (!serviceCounts[b.serviceTitle]) {
      serviceCounts[b.serviceTitle] = { count: 0, revenue: 0, title: b.serviceTitle };
    }
    serviceCounts[b.serviceTitle].count++;
    if (b.status === 'COMPLETED') {
      serviceCounts[b.serviceTitle].revenue += b.totalAmount;
    }
  });

  const topServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count);

  // Stylist performance
  const stylistStats = stylists.filter(s => s.id !== 'any').map(stylist => {
    const stylistBookings = bookings.filter(b => b.stylistId === stylist.id);
    const completed = stylistBookings.filter(b => b.status === 'COMPLETED').length;
    const rev = stylistBookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      stylist,
      total: stylistBookings.length,
      completed,
      revenue: rev
    };
  });

  const handleExportCSV = () => {
    const headers = 'Metric,Value\n';
    const rows = [
      `"Total Bookings Recorded",${bookings.length}`,
      `"Completed Appointments",${completedBookings.length}`,
      `"Cancelled Bookings",${cancelledBookings.length}`,
      `"No-Show Appointments",${noShowBookings.length}`,
      `"Cancellation Rate",${cancellationRate}%`,
      `"No-Show Rate",${noShowRate}%`,
      `"Total Revenue (PKR)",${currentAdmin.isOwner ? totalRevenue : 'Masked'}`
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mikyaj_analytics_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Reports & Salon Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Financial auditing in PKR, operational conversion metrics, and stylist productivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics CSV (FR-A-RPT-04)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Bookings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{bookings.length}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">{completedBookings.length} completed treatments</span>
        </div>

        {/* Revenue (Owner Only) */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          currentAdmin.isOwner ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
              {currentAdmin.isOwner ? 'Net Revenue (PKR)' : 'Financials'}
            </span>
            {currentAdmin.isOwner ? (
              <DollarSign className="w-4 h-4 text-[#FF2B72]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          {currentAdmin.isOwner ? (
            <>
              <p className="text-2xl font-bold text-[#FF2B72] mt-1">
                Rs. {totalRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-rose-700 mt-0.5 block">
                GST Tax: Rs. {totalTax.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-xs text-slate-500 block mt-2 font-medium">
              Masked for non-owner admin role.
            </span>
          )}
        </div>

        {/* Cancellation Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cancellation Rate</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{cancellationRate}%</p>
          <span className="text-[10px] text-slate-500 mt-1 block">{cancelledBookings.length} cancelled total</span>
        </div>

        {/* No Show Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No-Show Rate</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{noShowRate}%</p>
          <span className="text-[10px] text-slate-500 mt-1 block">{noShowBookings.length} no-show clients</span>
        </div>

      </div>

      {/* 2-Column Tables: Top Services & Stylist Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Services */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF2B72]" />
            <span>Top Performing Services by Volume</span>
          </h3>

          <div className="space-y-2">
            {topServices.map((srv, idx) => (
              <div key={srv.title} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{srv.title}</h4>
                    <span className="text-[11px] text-slate-500">{srv.count} total bookings</span>
                  </div>
                </div>

                {currentAdmin.isOwner && (
                  <span className="font-bold text-[#FF2B72]">
                    Rs. {srv.revenue.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stylist Productivity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-600" />
            <span>Stylist Appointment Dispatch & Workload</span>
          </h3>

          <div className="space-y-2">
            {stylistStats.map((st) => (
              <div key={st.stylist.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    referrerPolicy="no-referrer"
                    src={st.stylist.avatarUrl}
                    alt={st.stylist.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{st.stylist.name}</h4>
                    <span className="text-[11px] text-slate-500">{st.stylist.role} • ★ {st.stylist.rating}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-800">{st.completed} completed</span>
                  <span className="text-[10px] text-slate-400 block">{st.total} scheduled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
