import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowLeft, ArrowRight, Check, HeartPulse, PhoneCall, ShieldAlert } from 'lucide-react';
import { useUser, UserProfile } from '@/hooks/use-user';
import { ECGAnimation } from '@/components/ecg-animation';

const loginSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  parent1Name: z.string().min(2, "Parent/Guardian name required"),
  parent1Phone: z.string().min(10, "Parent/Guardian phone required"),
  parent2Name: z.string().optional(),
  parent2Phone: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const LANGUAGES = [
  { id: 'english', label: 'English', native: 'English' },
  { id: 'hindi', label: 'हिंदी', native: 'Hindi' },
  { id: 'telugu', label: 'తెలుగు', native: 'Telugu' }
] as const;

const inputClass = "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";

export default function Login() {
  const [, setLocation] = useLocation();
  const { saveUser } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLang, setSelectedLang] = useState<UserProfile['language']>('english');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });
  const onSubmit = (data: LoginForm) => {
    saveUser({ ...data, language: selectedLang });
    setLocation('/dashboard');
  };
  return (
    <main className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-44 h-[32rem] w-[32rem] rounded-full border border-accent/10 bg-accent/[.025] sm:-right-20 sm:-top-52" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 -left-40 h-[34rem] w-[34rem] rounded-full border border-accent/10 bg-accent/[.025]" />
      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_24px_70px_-36px_rgba(25,64,69,.25)] lg:min-h-[690px] lg:grid-cols-[.87fr_1.13fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#e9f3f1] p-10 lg:flex">
          <div className="absolute -right-24 top-28 h-80 w-80 rounded-full border border-accent/10" />
          <div className="absolute -right-8 top-44 h-48 w-48 rounded-full border border-accent/10" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/15 bg-white text-accent shadow-sm">
              <Activity size={24} strokeWidth={1.8} />
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.17em] text-accent">Emergency health support</p>
            <h1 className="mt-3 max-w-sm font-display text-[42px] font-semibold leading-[1.08] tracking-[-.04em] text-[#1b3540]">
              A steady hand when it matters.
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#5c7479]">
              Start with what you’re experiencing. We’ll help you understand urgency and what to do next.
            </p>
          </div>
          <div className="relative rounded-2xl border border-white/80 bg-white/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf0ee] text-[#a94743]"><PhoneCall size={19} /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Immediate danger?</p>
                <a href="tel:108" className="mt-1 inline-block text-lg font-bold text-[#9d3f3c] underline-offset-4 hover:underline">Call emergency services · 108</a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 left-0 right-0 opacity-35"><ECGAnimation severity="LOW" /></div>
        </aside>

        <div className="flex min-w-0 flex-col px-5 py-7 sm:px-10 sm:py-9 lg:px-14 lg:py-12">
          <header className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <HeartPulse size={22} strokeWidth={1.9} />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-[.04em] text-foreground">SARATHI <span className="text-accent">AI</span></p>
              <p className="text-xs text-muted-foreground">Your emergency assistant</p>
            </div>
          </header>
          <div className="mb-7 flex items-center gap-2" aria-label={`Step ${step} of 2`}>
            <span className="h-1.5 flex-1 rounded-full bg-accent" />
            <span className={`h-1.5 flex-1 rounded-full ${step === 2 ? 'bg-accent' : 'bg-secondary'}`} />
            <span className="ml-2 text-xs font-medium text-muted-foreground">Step {step} of 2</span>
          </div>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="language" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: .2 }} className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-accent">Let’s get started</p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-.03em] text-foreground sm:text-[34px]">Choose your language</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Select the language you’re most comfortable using.</p>
                <div className="mt-7 grid gap-3">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => { setSelectedLang(lang.id as UserProfile['language']); setStep(2); }}
                        className={`group flex min-h-[76px] items-center justify-between rounded-2xl border px-5 py-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-[0_8px_24px_-18px_rgba(18,101,99,.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${isSelected ? 'border-accent/40 bg-[#f4faf9]' : 'border-border bg-white'}`}
                        data-testid={`button-language-${lang.id}`}
                      >
                        <span>
                          <span className="block font-display text-xl font-semibold text-foreground">{lang.label}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{lang.native}</span>
                        </span>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isSelected ? 'bg-accent text-white' : 'bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'}`}>
                          {isSelected ? <Check size={17} /> : <ArrowRight size={17} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldAlert size={15} className="mt-0.5 shrink-0 text-accent" /> If someone is in immediate danger, call 108 now.</p>
              </motion.div>
            ) : (
              <motion.form key="profile" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: .2 }} onSubmit={handleSubmit(onSubmit)} className="flex-1">
                <button type="button" onClick={() => setStep(1)} className="mb-5 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-accent" data-testid="button-back-language">
                  <ArrowLeft size={16} /> Back to language selection
                </button>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-accent">A little about you</p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-.03em] text-foreground">Emergency profile</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Add your details and a trusted contact to get started.</p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="profile-name" className="text-sm font-semibold text-foreground">Your full name</label>
                    <input id="profile-name" {...register("name")} autoComplete="name" placeholder="e.g. Your name" className={inputClass} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'error-name' : undefined} data-testid="input-profile-name" />
                    {errors.name && <p id="error-name" role="alert" className="mt-1 text-xs font-medium text-destructive">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="text-sm font-semibold text-foreground">Your phone number</label>
                    <input id="profile-phone" {...register("phone")} autoComplete="tel" placeholder="Phone number" type="tel" className={inputClass} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'error-phone' : undefined} data-testid="input-profile-phone" />
                    {errors.phone && <p id="error-phone" role="alert" className="mt-1 text-xs font-medium text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground"><PhoneCall size={16} className="text-accent" /> Parent / guardian contact</h3>
                  </div>
                  <div>
                    <label htmlFor="guardian-name" className="text-sm font-semibold text-foreground">Contact name</label>
                    <input id="guardian-name" {...register("parent1Name")} autoComplete="name" placeholder="Parent or guardian name" className={inputClass} aria-invalid={!!errors.parent1Name} aria-describedby={errors.parent1Name ? 'error-guardian' : undefined} data-testid="input-guardian-name" />
                    {errors.parent1Name && <p id="error-guardian" role="alert" className="mt-1 text-xs font-medium text-destructive">{errors.parent1Name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="guardian-phone" className="text-sm font-semibold text-foreground">Contact phone number</label>
                    <input id="guardian-phone" {...register("parent1Phone")} autoComplete="tel" placeholder="Phone number" type="tel" className={inputClass} aria-invalid={!!errors.parent1Phone} aria-describedby={errors.parent1Phone ? 'error-guardian-phone' : undefined} data-testid="input-guardian-phone" />
                    {errors.parent1Phone && <p id="error-guardian-phone" role="alert" className="mt-1 text-xs font-medium text-destructive">{errors.parent1Phone.message}</p>}
                  </div>
                </div>
                <button type="submit" className="mt-7 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 font-bold text-white shadow-[0_7px_18px_-10px_rgba(18,101,99,.65)] transition hover:-translate-y-0.5 hover:bg-[#105c5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2" data-testid="button-enter-sarathi">
                  Continue to SARATHI <ArrowRight size={18} />
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">For immediate medical danger, call 108.</p>
              </motion.form>
            )}
          </AnimatePresence>
          <footer className="mt-8 border-t border-border pt-4 text-center text-[11px] leading-5 text-muted-foreground">
            SARATHI supports your next step; it does not replace emergency services.
          </footer>
        </div>
      </section>
    </main>
  );
}
