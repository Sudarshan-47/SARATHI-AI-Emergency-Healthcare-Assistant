import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, HeartPulse, ShieldAlert, PhoneCall } from 'lucide-react';
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
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Abstract medical background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
        
        {/* Logo Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-card border border-white/10 flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
            <img src={`${import.meta.env.BASE_URL}images/sarathi-logo.png`} alt="SARATHI AI" className="w-12 h-12 z-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-wider text-glow mb-2">SARATHI <span className="text-primary">AI</span></h1>
          <p className="text-muted-foreground text-center text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-primary" /> Emergency Assistant
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className="text-xl font-display text-white mb-6 text-center">Select Language / భాషను ఎంచుకోండి</h2>
              <div className="grid gap-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLang(lang.id as any);
                      setStep(2);
                    }}
                    className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{lang.label}</span>
                      <span className="text-sm text-muted-foreground">{lang.native}</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full glass-panel p-6 sm:p-8 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-display text-white">Emergency Profile</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    {...register("name")}
                    placeholder="Your Full Name"
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  {errors.name && <p className="text-primary text-xs mt-1 ml-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <input
                    {...register("phone")}
                    placeholder="Your Phone Number"
                    type="tel"
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  {errors.phone && <p className="text-primary text-xs mt-1 ml-1">{errors.phone.message}</p>}
                </div>

                <div className="h-px w-full bg-white/10 my-4" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" /> Emergency Contacts
                </h3>

                <div>
                  <input
                    {...register("parent1Name")}
                    placeholder="Guardian 1 Name"
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  {errors.parent1Name && <p className="text-primary text-xs mt-1 ml-1">{errors.parent1Name.message}</p>}
                </div>
                
                <div>
                  <input
                    {...register("parent1Phone")}
                    placeholder="Guardian 1 Phone"
                    type="tel"
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  {errors.parent1Phone && <p className="text-primary text-xs mt-1 ml-1">{errors.parent1Phone.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Enter SARATHI AI <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full mt-2 text-muted-foreground text-sm hover:text-white transition-colors"
                >
                  Back to Language Selection
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <ECGAnimation severity="LOW" />
      </div>
    </div>
  );
}
