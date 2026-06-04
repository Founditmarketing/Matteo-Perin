import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { reportInquiryConversion } from '@/lib/gtagConversion';

// ─── Types ───────────────────────────────────────────────────
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primaryResidence: string;
  secondaryResidence: string;
  firstEngagement: string;
  firstAcquisition: string;
  additionalCommissions: string;
  birthday: string;
  partnerBirthday: string;
  anniversary: string;
  milestones: string;
  interests: string[];
  privatePreviews: string;
  valueMost: string[];
}

const INITIAL: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  primaryResidence: '', secondaryResidence: '',
  firstEngagement: '', firstAcquisition: '', additionalCommissions: '',
  birthday: '', partnerBirthday: '', anniversary: '', milestones: '',
  interests: [], privatePreviews: '', valueMost: [],
};

// ─── Slide transition ────────────────────────────────────────
const slideVariants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.35 } },
};

// ─── Reusable sub-components ─────────────────────────────────
const TextInput: React.FC<{
  value: string; onChange: (v: string) => void; placeholder: string;
  type?: string; autoFocus?: boolean;
}> = ({ value, onChange, placeholder, type = 'text', autoFocus }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    autoFocus={autoFocus}
    className="w-full bg-transparent border-b border-[#c8c0b4] dark:border-white/20 py-4 font-serif text-2xl md:text-3xl text-[#2a2520] dark:text-white placeholder-[#c8c0b4] dark:placeholder-white/25 outline-none focus:border-[#c49a6c] transition-colors tracking-wide"
  />
);

