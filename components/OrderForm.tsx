import React, { useState, useEffect } from 'react';
import { DesignType, GameType, OrderFormState, ValidationErrors, Language } from '../types';
import { sendOrderToTelegram } from '../services/telegramService';
import { LoaderIcon } from './Icons';
import { translations } from '../utils/translations';

interface OrderFormProps {
  selectedGame: GameType;
  selectedDesign: DesignType;
  onBack: () => void;
  onSuccess: () => void;
  language: Language;
}

type Carrier = { name: string; color: string; border: string } | null;

const OrderForm: React.FC<OrderFormProps> = ({ selectedGame, selectedDesign, onBack, onSuccess, language }) => {
  const t = translations[language];
  const [formData, setFormData] = useState<Omit<OrderFormState, 'selectedGame' | 'selectedDesign'>>({
    firstName: '',
    lastName: '',
    phone: '+998',
    telegramUsername: '',
    comment: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carrier, setCarrier] = useState<Carrier>(null);

  useEffect(() => {
    const phone = formData.phone.replace(/\D/g, '');
    if (phone.length >= 5) {
      const code = phone.substring(3, 5);
      switch(code) {
        case '90': case '91': setCarrier({ name: 'Beeline', color: 'text-yellow-400', border: 'border-yellow-400' }); break;
        case '93': case '94': case '50': setCarrier({ name: 'Ucell', color: 'text-purple-400', border: 'border-purple-400' }); break;
        case '99': case '95': case '77': setCarrier({ name: 'Uzmobile', color: 'text-blue-400', border: 'border-blue-400' }); break;
        case '97': case '88': setCarrier({ name: 'Mobiuz', color: 'text-red-400', border: 'border-red-400' }); break;
        case '33': setCarrier({ name: 'Humans', color: 'text-orange-400', border: 'border-orange-400' }); break;
        case '98': setCarrier({ name: 'Perfectum', color: 'text-gray-300', border: 'border-gray-500' }); break;
        default: setCarrier(null);
      }
    } else {
      setCarrier(null);
    }
  }, [formData.phone]);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) { newErrors.firstName = "Required"; isValid = false; }
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(formData.phone)) { newErrors.phone = "Format: +998901234567"; isValid = false; }
    if (!formData.telegramUsername.trim()) { newErrors.telegramUsername = "Required"; isValid = false; }
    if (!formData.comment.trim()) { newErrors.comment = "Required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    const success = await sendOrderToTelegram({
      ...formData,
      selectedGame,
      selectedDesign,
    });

    if (success) {
      onSuccess();
    } else {
      alert("Connection Error");
    }
    
    setIsSubmitting(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) val = '+998';
    if (val.length > 13) return;
    if (!/^\+998[0-9]*$/.test(val)) return;
    setFormData({ ...formData, phone: val });
  };

  return (
    <div className="min-h-screen py-6 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        
        <div className="relative mb-6">
           <button onClick={onBack} className="text-gray-500 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-2 mb-6">
             <span>&lt;</span> {t.back}
           </button>
           
           <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
             {t.formTitle}
           </h2>
           <div className="flex items-center gap-2 mt-2 text-sm text-cyber-primary font-mono border-l-2 border-cyber-primary pl-3">
             <span className="uppercase">{t.games[selectedGame]}</span>
             <span className="text-gray-600">/</span>
             <span className="uppercase">{t.designs[selectedDesign]}</span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">{t.firstName}</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className={`w-full bg-cyber-dark border ${errors.firstName ? 'border-red-500' : 'border-white/10'} p-4 text-white font-mono focus:border-cyber-primary focus:bg-black transition-all outline-none cyber-input`}
                placeholder="Ali"
              />
            </div>
            <div className="relative">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">{t.lastName}</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-cyber-dark border border-white/10 p-4 text-white font-mono focus:border-cyber-primary focus:bg-black transition-all outline-none cyber-input"
                placeholder="Valiyev"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
               <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">{t.phone}</label>
               {carrier && <span className={`text-[10px] uppercase font-bold ${carrier.color}`}>{carrier.name}</span>}
            </div>
            <div className={`relative border ${carrier ? carrier.border : errors.phone ? 'border-red-500' : 'border-white/10'} bg-cyber-dark cyber-input transition-colors`}>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full bg-transparent p-4 text-white font-mono text-lg outline-none"
              />
            </div>
          </div>

          <div>
             <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">{t.tgUsername}</label>
             <div className={`flex bg-cyber-dark border ${errors.telegramUsername ? 'border-red-500' : 'border-white/10'} cyber-input focus-within:border-cyber-primary`}>
                <span className="p-4 text-gray-500 select-none">@</span>
                <input
                    type="text"
                    value={formData.telegramUsername}
                    onChange={(e) => setFormData({...formData, telegramUsername: e.target.value})}
                    className="w-full bg-transparent p-4 pl-0 text-white font-mono outline-none"
                    placeholder="username"
                />
             </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">
              {t.comment}
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              rows={4}
              className={`w-full bg-cyber-dark border ${errors.comment ? 'border-red-500' : 'border-white/10'} p-4 text-white font-mono focus:border-cyber-primary focus:bg-black transition-all outline-none cyber-input`}
              placeholder="..."
            />
          </div>

          <div className="pt-4 pb-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 bg-white text-black font-display font-black text-xl uppercase tracking-widest flex items-center justify-center gap-2 cyber-input hover:bg-cyber-primary hover:text-white transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isSubmitting ? <LoaderIcon className="w-6 h-6 animate-spin" /> : t.submit}
            </button>
            <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
              Secure Encrypted Order
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;