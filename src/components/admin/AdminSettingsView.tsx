import { useState } from 'react';
import { 
  Sliders, 
  Clock, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  Save, 
  CheckCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { SalonPolicyConfig, AuditLogItem, AdminUser } from '../../types';

interface AdminSettingsViewProps {
  policies: SalonPolicyConfig;
  onUpdatePolicies: (updatedPolicies: SalonPolicyConfig) => void;
  auditLogs: AuditLogItem[];
  currentAdmin: AdminUser;
}

export default function AdminSettingsView({
  policies,
  onUpdatePolicies,
  auditLogs,
  currentAdmin
}: AdminSettingsViewProps) {
  const [localPolicies, setLocalPolicies] = useState<SalonPolicyConfig>({ ...policies });
  const [isSaved, setIsSaved] = useState(false);
  const [auditFilter, setAuditFilter] = useState('');

  const handleSave = () => {
    onUpdatePolicies(localPolicies);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.actorName.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.entityId.toLowerCase().includes(auditFilter.toLowerCase()) ||
    (log.reason && log.reason.toLowerCase().includes(auditFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">Salon Business Policies & System Audit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure cancellation thresholds, reschedule quotas, Meta WhatsApp templates, and inspect audit logs.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Policy Settings</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Salon operational policies updated and persisted across system.</span>
        </div>
      )}

      {/* 1. Operational Threshold Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FF2B72]" />
          <span>Booking Engine Business Constraints</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Cancellation Window */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Free Cancellation Window
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localPolicies.cancellationWindowHours}
                onChange={(e) => setLocalPolicies({ ...localPolicies, cancellationWindowHours: Number(e.target.value) })}
                className="w-20 p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              />
              <span className="text-xs text-slate-500">hours before</span>
            </div>
            <p className="text-[10px] text-slate-400">Enforced by BR-C-007 / BR-005. Customer self-service closes within this limit.</p>
          </div>

          {/* Max Reschedules */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Max Self-Service Reschedules
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localPolicies.maxReschedules}
                onChange={(e) => setLocalPolicies({ ...localPolicies, maxReschedules: Number(e.target.value) })}
                className="w-20 p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              />
              <span className="text-xs text-slate-500">times per booking</span>
            </div>
            <p className="text-[10px] text-slate-400">Enforced by BR-C-020 / DEC-004. 3rd attempt requires admin override.</p>
          </div>

          {/* Slot Increment */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Time Slot Granularity
            </label>
            <div className="flex items-center gap-2">
              <select
                value={localPolicies.slotIncrementMinutes}
                onChange={(e) => setLocalPolicies({ ...localPolicies, slotIncrementMinutes: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-400">Controls booking calendar slot generator interval.</p>
          </div>

          {/* Buffer Time */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Sanitization Buffer Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localPolicies.bufferTimeMinutes}
                onChange={(e) => setLocalPolicies({ ...localPolicies, bufferTimeMinutes: Number(e.target.value) })}
                className="w-20 p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              />
              <span className="text-xs text-slate-500">mins between apps</span>
            </div>
            <p className="text-[10px] text-slate-400">Station turnaround and tool sterilization buffer.</p>
          </div>

        </div>
      </div>

      {/* 2. Meta WhatsApp Registered Templates (§15.2, DEC-012) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900">Meta WhatsApp Business API Template Registry</h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            All 7 Templates APPROVED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'booking_created_wa', desc: 'Sent on new booking request dispatch (PENDING state)' },
            { name: 'booking_accepted_wa', desc: 'Sent when salon confirms appointment (ACCEPTED state)' },
            { name: 'booking_rejected_wa', desc: 'Sent when salon declines appointment with reason' },
            { name: 'booking_cancelled_wa', desc: 'Sent on customer or administrative cancellation' },
            { name: 'booking_rescheduled_wa', desc: 'Sent when appointment date/time is adjusted' },
            { name: 'booking_reminder_wa', desc: 'Sent 24h & 2h before scheduled appointment' },
            { name: 'review_request_wa', desc: 'Sent upon service completion (COMPLETED state)' },
          ].map(tpl => (
            <div key={tpl.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-[11px]">{tpl.name}</span>
                <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">APPROVED</span>
              </div>
              <p className="text-[11px] text-slate-500">{tpl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Immutable System Audit Logs (DEC-020, AUD-08) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-800" />
            <h2 className="font-bold text-sm text-slate-900">Immutable Audit Trail (Append-Only)</h2>
          </div>

          <div className="w-64">
            <input
              type="text"
              placeholder="Search audit trail..."
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Logged Justification / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-800">{log.actorName}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({log.actorRole})</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-bold text-[#FF2B72]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    {log.entityType} #{log.entityId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {log.reason ? (
                      <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80">
                        &quot;{log.reason}&quot;
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Standard execution</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