const OptionButton: React.FC<{
  label: string; selected: boolean; onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-6 py-5 border transition-all duration-500 font-serif text-lg md:text-xl tracking-wide ${
      selected
        ? 'border-[#c49a6c] bg-[#c49a6c]/8 text-[#2a2520] dark:text-white dark:bg-[#c49a6c]/15'
        : 'border-[#e8e2da] dark:border-white/10 text-[#8a8078] dark:text-white/50 hover:border-[#c49a6c]/50 hover:text-[#2a2520] dark:hover:text-white'
    }`}
  >
    {label}
  </button>
);

const ContinueButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'Continue' }) => (
  <button
    onClick={onClick}
    className="group mt-12 inline-flex items-center gap-4 font-sans text-[11px] uppercase tracking-[0.3em] text-[#2a2520] dark:text-white hover:text-[#c49a6c] transition-colors duration-500"
  >
    <span>{label}</span>
    <span className="block w-8 h-[1px] bg-current group-hover:w-14 transition-all duration-500" />
  </button>
);

const StepLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#c49a6c] mb-6">{children}</p>
);

const StepQuestion: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#2a2520] dark:text-white leading-[1.2] tracking-tight mb-10 font-light">{children}</h2>
);

const StepHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-serif text-sm text-[#a09890] dark:text-white/40 italic mt-3 tracking-wide">{children}</p>
);

// ─── Total steps ─────────────────────────────────────────────
const TOTAL_STEPS = 12; // 0 = intro, 11 = thank you (removed preferred name, communication style)

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export const PrivateClientForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upd = (field: keyof FormData, value: any) => setData(prev => ({ ...prev, [field]: value }));
  const next = useCallback(() => setStep(s => Math.min(s + 1, TOTAL_STEPS)), []);
  const prev = useCallback(() => {
    // Cancel any pending auto-advance so the user doesn't get pushed forward
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    setStep(s => Math.max(s - 1, 0));
  }, []);
  const scheduleNext = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      autoAdvanceTimer.current = null;
      next();
    }, 400);
  }, [next]);
  const [submitting, setSubmitting] = useState(false);

  // Submit full profile to HubSpot + serverless endpoint
  const submitProfile = async () => {
    setSubmitting(true);
    try {
      // 1. Push to HubSpot via tracking code (standard contact properties)
      const _hsq = (window as any)._hsq = (window as any)._hsq || [];
      _hsq.push(["identify", {
        email: data.email,
        firstname: data.firstName,
        lastname: data.lastName,
        phone: data.phone,
        address: data.primaryResidence,
      }]);
      _hsq.push(["trackPageView"]);

      // Capture UTM params for attribution
      const urlParams = new URLSearchParams(window.location.search);
      const utmData: Record<string, string> = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
        const val = urlParams.get(key) || sessionStorage.getItem(key);
        if (val) utmData[key] = val;
      });

      // 2. Send full data to serverless endpoint for complete capture
      await fetch('/api/private-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fullName: `${data.firstName} ${data.lastName}`.trim(),
          interests: data.interests.join(', '),
          valueMost: data.valueMost.join(', '),
          submittedAt: new Date().toISOString(),
          formType: 'private-client',
          ...utmData,
          referrer: document.referrer || '',
          landingPage: sessionStorage.getItem('landing_page') || window.location.href,
        }),
      }).catch(() => {}); // Non-blocking — HubSpot tracking is the primary
    } catch (e) {
      // Silent — don't block the UX
    }
    // Fire Google Ads conversion
    reportInquiryConversion();
    setSubmitting(false);
    next();
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && step > 0 && step < TOTAL_STEPS) next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step]);

  // Toggle interest
  const toggleInterest = (val: string) => {
    if (val === 'All of the above') {
      upd('interests', data.interests.includes('All of the above') ? [] : ['All of the above']);
      return;
    }
    const filtered = data.interests.filter(i => i !== 'All of the above');
    upd('interests', filtered.includes(val) ? filtered.filter(i => i !== val) : [...filtered, val]);
  };

  const progress = step === 0 ? 0 : Math.min(((step) / (TOTAL_STEPS - 1)) * 100, 100);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF8F5] dark:bg-[#0e0d0c] transition-colors duration-700 relative overflow-hidden">
      <Helmet>
        <title>Private Client Experience | Matteo Perin</title>
        <meta name="description" content="Begin your private client profile with Matteo Perin. A discreet, personalized experience curated exclusively for you." />
      </Helmet>

      {/* ── Soft Progress Bar ── */}
      {step > 0 && step < TOTAL_STEPS && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-[#e8e2da] dark:bg-white/5">
          <motion.div
            className="h-full bg-[#c49a6c]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}

      {/* ── Back button ── */}
      {step > 0 && step < TOTAL_STEPS && (
        <button
          onClick={prev}
          className="fixed top-8 left-8 z-50 font-sans text-[10px] uppercase tracking-[0.3em] text-[#a09890] dark:text-white/40 hover:text-[#2a2520] dark:hover:text-white transition-colors"
        >
          ← Back
        </button>
      )}

      {/* ── Step counter ── */}
      {step > 0 && step < TOTAL_STEPS && (
        <div className="fixed top-8 right-8 z-50 font-sans text-[10px] uppercase tracking-[0.3em] text-[#c8c0b4] dark:text-white/20">
          {step} of {TOTAL_STEPS - 2}
        </div>
      )}

      {/* ── SLIDES ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="min-h-screen flex items-center justify-center px-6 md:px-12"
        >
          <div className="w-full max-w-2xl mx-auto py-24">

            {/* ════════════ STEP 0: INTRO ════════════ */}
            {step === 0 && (
              <div className="text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
                  <div className="w-[1px] h-16 bg-[#c49a6c] mx-auto mb-12" />
                  <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#c49a6c] mb-8">Matteo Perin</p>
                  <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#2a2520] dark:text-white tracking-tight leading-[1.05] mb-8 font-light">
                    Private Client<br />Experience
                  </h1>
                  <p className="font-serif text-lg md:text-xl text-[#8a8078] dark:text-white/50 leading-relaxed max-w-lg mx-auto mb-6">
                    To better curate future pieces, experiences, and private offerings tailored to you.
                  </p>
                  <p className="font-serif text-sm text-[#a09890] dark:text-white/30 italic max-w-md mx-auto mb-16 leading-relaxed">
                    Matteo Perin maintains a discreet client registry to ensure each client receives only relevant, personal, and timely communication. Your information is never shared.
                  </p>
                  <button
                    onClick={next}
                    className="group inline-flex items-center gap-4 px-10 py-5 border border-[#2a2520] dark:border-white text-[#2a2520] dark:text-white font-sans text-[11px] uppercase tracking-[0.3em] hover:bg-[#2a2520] hover:text-white dark:hover:bg-white dark:hover:text-[#0e0d0c] transition-all duration-500"
                  >
                    <span>Begin Private Profile</span>
                  </button>
                </motion.div>
              </div>
            )}

            {/* ════════════ STEP 1: NAME ════════════ */}
            {step === 1 && (
              <div>
                <StepLabel>Your Name</StepLabel>
                <StepQuestion>How should we address you?</StepQuestion>
                <div className="space-y-8">
                  <TextInput value={data.firstName} onChange={v => upd('firstName', v)} placeholder="First name" autoFocus />
                  <TextInput value={data.lastName} onChange={v => upd('lastName', v)} placeholder="Last name" />
                </div>
                <ContinueButton onClick={next} />
              </div>
            )}

            {/* ════════════ STEP 2: CONTACT ════════════ */}
            {step === 2 && (
              <div>
                <StepLabel>Contact</StepLabel>
                <StepQuestion>Where can we reach you?</StepQuestion>
                <div className="space-y-8">
                  <TextInput value={data.email} onChange={v => upd('email', v)} placeholder="Email address" type="email" autoFocus />
                  <TextInput value={data.phone} onChange={v => upd('phone', v)} placeholder="Phone number" type="tel" />
                </div>
                <ContinueButton onClick={() => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!data.email || !emailRegex.test(data.email.trim())) {
                    alert('Please enter a valid email address.');
                    return;
                  }
                  next();
                }} />
              </div>
            )}

            {/* ════════════ STEP 3: RESIDENCE ════════════ */}
            {step === 3 && (
              <div>
                <StepLabel>Residence</StepLabel>
                <StepQuestion>Share your primary address</StepQuestion>
                <StepHint>For delivery coordination and private invitations</StepHint>
                <div className="space-y-8 mt-8">
                  <TextInput value={data.primaryResidence} onChange={v => upd('primaryResidence', v)} placeholder="Primary residence" autoFocus />
                  <TextInput value={data.secondaryResidence} onChange={v => upd('secondaryResidence', v)} placeholder="Secondary residence (optional)" />
                </div>
                <ContinueButton onClick={next} />
              </div>
            )}

            {/* ════════════ STEP 4: FIRST ENGAGEMENT ════════════ */}
            {step === 4 && (
              <div>
                <StepLabel>History</StepLabel>
                <StepQuestion>When did you first engage with Matteo Perin?</StepQuestion>
                <div className="space-y-8 mt-4">
                  <TextInput value={data.firstEngagement} onChange={v => upd('firstEngagement', v)} placeholder="Approximate month & year" autoFocus />
                </div>
                <ContinueButton onClick={next} />
              </div>
            )}

            {/* ════════════ STEP 5: FIRST ACQUISITION ════════════ */}
            {step === 5 && (
              <div>
                <StepLabel>History</StepLabel>
                <StepQuestion>What was your first acquisition?</StepQuestion>
                <div className="mt-4">
                  <select
                    value={data.firstAcquisition}
                    onChange={e => upd('firstAcquisition', e.target.value)}
                    className="w-full bg-transparent border-b border-[#c8c0b4] dark:border-white/20 py-4 font-serif text-2xl md:text-3xl text-[#2a2520] dark:text-white outline-none focus:border-[#c49a6c] transition-colors tracking-wide appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Select a category</option>
                    <option value="Outerwear" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Outerwear</option>
                    <option value="Tailoring" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Tailoring</option>
                    <option value="Leather Goods" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Leather Goods</option>
                    <option value="Footwear" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Footwear</option>
                    <option value="Accessories" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Accessories</option>
                    <option value="Exotic Skins" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Exotic Skins</option>
                    <option value="Knitwear" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Knitwear</option>
                    <option value="Interiors / Casa" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Interiors / Casa</option>
                    <option value="Other" className="bg-[#FAF8F5] dark:bg-[#0e0d0c]">Other</option>
                  </select>
                </div>
                <ContinueButton onClick={next} />
              </div>
            )}

            {/* ════════════ STEP 6: ADDITIONAL COMMISSIONS ════════════ */}
            {step === 6 && (
              <div>
                <StepLabel>History</StepLabel>
                <StepQuestion>Have you made additional commissions since?</StepQuestion>
                <div className="space-y-3 mt-8">
                  {['Yes', 'No'].map(opt => (
                    <OptionButton key={opt} label={opt} selected={data.additionalCommissions === opt} onClick={() => { upd('additionalCommissions', opt); scheduleNext(); }} />
                  ))}
                </div>
              </div>
            )}

            {/* ════════════ STEP 7: PERSONAL DATES ════════════ */}
            {step === 7 && (
              <div>
                <StepLabel>Personal</StepLabel>
                <StepQuestion>Dates we should remember</StepQuestion>
                <StepHint>For bespoke gifts and private acknowledgments</StepHint>
                <div className="space-y-8 mt-8">
                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-[#a09890] dark:text-white/30 mb-2">Your Birthday</label>
                    <input type="date" value={data.birthday} onChange={e => upd('birthday', e.target.value)}
                      className="w-full bg-transparent border-b border-[#c8c0b4] dark:border-white/20 py-3 font-serif text-xl text-[#2a2520] dark:text-white outline-none focus:border-[#c49a6c] transition-colors" />
                  </div>
                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-[#a09890] dark:text-white/30 mb-2">Partner / Spouse Birthday (optional)</label>
                    <input type="date" value={data.partnerBirthday} onChange={e => upd('partnerBirthday', e.target.value)}
                      className="w-full bg-transparent border-b border-[#c8c0b4] dark:border-white/20 py-3 font-serif text-xl text-[#2a2520] dark:text-white outline-none focus:border-[#c49a6c] transition-colors" />
                  </div>
                  <div>
                    <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-[#a09890] dark:text-white/30 mb-2">Anniversary (if applicable)</label>
                    <input type="date" value={data.anniversary} onChange={e => upd('anniversary', e.target.value)}
                      className="w-full bg-transparent border-b border-[#c8c0b4] dark:border-white/20 py-3 font-serif text-xl text-[#2a2520] dark:text-white outline-none focus:border-[#c49a6c] transition-colors" />
                  </div>
                </div>
                <ContinueButton onClick={next} />
              </div>
            )}

            {/* ════════════ STEP 8: MILESTONES ════════════ */}
            {step === 8 && (
              <div>
                <StepLabel>Personal</StepLabel>
                <StepQuestion>Important milestones you would like us to remember</StepQuestion>
                <textarea
                  value={data.milestones}
                  onChange={e => upd('milestones', e.target.value)}
                  placeholder="Share anything meaningful to you..."
                  rows={4}
                  className="w-full bg-transparent border-b border-[#c8c0b4] dark:border-white/20 py-4 font-serif text-xl text-[#2a2520] dark:text-white placeholder-[#c8c0b4] dark:placeholder-white/25 outline-none focus:border-[#c49a6c] transition-colors resize-none tracking-wide"
                  autoFocus
                />
                <ContinueButton onClick={next} />
              </div>
            )}

            {/* ════════════ STEP 9: INTERESTS ════════════ */}
            {step === 9 && (
              <div>
                <StepLabel>Preferences</StepLabel>
                <StepQuestion>Which areas interest you?</StepQuestion>
                <div className="space-y-3 mt-8">
                  {['Clothing', 'Shoes', 'Leather Accessories', 'Jewelry', 'Interiors', 'All of the above'].map(opt => (
                    <OptionButton key={opt} label={opt} selected={data.interests.includes(opt)} onClick={() => toggleInterest(opt)} />
                  ))}
                </div>
                <ContinueButton onClick={next} />
              </div>
            )}

            {/* ════════════ STEP 10: PRIVATE PREVIEWS ════════════ */}
            {step === 10 && (
              <div>
                <StepLabel>Invitations</StepLabel>
                <StepQuestion>Would you like to receive private previews, invitations, and bespoke offers?</StepQuestion>
                <div className="space-y-3 mt-8">
                  {['Yes', 'No'].map(opt => (
                    <OptionButton key={opt} label={opt} selected={data.privatePreviews === opt} onClick={() => { upd('privatePreviews', opt); scheduleNext(); }} />
                  ))}
                </div>
              </div>
            )}

            {/* ════════════ STEP 11: VALUE TILES (MULTI-SELECT) ════════════ */}
            {step === 11 && (
              <div>
                <StepLabel>Experience</StepLabel>
                <StepQuestion>What do you value most in a private Matteo Perin experience?</StepQuestion>
                <StepHint>Select all that apply</StepHint>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: '👤', label: 'One-on-one time with Matteo Perin' },
                    { icon: '✂️', label: 'Craftsmanship and the pieces themselves' },
                    { icon: '🏛️', label: 'Setting and atmosphere' },
                    { icon: '🍷', label: 'Food and wine experience' },
                    { icon: '🔒', label: 'Privacy and exclusivity' },
                  ].map(tile => {
                    const isSelected = data.valueMost.includes(tile.label);
                    return (
                      <button
                        key={tile.label}
                        onClick={() => {
                          upd('valueMost', isSelected
                            ? data.valueMost.filter((v: string) => v !== tile.label)
                            : [...data.valueMost, tile.label]
                          );
                        }}
                        className={`group relative p-8 border text-left transition-all duration-500 ${
                          isSelected
                            ? 'border-[#c49a6c] bg-[#c49a6c]/8 dark:bg-[#c49a6c]/15'
                            : 'border-[#e8e2da] dark:border-white/10 hover:border-[#c49a6c]/50'
                        }`}
                      >
                        <span className="text-3xl block mb-4">{tile.icon}</span>
                        <span className={`font-serif text-base md:text-lg tracking-wide leading-snug transition-colors duration-500 ${
                          isSelected ? 'text-[#2a2520] dark:text-white' : 'text-[#8a8078] dark:text-white/50 group-hover:text-[#2a2520] dark:group-hover:text-white'
                        }`}>
                          {tile.label}
                        </span>
                        {isSelected && (
                          <div
                            className="absolute top-4 right-4 w-5 h-5 bg-[#c49a6c] rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-12 text-center">
                  <button
                    onClick={submitProfile}
                    disabled={submitting}
                    className="group inline-flex items-center gap-4 px-10 py-5 bg-[#2a2520] dark:bg-white text-white dark:text-[#0e0d0c] font-sans text-[11px] uppercase tracking-[0.3em] hover:bg-[#c49a6c] dark:hover:bg-[#c49a6c] hover:text-white dark:hover:text-white transition-all duration-500 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Updating...' : 'Update Profile'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ════════════ THANK YOU ════════════ */}
            {step === TOTAL_STEPS && (
              <div className="text-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                  <div className="w-[1px] h-16 bg-[#c49a6c] mx-auto mb-12" />
                  <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-[#c49a6c] mb-8">Profile Received</p>
                  <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#2a2520] dark:text-white tracking-tight leading-[1.1] mb-8 font-light">
                    Thank you{data.firstName ? `, ${data.firstName}` : ''}
                  </h2>
                  <p className="font-serif text-lg text-[#8a8078] dark:text-white/50 leading-relaxed max-w-md mx-auto mb-4">
                    Your private profile has been received. A member of our team will be in touch with curated recommendations and exclusive invitations.
                  </p>
                  <p className="font-serif text-sm text-[#a09890] dark:text-white/30 italic max-w-sm mx-auto mb-16">
                    All information is held in the strictest confidence.
                  </p>
                  <a
                    href="/shop"
                    className="group inline-flex items-center gap-4 px-12 py-5 bg-[#c49a6c] text-white font-sans text-[12px] uppercase tracking-[0.3em] hover:bg-[#2a2520] dark:hover:bg-white dark:hover:text-[#0e0d0c] transition-all duration-500 shadow-lg hover:shadow-xl"
                  >
                    <span>View Available Creations</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </a>
                </motion.div>
              </div>
            )}

          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
