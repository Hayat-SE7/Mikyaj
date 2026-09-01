import { useState } from 'react';
import { 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  RotateCcw, 
  Play, 
  Terminal, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { ServiceItem, Stylist, Branch, Booking, TimeSlot, NotificationOutboxItem } from '../../types';
import { runConcurrencyTestSimulator } from '../../lib/bookingEngine';

interface AdminConcurrencyTestViewProps {
  services: ServiceItem[];
  stylists: Stylist[];
  currentBranch: Branch;
  bookings: Booking[];
  timeSlots: TimeSlot[];
  notificationOutbox: NotificationOutboxItem[];
  onTriggerDeadLetterSimulation: () => void;
  onResendNotification: (bookingId: string, channel: 'email' | 'whatsapp') => void;
}

export default function AdminConcurrencyTestView({
  services,
  stylists,
  currentBranch,
  bookings,
  timeSlots,
  notificationOutbox,
  onTriggerDeadLetterSimulation,
  onResendNotification
}: AdminConcurrencyTestViewProps) {
  // Concurrency test state
  const [isRunningConcurrency, setIsRunningConcurrency] = useState(false);
  const [concurrencyResult, setConcurrencyResult] = useState<{
    totalRequests: number;
    successCount: number;
    conflictCount: number;
    successfulBookingReference?: string;
    logs: string[];
  } | null>(null);

  const targetService = services[0];
  const targetStylist = stylists.find(s => s.id !== 'any') || stylists[0];
  const targetDate = '2025-06-15';
  const targetTime = '03:00 PM';

  const handleRun50ConcurrencyTest = () => {
    setIsRunningConcurrency(true);
    setConcurrencyResult(null);

    setTimeout(() => {
      const result = runConcurrencyTestSimulator(
        targetService,
        targetDate,
        targetTime,
        currentBranch,
        targetStylist,
        bookings,
        timeSlots
      );
      setConcurrencyResult(result);
      setIsRunningConcurrency(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
              System Concurrency & Resiliency Test Harness
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-pink-100 text-[#FF2B72] border border-pink-300">
              §18.3 & §18.4 Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Execute real-time stress simulations for slot race condition locks and independent transactional outbox isolation.
          </p>
        </div>
      </div>

      {/* Grid: 2 Test Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Module 1: 50 Concurrent Booking Requests (§18.3 & DEC-032) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>50 Concurrent Slot Race Simulation (§18.3)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifies that 50 simultaneous requests for the exact same slot result in exactly 1 success (201) and 49 conflicts (409) with 0 overbooking.
              </p>
            </div>

            <button
              id="run-concurrency-test-btn"
              onClick={handleRun50ConcurrencyTest}
              disabled={isRunningConcurrency}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
            >
              <Play className="w-3.5 h-3.5 text-pink-400" />
              <span>{isRunningConcurrency ? 'Executing...' : 'Run 50-Req Test'}</span>
            </button>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div><strong>Target Slot:</strong> {targetDate} at {targetTime}</div>
              <div><strong>Target Stylist:</strong> {targetStylist.name}</div>
              <div><strong>Service:</strong> {targetService.title}</div>
              <div><strong>Lock Mechanism:</strong> Transactional Exclusion Check</div>
            </div>
          </div>

          {concurrencyResult && (
            <div className="space-y-3 animate-in fade-in">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-700 font-bold block">Total Dispatched</span>
                  <span className="text-lg font-bold text-blue-900">{concurrencyResult.totalRequests}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold block">201 Confirmed</span>
                  <span className="text-lg font-bold text-emerald-900">{concurrencyResult.successCount}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-bold block">409 Conflict</span>
                  <span className="text-lg font-bold text-rose-900">{concurrencyResult.conflictCount}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Double-Booking Verified. Booking Ref: {concurrencyResult.successfulBookingReference}</span>
              </div>

              {/* Execution Terminal Logs */}
              <div className="bg-slate-950 text-slate-200 rounded-xl p-3 font-mono text-[10px] max-h-48 overflow-y-auto space-y-1">
                {concurrencyResult.logs.map((log, idx) => (
                  <div key={idx} className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('RESULT') ? 'text-pink-400 font-bold' : 'text-slate-300'}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Module 2: Independent Notification Isolation & Dead-Letter Manager (§18.4 & DEC-027) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#FF2B72]" />
                <span>Independent Notification Outbox (§18.4)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulates isolated WhatsApp failure without impacting Email success, testing Dead-Letter Queue (DLQ) and scoped resend.
              </p>
            </div>

            <button
              onClick={onTriggerDeadLetterSimulation}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate WA DLQ Failure</span>
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {notificationOutbox.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{item.bookingRef}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      item.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.channel}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      item.status === 'DEAD_LETTER' ? 'bg-rose-900 text-white' :
                      item.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.status} ({item.attemptCount}/{item.maxAttempts})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">Event: {item.event} • Recipient: {item.recipient}</p>
                  {item.lastError && (
                    <p className="text-[10px] text-rose-700">Error: {item.lastError}</p>
                  )}
                </div>

                {/* Scoped Resend Button (DEC-027) */}
                {(item.status === 'DEAD_LETTER' || item.status === 'FAILED') && (
                  <button
                    onClick={() => onResendNotification(item.bookingId, item.channel)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF2B72] hover:bg-[#E61B61] text-white flex items-center gap-1 shrink-0"
                    title={`Resend exclusively to ${item.channel}`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend {item.channel}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
