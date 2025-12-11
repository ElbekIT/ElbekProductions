
import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { translations } from '../utils/translations';
import { sendVerificationCodeToTelegram } from '../services/telegramService';
import { updateUserTelegramId, registerTelegramUser } from '../services/firebase';
import { LoaderIcon, AlertCircleIcon, CheckCircleIcon } from './Icons';

interface TelegramVerifierProps {
  user: User | null; // Null if new Telegram user, object if adding ID to Google user
  language: Language;
  onVerified: (telegramId: string, newUser?: User) => void;
  onBack: () => void;
}

const TelegramVerifier: React.FC<TelegramVerifierProps> = ({ user, language, onVerified, onBack }) => {
  const t = translations[language];
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [telegramId, setTelegramId] = useState('');
  const [otp, setOtp] = useState('');
  const [nickname, setNickname] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a random 6-digit code on mount (or when needed)
  useEffect(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
  }, []);

  const handleSendCode = async () => {
    if (!telegramId || telegramId.length < 5) {
      setError("Valid Telegram ID required");
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
        // AI Simulation
        await new Promise(r => setTimeout(r, 1500));
        
        const result = await sendVerificationCodeToTelegram(telegramId, generatedCode);
        
        if (result.success) {
            setStep(2);
        } else {
            if (result.error === 'bot_not_started') {
                setError(t.tgVerifyErrorBot);
            } else {
                setError("Error: " + result.error);
            }
        }
    } catch (err) {
        setError("Network Error");
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otp !== generatedCode) {
        setError(t.tgVerifyErrorCode);
        return;
    }
    
    setLoading(true);

    // If User exists (Google Auth), verify and finish
    if (user) {
        const success = await updateUserTelegramId(user.uid, telegramId);
        if (success) {
            await new Promise(r => setTimeout(r, 1000));
            onVerified(telegramId);
        } else {
            setError("Database Error");
            setLoading(false);
        }
    } else {
        // If User is null (Telegram Login), go to Nickname step
        await new Promise(r => setTimeout(r, 500));
        setStep(3);
        setLoading(false);
    }
  };

  const handleRegisterTelegramUser = async () => {
      if (!nickname.trim()) {
          setError("Nickname required");
          return;
      }
      setLoading(true);
      try {
          const newUser = await registerTelegramUser(telegramId, nickname);
          onVerified(telegramId, newUser);
      } catch (e) {
          setError("Failed to register. Try again.");
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen py-6 px-4 flex items-center justify-center max-w-lg mx-auto w-full">
       <div className="w-full">
          <button onClick={onBack} className="text-gray-500 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-2 mb-6">
             <span>&lt;</span> {t.back}
          </button>

          <div className="mb-8 text-center">
             <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-blue-500">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
             </div>
             <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-2">
               {t.tgVerifyTitle}
             </h2>
             <p className="text-xs text-gray-400 font-mono tracking-wider">
                SECURE 2-STEP AUTHENTICATION
             </p>
          </div>

          <div className="bg-cyber-dark border border-white/10 rounded-xl p-8 cyber-border shadow-2xl relative overflow-hidden">
             
             {step === 1 && (
                 <div className="space-y-6 animate-fade-in">
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded">
                        <p className="text-[10px] text-yellow-500 font-bold uppercase mb-2 flex items-center gap-2">
                            <AlertCircleIcon className="w-4 h-4"/> {t.tgVerifyWarning}
                        </p>
                        <a 
                           href="https://t.me/elbekdizaynerbot" 
                           target="_blank" 
                           rel="noreferrer"
                           className="block w-full text-center py-2 bg-yellow-500 text-black font-bold text-xs uppercase hover:bg-white transition-colors rounded"
                        >
                            {t.tgVerifyBotLink}
                        </a>
                    </div>

                    <div>
                        <label className="text-[10px] text-cyber-primary uppercase font-bold tracking-widest mb-2 block">{t.tgVerifyStep1}</label>
                        <input
                           type="number"
                           value={telegramId}
                           onChange={(e) => setTelegramId(e.target.value)}
                           className="w-full bg-black border border-white/10 p-4 text-white font-mono focus:border-cyber-primary outline-none cyber-input"
                           placeholder={t.tgVerifyInputPlaceholder}
                           disabled={loading}
                        />
                        <div className="mt-2 text-[10px] text-gray-500 flex justify-between">
                            <span>{t.tgVerifyFindId}</span>
                            <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white font-bold">{t.tgVerifyIdBot}</a>
                        </div>
                    </div>

                    <button
                        onClick={handleSendCode}
                        disabled={loading}
                        className="w-full py-4 bg-cyber-primary text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all cyber-input flex justify-center items-center gap-2"
                    >
                        {loading ? <span className="animate-pulse">{t.tgVerifyScanning}</span> : t.tgVerifyBtnCode}
                    </button>
                 </div>
             )}

             {step === 2 && (
                 <div className="space-y-6 animate-fade-in">
                     <div className="text-center mb-4">
                        <p className="text-xs text-gray-400 mb-1">Code sent to ID:</p>
                        <p className="text-xl font-mono text-white tracking-widest">{telegramId}</p>
                     </div>

                     <div>
                        <label className="text-[10px] text-green-500 uppercase font-bold tracking-widest mb-2 block">{t.tgVerifyStep2}</label>
                        <input
                           type="number"
                           value={otp}
                           onChange={(e) => setOtp(e.target.value)}
                           className="w-full bg-black border border-green-500/50 p-4 text-center text-2xl text-white font-mono focus:border-green-500 outline-none cyber-input tracking-[0.5em]"
                           placeholder="______"
                           disabled={loading}
                           maxLength={6}
                        />
                     </div>

                     <button
                        onClick={handleVerifyCode}
                        disabled={loading}
                        className="w-full py-4 bg-green-500 text-black font-bold uppercase tracking-widest hover:bg-white transition-all cyber-input flex justify-center items-center gap-2"
                    >
                        {loading ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <CheckCircleIcon className="w-5 h-5" />}
                        {loading ? 'VERIFYING...' : t.tgVerifyBtnVerify}
                    </button>
                    
                    <button 
                       onClick={() => { setStep(1); setError(null); }}
                       className="w-full text-xs text-gray-500 hover:text-white uppercase mt-2"
                    >
                        Wrong ID? Change
                    </button>
                 </div>
             )}

             {step === 3 && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-green-500">
                             <CheckCircleIcon className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-white uppercase">Identity Verified</p>
                    </div>

                    <div>
                        <label className="text-[10px] text-cyber-primary uppercase font-bold tracking-widest mb-2 block">Enter Your Nickname</label>
                        <input
                           type="text"
                           value={nickname}
                           onChange={(e) => setNickname(e.target.value)}
                           className="w-full bg-black border border-white/10 p-4 text-white font-mono focus:border-cyber-primary outline-none cyber-input"
                           placeholder="Your Name / Nickname"
                           disabled={loading}
                           autoFocus
                        />
                        <p className="text-[10px] text-gray-500 mt-2">This name will be displayed in your profile.</p>
                    </div>

                    <button
                        onClick={handleRegisterTelegramUser}
                        disabled={loading}
                        className="w-full py-4 bg-cyber-primary text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all cyber-input flex justify-center items-center gap-2"
                    >
                        {loading ? <LoaderIcon className="w-5 h-5 animate-spin"/> : 'ENTER SITE'}
                    </button>
                 </div>
             )}

             {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-bold uppercase text-center animate-pulse rounded">
                    {error}
                </div>
             )}

          </div>
       </div>
    </div>
  );
};

export default TelegramVerifier;
