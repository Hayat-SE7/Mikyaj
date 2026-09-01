import { useState } from 'react';
import { 
  User, 
  Clock, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Check, 
  AlertCircle, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Stylist, ServiceItem } from '../../types';

interface AdminStaffViewProps {
  stylists: Stylist[];
  services: ServiceItem[];
  onToggleBookable: (stylistId: string) => void;
  onUpdateQualifiedServices: (stylistId: string, serviceIds: string[]) => void;
  onAddLeavePeriod: (stylistId: string, leave: { start: string; end: string; reason: string }) => void;
}

export default function AdminStaffView({
  stylists,
  services,
  onToggleBookable,
  onUpdateQualifiedServices,
  onAddLeavePeriod
}: AdminStaffViewProps) {
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const handleOpenSkillsModal = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setSelectedServiceIds(stylist.qualifiedServiceIds || services.map(s => s.id));
  };

  const handleToggleServiceSelection = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleSaveQualifications = () => {
    if (selectedStylist) {
      onUpdateQualifiedServices(selectedStylist.id, selectedServiceIds);
      setSelectedStylist(null);
    }
  };

  const handleOpenLeaveModal = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
    setIsLeaveModalOpen(true);
  };

  const handleSaveLeave = () => {
    if (selectedStylist && leaveStart && leaveEnd) {
      onAddLeavePeriod(selectedStylist.id, {
        start: leaveStart,
        end: leaveEnd,
        reason: leaveReason || 'Annual / Sick Leave'
      });
      setIsLeaveModalOpen(false);
      setSelectedStylist(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Staff Rostering & Qualifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage staff availability, qualified service matrices, shift hours, and leave schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {stylists.filter(s => s.id !== 'any').length} Active Stylists
          </span>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stylists.filter(s => s.id !== 'any').map((stylist) => {
          const qualifiedCount = stylist.qualifiedServiceIds ? stylist.qualifiedServiceIds.length : services.length;

          return (
            <div 
              key={stylist.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs hover:border-pink-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      referrerPolicy="no-referrer"
                      src={stylist.avatarUrl}
                      alt={stylist.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-100"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{stylist.name}</h3>
                      <p className="text-xs text-pink-600 font-semibold">{stylist.role}</p>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {stylist.id}</span>
                    </div>
                  </div>

                  {/* Bookable Toggle */}
                  <button
                    onClick={() => onToggleBookable(stylist.id)}
                    className="flex flex-col items-end gap-0.5"
                    title="Toggle customer bookable status"
                  >
                    {stylist.bookable ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Bookable
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Off-duty
                      </span>
                    )}
                  </button>
                </div>

                {/* Badges: Workload, Rating, Experience */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rating</span>
                    <span className="font-bold text-slate-800">★ {stylist.rating}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Experience</span>
                    <span className="font-bold text-slate-800">{stylist.experienceYears ? `${stylist.experienceYears}y` : stylist.experience}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Load</span>
                    <span className="font-bold text-[#FF2B72]">{stylist.currentActiveWorkload ?? 0}</span>
                  </div>
                </div>

                {/* Shift Hours & Qualified Count */}
                <div className="text-xs space-y-1 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Working Shift:</span>
                    <span className="font-bold text-slate-800">{stylist.workingHours || '10:00 AM - 08:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Qualified Menu:</span>
                    <span className="font-bold text-[#FF2B72]">{qualifiedCount} / {services.length} services</span>
                  </div>
                </div>

                {/* Leave / Absences (FR-A-STAF-03) */}
                {stylist.leavePeriods && stylist.leavePeriods.length > 0 && (
                  <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 text-[10px] text-rose-800">
                    <strong>Scheduled Absence:</strong>
                    {stylist.leavePeriods.map((l, i) => (
                      <div key={i} className="mt-0.5">{l.start} to {l.end} ({l.reason})</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenSkillsModal(stylist)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-pink-600" />
                  <span>Skills</span>
                </button>

                <button
                  onClick={() => handleOpenLeaveModal(stylist)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Leave</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: Qualified Service Matrix (FR-A-STAF-02) */}
      {selectedStylist && !isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Service Qualifications</h3>
                <p className="text-xs text-slate-500">Configure eligible treatments for {selectedStylist.name}</p>
              </div>
              <button
                onClick={() => setSelectedStylist(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <label
                    key={srv.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-pink-50/60 border-pink-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleServiceSelection(srv.id)}
                        className="rounded text-[#FF2B72] focus:ring-[#FF2B72]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{srv.title}</span>
                        <span className="text-[10px] text-slate-400">{srv.category} • {srv.duration}m • Rs. {srv.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStylist(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQualifications}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] text-white shadow-xs"
              >
                Save Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Leave / Blocked Period (FR-A-STAF-03) */}
      {isLeaveModalOpen && selectedStylist && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-[#FF2B72]" />
              <div>
                <h3 className="font-bold text-base text-slate-900">Schedule Staff Absence</h3>
                <p className="text-xs text-slate-500">Block availability for {selectedStylist.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={leaveStart}
                  onChange={(e) => setLeaveStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={leaveEnd}
                  onChange={(e) => setLeaveEnd(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="E.g., Eid Holiday, Medical leave, Training workshop"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLeave}
                disabled={!leaveStart || !leaveEnd}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] text-white disabled:opacity-50"
              >
                Confirm Absence
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
