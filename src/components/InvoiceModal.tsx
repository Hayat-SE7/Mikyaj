import { X, Download, Printer, CheckCircle, Sparkles, MapPin, Phone, Mail } from 'lucide-react';
import { Booking } from '../types';

interface InvoiceModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function InvoiceModal({ booking, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Official Booking Receipt
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div className="border border-rose-100 rounded-2xl p-6 bg-[#FFFDFE] space-y-5">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-rose-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-bold text-[#1E293B]">Mikyaj</span>
                <span className="text-[10px] font-bold text-[#FF2B72] uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md">
                  Beauty Parlor
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">NTN: 8492041-3 • Luxury Salon Registry</p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Invoice ID</span>
              <span className="font-mono font-bold text-xs text-[#FF2B72]">{booking.id}</span>
            </div>
          </div>

          {/* Client & Branch info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Billed To:</span>
              <p className="font-bold text-slate-800">{booking.customerName}</p>
              <p className="text-slate-500 text-[11px]">{booking.customerPhone}</p>
              <p className="text-slate-500 text-[11px]">{booking.customerEmail}</p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Location:</span>
              <p className="font-bold text-slate-800">{booking.branchName}</p>
              <p className="text-slate-500 text-[11px]">{booking.branchAddress}</p>
              <p className="text-slate-500 text-[11px]">Appointment: {booking.date} @ {booking.time}</p>
            </div>
          </div>

          {/* Treatment items breakdown */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Treatment Summary</span>
            <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{booking.serviceTitle}</p>
                <p className="text-[11px] text-slate-500">Stylist: {booking.stylistName} • {booking.duration} Min</p>
              </div>
              <span className="font-bold text-slate-800">Rs. {booking.servicePrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Price totals */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-rose-100">
            <div className="flex justify-between text-slate-500">
              <span>Service Subtotal:</span>
              <span>Rs. {booking.servicePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST / Sales Tax (5%):</span>
              <span>Rs. {booking.tax.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-rose-200 flex justify-between text-sm font-bold">
              <span className="text-slate-900">Total Net Amount:</span>
              <span className="text-[#FF2B72]">Rs. {booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Booking Confirmed • Pay at Salon (Cash / Card)</span>
          </div>

        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          
          <button
            onClick={() => alert(`Receipt PDF for ${booking.id} downloaded.`)}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}
