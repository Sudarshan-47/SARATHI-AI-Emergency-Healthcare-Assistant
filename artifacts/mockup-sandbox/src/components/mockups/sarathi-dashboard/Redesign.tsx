import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  HeartPulse,
  MapPin,
  MessageCircle,
  Mic,
  PhoneCall,
  Send,
  ShieldCheck,
  Siren,
  Stethoscope,
} from "lucide-react";

const quickPrompts = [
  { label: "Chest pain", icon: HeartPulse },
  { label: "Breathing trouble", icon: Activity },
  { label: "High fever", icon: Stethoscope },
];

export function Redesign() {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [previewNotice, setPreviewNotice] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setPreviewNotice(true);
    setListening(false);
  };

  return (
    <main className="sarathi-shell">
      <style>{`
        .sarathi-shell {
          --s-ink: #18313b;
          --s-ink-soft: #526870;
          --s-muted: #788b91;
          --s-line: #e2eaeb;
          --s-surface: #ffffff;
          --s-canvas: #f4f7f7;
          --s-teal: #167d7b;
          --s-teal-dark: #126563;
          --s-teal-wash: #e9f4f2;
          --s-green: #36836d;
          --s-amber: #a7752d;
          --s-red: #bc4545;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          color: var(--s-ink);
          background: var(--s-canvas);
          font-family: "DM Sans", "Avenir Next", ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .sarathi-shell * { box-sizing: border-box; }
        .sarathi-frame {
          width: min(100%, 1440px);
          min-height: 100dvh;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
        .sarathi-header {
          min-height: 76px;
          padding: 0 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--s-line);
          background: rgba(255,255,255,.78);
        }
        .s-brand { display: flex; align-items: center; gap: 12px; }
        .s-brand-mark {
          width: 40px; height: 40px; display: grid; place-items: center;
          color: var(--s-teal); background: var(--s-teal-wash);
          border: 1px solid #d5e9e5; border-radius: 12px;
        }
        .s-brand-name {
          font-size: 15px; line-height: 1.15; font-weight: 750;
          letter-spacing: .075em; color: #203b45;
        }
        .s-brand-name span { color: var(--s-teal); }
        .s-brand-sub { margin-top: 4px; color: var(--s-muted); font-size: 11px; letter-spacing: .015em; }
        .s-header-right { display: flex; align-items: center; gap: 18px; }
        .s-online {
          display: flex; gap: 8px; align-items: center;
          color: var(--s-ink-soft); font-size: 12px; font-weight: 550;
        }
        .s-online-dot { width: 7px; height: 7px; background: #5c9b7e; border-radius: 50%; }
        .s-emergency {
          min-height: 42px; padding: 0 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          border: 1px solid #e9c7c4; border-radius: 10px;
          background: #fff9f8; color: #a73c3b; text-decoration: none;
          font-size: 13px; font-weight: 700; letter-spacing: .01em;
          transition: background .18s ease, border-color .18s ease, transform .18s ease;
        }
        .s-emergency:hover { background: #fff0ee; border-color: #dba6a0; transform: translateY(-1px); }
        .s-emergency:focus-visible, .sarathi-shell button:focus-visible, .s-input:focus-visible {
          outline: 3px solid rgba(22,125,123,.28); outline-offset: 2px;
        }
        .s-main {
          width: min(1180px, 100%);
          flex: 1;
          margin: 0 auto;
          padding: 30px 32px 24px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 30px;
          align-items: stretch;
          min-height: 0;
        }
        .s-chat-column {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 2px 0 0;
        }
        .s-chat-topline {
          display: flex; align-items: center; justify-content: space-between;
          min-height: 27px; margin-bottom: 9px;
        }
        .s-private-label {
          display: inline-flex; align-items: center; gap: 7px;
          color: var(--s-teal-dark); font-size: 11px; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
        }
        .s-session-label { color: #8a999d; font-size: 11px; }
        .s-welcome {
          flex: 1; min-height: 410px;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 28px 22px 35px; text-align: center;
        }
        .s-emblem {
          width: 62px; height: 62px; display: grid; place-items: center;
          border-radius: 19px; color: var(--s-teal);
          background: #e7f2f0; border: 1px solid #d3e7e3;
          margin-bottom: 22px;
        }
        .s-eyebrow {
          margin: 0 0 10px; color: var(--s-teal-dark); font-size: 11px;
          font-weight: 700; letter-spacing: .105em; text-transform: uppercase;
        }
        .s-welcome h1 {
          max-width: 560px; margin: 0; color: #1b3540;
          font-family: "Outfit", "DM Sans", ui-sans-serif, system-ui, sans-serif;
          font-size: clamp(30px, 3vw, 40px); line-height: 1.12;
          letter-spacing: -.035em; font-weight: 620;
        }
        .s-intro {
          max-width: 475px; margin: 14px 0 0;
          color: #657a81; font-size: 14px; line-height: 1.7;
        }
        .s-prompts {
          margin-top: 25px; display: flex; flex-wrap: wrap;
          justify-content: center; gap: 9px;
        }
        .s-prompt {
          min-height: 39px; padding: 0 13px;
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid #dce6e7; border-radius: 9px;
          background: var(--s-surface); color: #425d65;
          font-family: inherit; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease;
        }
        .s-prompt svg { color: var(--s-teal); }
        .s-prompt:hover { border-color: #9ec8c1; color: var(--s-teal-dark); background: #f7fbfa; transform: translateY(-1px); }
        .s-urgent-note {
          display: flex; align-items: center; gap: 8px; margin-top: 23px;
          color: #816c54; font-size: 11px; line-height: 1.4;
        }
        .s-urgent-note svg { color: var(--s-amber); flex: 0 0 auto; }
        .s-composer-wrap {
          width: min(100%, 720px); align-self: center;
          padding: 0 0 3px;
        }
        .s-composer {
          min-height: 62px; display: flex; align-items: center; gap: 10px;
          padding: 7px 8px 7px 10px;
          background: var(--s-surface); border: 1px solid #d9e4e5;
          border-radius: 13px; box-shadow: 0 5px 18px rgba(30,67,72,.045);
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        .s-composer:focus-within { border-color: #81b8b1; box-shadow: 0 0 0 3px rgba(22,125,123,.08); }
        .s-mic {
          width: 42px; height: 42px; flex: 0 0 auto; display: grid; place-items: center;
          border: 1px solid #deebea; border-radius: 10px; background: #f2f8f7;
          color: var(--s-teal); cursor: pointer;
          transition: background .18s ease, color .18s ease;
        }
        .s-mic:hover, .s-mic[data-listening="true"] { background: var(--s-teal); color: white; }
        .s-input {
          width: 100%; min-width: 0; height: 44px; border: 0; outline: 0;
          background: transparent; color: var(--s-ink); padding: 0 4px;
          font: inherit; font-size: 13px;
        }
        .s-input::placeholder { color: #94a2a6; opacity: 1; }
        .s-send {
          width: 42px; height: 42px; flex: 0 0 auto; display: grid; place-items: center;
          border: 0; border-radius: 10px; color: white; background: var(--s-teal);
          cursor: pointer; transition: background .18s ease, transform .18s ease;
        }
        .s-send:hover { background: var(--s-teal-dark); transform: translateY(-1px); }
        .s-composer-help {
          display: flex; justify-content: space-between; gap: 10px;
          padding: 9px 3px 0; color: #8a9a9f; font-size: 10px;
        }
        .s-composer-help span:first-child { display: flex; align-items: center; gap: 5px; }
        .s-preview-notice {
          margin: 0 0 11px; padding: 10px 12px;
          border: 1px solid #e8d8b7; border-radius: 9px;
          background: #fffaf0; color: #79643f; font-size: 11px; line-height: 1.45;
        }
        .s-side {
          display: flex; flex-direction: column; gap: 13px;
          padding-top: 28px;
        }
        .s-side-card {
          padding: 18px 17px;
          border: 1px solid var(--s-line); border-radius: 12px;
          background: var(--s-surface);
        }
        .s-side-heading {
          display: flex; align-items: center; gap: 9px;
          margin: 0 0 13px; color: #26434b; font-size: 13px; font-weight: 700;
        }
        .s-heading-icon {
          width: 29px; height: 29px; display: grid; place-items: center;
          border-radius: 8px; background: var(--s-teal-wash); color: var(--s-teal);
        }
        .s-awaiting {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 9px; border: 1px solid #e8e1d1; border-radius: 20px;
          background: #fbf8f1; color: #8a7048; font-size: 10px; font-weight: 650;
        }
        .s-awaiting-dot { width: 6px; height: 6px; border-radius: 50%; background: #c69b54; }
        .s-result-desc {
          margin: 11px 0 0; color: #75878c; font-size: 11px; line-height: 1.55;
        }
        .s-rule { height: 1px; margin: 14px 0; background: #edf1f1; }
        .s-steps-title {
          margin: 0 0 10px; color: #718388; font-size: 10px;
          font-weight: 700; text-transform: uppercase; letter-spacing: .075em;
        }
        .s-placeholder-step {
          min-height: 39px; display: flex; align-items: center; gap: 9px;
          color: #87979b; font-size: 11px;
        }
        .s-step-number {
          width: 22px; height: 22px; display: grid; place-items: center;
          border-radius: 7px; border: 1px solid #e4ebeb; color: #9aa8aa;
          font-size: 10px; font-weight: 700;
        }
        .s-after-label {
          display: flex; align-items: center; gap: 6px;
          margin: 1px 1px 0; color: #91a0a3; font-size: 10px;
        }
        .s-action {
          width: 100%; min-height: 51px; padding: 9px 11px;
          display: flex; align-items: center; gap: 10px; text-align: left;
          border: 1px solid #e4ebeb; border-radius: 10px; background: #f9fbfb;
          color: #91a0a3; font: inherit; cursor: not-allowed; opacity: .84;
        }
        .s-action-icon { width: 29px; height: 29px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 8px; background: #eef3f2; color: #829592; }
        .s-action-copy { flex: 1; min-width: 0; display: block; }
        .s-action-title { display: block; color: #62777c; font-size: 11px; font-weight: 650; }
        .s-action-sub { display: block; margin-top: 2px; color: #9aa7aa; font-size: 9px; }
        .s-safety-card {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 13px 14px; border: 1px solid #f0dfdc; border-radius: 11px;
          background: #fffafa; color: #8c6560;
        }
        .s-safety-card svg { margin-top: 1px; flex: 0 0 auto; color: var(--s-red); }
        .s-safety-title { margin: 0 0 3px; color: #88524d; font-size: 11px; font-weight: 700; }
        .s-safety-copy { margin: 0; color: #92716c; font-size: 10px; line-height: 1.5; }
        .s-footer {
          min-height: 37px; padding: 0 42px;
          display: flex; align-items: center; justify-content: center;
          color: #91a0a3; font-size: 10px;
        }
        @media (max-width: 760px) {
          .sarathi-frame { min-height: 100dvh; }
          .sarathi-header { min-height: 64px; padding: 0 16px; }
          .s-brand { gap: 9px; }
          .s-brand-mark { width: 35px; height: 35px; border-radius: 10px; }
          .s-brand-name { font-size: 13px; }
          .s-brand-sub { font-size: 9px; margin-top: 3px; }
          .s-header-right { gap: 9px; }
          .s-online { display: none; }
          .s-emergency { min-height: 38px; padding: 0 11px; gap: 7px; font-size: 12px; border-radius: 9px; }
          .s-emergency svg { width: 15px; height: 15px; }
          .s-main {
            display: flex; flex-direction: column; gap: 17px;
            padding: 16px 15px 0; flex: 1;
          }
          .s-chat-column { flex: 0 0 auto; }
          .s-chat-topline { min-height: 20px; margin-bottom: 0; }
          .s-private-label { font-size: 9px; letter-spacing: .065em; }
          .s-session-label { font-size: 9px; }
          .s-welcome { min-height: 0; padding: 22px 4px 20px; }
          .s-emblem { width: 52px; height: 52px; border-radius: 16px; margin-bottom: 16px; }
          .s-emblem svg { width: 26px; height: 26px; }
          .s-eyebrow { margin-bottom: 8px; font-size: 9px; }
          .s-welcome h1 { font-size: 29px; max-width: 340px; }
          .s-intro { max-width: 340px; margin-top: 10px; font-size: 12px; line-height: 1.55; }
          .s-prompts { margin-top: 17px; gap: 7px; }
          .s-prompt { min-height: 35px; padding: 0 10px; gap: 6px; font-size: 10px; }
          .s-prompt svg { width: 14px; height: 14px; }
          .s-urgent-note { margin-top: 15px; font-size: 10px; }
          .s-composer-wrap { width: 100%; }
          .s-composer { min-height: 56px; gap: 7px; padding: 6px; border-radius: 12px; }
          .s-mic, .s-send { width: 39px; height: 40px; border-radius: 9px; }
          .s-input { font-size: 12px; height: 40px; }
          .s-composer-help { padding-top: 7px; font-size: 9px; }
          .s-preview-notice { margin-bottom: 8px; font-size: 10px; }
          .s-side { padding-top: 0; gap: 9px; }
          .s-side-card { padding: 13px 13px; border-radius: 11px; }
          .s-side-heading { margin-bottom: 9px; font-size: 12px; }
          .s-heading-icon { width: 26px; height: 26px; }
          .s-result-desc { margin-top: 8px; font-size: 10px; }
          .s-rule { margin: 10px 0; }
          .s-steps-title { margin-bottom: 5px; font-size: 9px; }
          .s-placeholder-step { min-height: 29px; font-size: 10px; }
          .s-step-number { width: 19px; height: 19px; border-radius: 6px; }
          .s-side-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
          .s-action { min-height: 57px; padding: 7px; gap: 7px; }
          .s-action-icon { width: 25px; height: 25px; }
          .s-action-icon svg { width: 14px; height: 14px; }
          .s-action-title { font-size: 10px; }
          .s-action-sub { font-size: 8px; line-height: 1.3; }
          .s-after-label { grid-column: 1 / -1; font-size: 9px; }
          .s-safety-card { padding: 10px 11px; }
          .s-safety-title { font-size: 10px; }
          .s-safety-copy { font-size: 9px; }
          .s-footer { min-height: 27px; padding: 0 12px; font-size: 9px; }
        }
        @media (max-width: 380px) {
          .s-welcome h1 { font-size: 26px; }
          .s-prompt { padding: 0 8px; font-size: 9px; }
          .s-session-label { display: none; }
          .s-action { gap: 5px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sarathi-shell *, .sarathi-shell *::before, .sarathi-shell *::after {
            scroll-behavior: auto !important; animation-duration: .01ms !important;
            animation-iteration-count: 1 !important; transition-duration: .01ms !important;
          }
        }
      `}</style>
      <div className="sarathi-frame">
        <header className="sarathi-header">
          <div className="s-brand" aria-label="SARATHI AI">
            <div className="s-brand-mark"><Activity size={20} strokeWidth={2.2} /></div>
            <div>
              <div className="s-brand-name">SARATHI <span>AI</span></div>
              <div className="s-brand-sub">Emergency health support</div>
            </div>
          </div>
          <div className="s-header-right">
            <div className="s-online"><span className="s-online-dot" /> Ready to help</div>
            <a className="s-emergency" href="tel:108" aria-label="Call emergency services at 108">
              <PhoneCall size={16} strokeWidth={2.2} /> <span>Emergency&nbsp; 108</span>
            </a>
          </div>
        </header>

        <div className="s-main">
          <section className="s-chat-column" aria-label="Symptom chat">
            <div className="s-chat-topline">
              <div className="s-private-label"><ShieldCheck size={14} /> Private triage support</div>
              <div className="s-session-label">Start a conversation</div>
            </div>

            <div className="s-welcome">
              <div className="s-emblem"><HeartPulse size={31} strokeWidth={1.8} /></div>
              <p className="s-eyebrow">A calm first step</p>
              <h1>Tell us what’s happening.</h1>
              <p className="s-intro">
                Describe how you’re feeling in your own words. SARATHI can help you understand urgency and the next safest step.
              </p>
              <div className="s-prompts" aria-label="Suggested symptom prompts">
                {quickPrompts.map(({ label, icon: Icon }) => (
                  <button
                    className="s-prompt"
                    key={label}
                    type="button"
                    onClick={() => { setInput(label); setPreviewNotice(false); }}
                  >
                    <Icon size={15} strokeWidth={1.9} /> {label}
                  </button>
                ))}
              </div>
              <div className="s-urgent-note">
                <Siren size={14} />
                If someone is in immediate danger, call 108 first.
              </div>
            </div>

            <div className="s-composer-wrap">
              {previewNotice && (
                <div className="s-preview-notice" role="status">
                  This design preview does not run a medical assessment. Your text stays in this preview; call 108 if this is an emergency.
                </div>
              )}
              <div className="s-composer">
                <button
                  className="s-mic"
                  type="button"
                  data-listening={listening}
                  aria-label={listening ? "Stop voice input preview" : "Start voice input"}
                  aria-pressed={listening}
                  onClick={() => setListening((value) => !value)}
                >
                  <Mic size={19} strokeWidth={2} />
                </button>
                <input
                  className="s-input"
                  value={input}
                  onChange={(event) => { setInput(event.target.value); setPreviewNotice(false); }}
                  onKeyDown={(event) => { if (event.key === "Enter") handleSend(); }}
                  aria-label="Describe your symptoms"
                  placeholder={listening ? "Voice input preview is active…" : "Describe your symptoms"}
                />
                <button className="s-send" type="button" aria-label="Send symptoms" onClick={handleSend}>
                  <Send size={17} />
                </button>
              </div>
              <div className="s-composer-help">
                <span><CircleHelp size={12} /> Share only what feels relevant</span>
                <span>{listening ? "Voice input preview" : "Voice input available"}</span>
              </div>
            </div>
          </section>

          <aside className="s-side" aria-label="Assessment and care options">
            <section className="s-side-card">
              <h2 className="s-side-heading">
                <span className="s-heading-icon"><Activity size={16} /></span>
                Triage assessment
              </h2>
              <span className="s-awaiting"><span className="s-awaiting-dot" /> Awaiting assessment</span>
              <p className="s-result-desc">Urgency and next-step guidance will appear here after you describe your symptoms.</p>
              <div className="s-rule" />
              <h3 className="s-steps-title">First-aid guidance</h3>
              <div className="s-placeholder-step"><span className="s-step-number">1</span> Steps appear after an assessment</div>
            </section>

            <div className="s-after-label"><ChevronRight size={13} /> Available after an assessment</div>
            <div className="s-side-actions">
              <button className="s-action" type="button" disabled aria-disabled="true">
                <span className="s-action-icon"><MessageCircle size={16} /></span>
                <span className="s-action-copy">
                  <span className="s-action-title">Alert parent / guardian</span>
                  <span className="s-action-sub">WhatsApp message</span>
                </span>
                <ArrowUpRight size={14} />
              </button>
              <button className="s-action" type="button" disabled aria-disabled="true">
                <span className="s-action-icon"><MapPin size={16} /></span>
                <span className="s-action-copy">
                  <span className="s-action-title">Nearby hospitals</span>
                  <span className="s-action-sub">Lookup after assessment</span>
                </span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <section className="s-safety-card">
              <Siren size={16} />
              <div>
                <h2 className="s-safety-title">Need urgent help?</h2>
                <p className="s-safety-copy">Emergency services are available at 108. Keep the call option close at hand.</p>
              </div>
            </section>
          </aside>
        </div>
        <footer className="s-footer">
          SARATHI supports your next step; it does not replace emergency services.
        </footer>
      </div>
    </main>
  );
}
