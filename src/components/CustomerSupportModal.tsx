import { useState } from 'react';
import { X, MessageSquare, Star, Send, ShieldCheck, HelpCircle, FileText, CheckCircle } from 'lucide-react';

interface CustomerSupportModalProps {
  type: 'support' | 'reviews' | 'policies';
  onClose: () => void;
}

export default function CustomerSupportModal({ type, onClose }: CustomerSupportModalProps) {
  const [activeTab, setActiveTab] = useState<'support' | 'reviews' | 'policies'>(type);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportSubmitted, setSupportSubmitted] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('support')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'support' ? 'bg-[#FF2B72] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Support Desk
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'reviews' ? 'bg-[#FF2B72] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Submit Review
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'policies' ? 'bg-[#FF2B72] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Salon Policies
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Support Helpdesk */}
        {activeTab === 'support' && (
          <div className="space-y-4 text-xs">
            <h4 className="text-base font-serif font-bold text-slate-900">
              Customer Concierge & Helpdesk
            </h4>
            <p className="text-slate-600">
              Have questions regarding bridal bookings, dermatologist skin consultations, or custom group events? Message our salon director.
            </p>

            {supportSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-emerald-800 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Message Sent Successfully!</p>
                <p className="text-xs">Our concierge will contact you via WhatsApp (+92 300 1234567) within 15 minutes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Inquiry / Message:</label>
                  <textarea
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Type your question or request..."
                    className="w-full p-3 bg-[#FAFAFA] border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF2B72] text-xs text-slate-800"
                  />
                </div>
                <button
                  disabled={!supportMessage.trim()}
                  onClick={() => setSupportSubmitted(true)}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Submit Review */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 text-xs">
            <h4 className="text-base font-serif font-bold text-slate-900">
              Share Your Salon Experience
            </h4>
            <p className="text-slate-600">
              We value your feedback. Help other customers find their dream beauty transformation.
            </p>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-emerald-800 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Thank You For Your Review!</p>
                <p className="text-xs">You have earned 200 Mikyaj Loyalty Reward points for this review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Rating:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="font-bold text-slate-700 ml-2">{rating}.0 / 5.0</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Feedback & Review:</label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about the stylist service, ambiance, and results..."
                    className="w-full p-3 bg-[#FAFAFA] border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF2B72] text-xs text-slate-800"
                  />
                </div>

                <button
                  disabled={!reviewText.trim()}
                  onClick={() => setReviewSubmitted(true)}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-[#FF2B72] hover:bg-[#E61B61] shadow-md flex items-center justify-center gap-2"
                >
                  <Star className="w-3.5 h-3.5 fill-white" /> Submit Review
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Policies */}
        {activeTab === 'policies' && (
          <div className="space-y-3 text-xs text-slate-600">
            <h4 className="text-base font-serif font-bold text-slate-900">
              Mikyaj Salon Policies & Guidelines
            </h4>
            
            <div className="space-y-2 bg-[#FFF5F8] p-3 rounded-xl border border-rose-100">
              <p className="font-bold text-slate-800">1. Arrival & Check-In</p>
              <p>Please arrive 10-15 minutes prior to your scheduled session to enjoy our welcome botanical herbal tea and consultation.</p>
            </div>

            <div className="space-y-2 bg-[#FFF5F8] p-3 rounded-xl border border-rose-100">
              <p className="font-bold text-slate-800">2. Free Rescheduling & Cancellation</p>
              <p>You can reschedule or cancel your appointment free of charge up to 2 hours prior to your scheduled time slot directly from the My Bookings portal.</p>
            </div>

            <div className="space-y-2 bg-[#FFF5F8] p-3 rounded-xl border border-rose-100">
              <p className="font-bold text-slate-800">3. 100% Medical-Grade Sterilization</p>
              <p>All metal nail implements and aesthetic tools undergo ultrasonic cleansing and surgical autoclave sterilization before every single client.</p>
            </div>
          </div>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
