
import React, { useState, useEffect } from 'react';
import { Language, User, VerifiedLocation, CountryData } from '../types';
import { translations } from '../utils/translations';
import { LoaderIcon, AlertCircleIcon, GlobeIcon } from './Icons';
import { getUserBanStatus, incrementBanStrikes, logout } from '../services/firebase';

interface LocationVerifierProps {
  user: User;
  language: Language;
  onVerified: (location: VerifiedLocation) => void;
  onBack: () => void;
  onBan: () => void;
}

const LocationVerifier: React.FC<LocationVerifierProps> = ({ user, language, onVerified, onBack, onBan }) => {
  const t = translations[language];
  
  // Data State
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  // Form State
  const [selectedCountry, setSelectedCountry] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Verify State
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strikes, setStrikes] = useState(0);

  useEffect(() => {
    // 1. Check Ban Status
    getUserBanStatus(user.uid).then(status => {
      setStrikes(status.attempts);
      if (status.isBanned) {
        onBan();
      }
    });

    // 2. Fetch ALL Countries from REST API
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
        const data = await res.json();
        const sorted = data.sort((a: CountryData, b: CountryData) => a.name.common.localeCompare(b.name.common));
        setAllCountries(sorted);
      } catch (e) {
        console.error("Failed to load countries", e);
        // Fallback basic list if API fails
        setAllCountries([
            { name: { common: 'Uzbekistan' }, cca2: 'UZ', flags: { svg: '' } },
            { name: { common: 'Russia' }, cca2: 'RU', flags: { svg: '' } },
            { name: { common: 'United States' }, cca2: 'US', flags: { svg: '' } },
        ]);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, [user.uid]);

  const filteredCountries = allCountries.filter(c => 
    c.name.common.toLowerCase().includes(searchCountry.toLowerCase())
  );

  // Helper for Fuzzy Matching (Removes case, spaces, special chars)
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const checkStrictMatch = (userInput: string, gpsValue: string | undefined) => {
    if (!gpsValue) return false;
    const normUser = normalize(userInput);
    const normGPS = normalize(gpsValue);
    
    // Check if one contains the other (e.g. "Fergana" in "Fergana Region")
    return normGPS.includes(normUser) || normUser.includes(normGPS);
  };

  const handleVerify = async () => {
    if (!selectedCountry || !region || !city) {
      setError("Please fill all fields completely.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported. Please use a mobile device or enable GPS.");
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // AI Simulation Delay for dramatic effect
          await new Promise(r => setTimeout(r, 2500));

          // Reverse Geocoding from OpenStreetMap (Nominatim)
          // We need detailed address info
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
          const data = await response.json();
          
          if (!data || !data.address) {
             throw new Error("Could not determine satellite location");
          }

          const addr = data.address;
          console.log("GPS DATA:", addr);

          const gpsCountryCode = addr.country_code?.toUpperCase(); // 'UZ'
          const gpsCountry = addr.country; // 'Uzbekistan'
          const gpsState = addr.state || addr.region || addr.province || addr.state_district; // 'Fergana Region'
          const gpsCity = addr.city || addr.town || addr.village || addr.county || addr.district || addr.suburb; // 'Fergana'

          // Find the selected country object to get valid code
          const selectedCountryObj = allCountries.find(c => c.name.common === selectedCountry);
          
          // --- LEVEL 1: COUNTRY CHECK ---
          let countryMatch = false;
          if (selectedCountryObj && gpsCountryCode) {
             countryMatch = selectedCountryObj.cca2 === gpsCountryCode;
          }
          if (!countryMatch && gpsCountry) {
             countryMatch = normalize(gpsCountry) === normalize(selectedCountry);
          }

          if (!countryMatch) {
             await handleVerificationFail(`${t.locFail} DETECTED: ${gpsCountry?.toUpperCase() || gpsCountryCode}`);
             setIsVerifying(false);
             return;
          }

          // --- LEVEL 2: REGION CHECK (Strict) ---
          // e.g. User: "Farg'ona", GPS: "Fergana Region" -> Match
          // e.g. User: "Farg'ona", GPS: "Tashkent" -> Fail
          const regionMatch = checkStrictMatch(region, gpsState);
          
          if (!regionMatch) {
             await handleVerificationFail(`${t.locFailRegion} ${gpsState?.toUpperCase() || 'UNKNOWN'}`);
             setIsVerifying(false);
             return;
          }

          // --- LEVEL 3: CITY CHECK (Strict) ---
          const cityMatch = checkStrictMatch(city, gpsCity);

          if (!cityMatch) {
             await handleVerificationFail(`${t.locFailCity} ${gpsCity?.toUpperCase() || 'UNKNOWN'}`);
             setIsVerifying(false);
             return;
          }

          // SUCCESS
          onVerified({
            country: selectedCountry,
            region,
            city,
            lat: latitude,
            lng: longitude
          });

        } catch (err) {
          setError("Network/GPS Error. Please try again.");
          console.error(err);
        } finally {
          setIsVerifying(false);
        }
      },
      (err) => {
        console.error(err);
        setError("GPS ACCESS DENIED. YOU MUST ALLOW LOCATION TO PROCEED.");
        setIsVerifying(false);
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  };

  const handleVerificationFail = async (reason: string) => {
     const isBanned = await incrementBanStrikes(user.uid);
     setStrikes(prev => prev + 1);
     
     if (isBanned) {
        await logout();
        onBan();
     } else {
        setError(reason);
     }
  };

  return (
    <div className="min-h-screen py-6 px-4 flex items-center justify-center max-w-lg mx-auto w-full">
      <div className="w-full">
        <button onClick={onBack} className="text-gray-500 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-2 mb-6">
           <span>&lt;</span> {t.back}
        </button>

        <div className="mb-8 text-center relative">
          <div className="relative inline-block">
             <GlobeIcon className="w-20 h-20 mx-auto text-cyber-primary mb-4 animate-spin-slow" />
             <div className="absolute inset-0 border border-cyber-primary/30 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-2">
            {t.locTitle}
          </h2>
          <div className="flex justify-center gap-2">
             {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 w-8 rounded ${s <= strikes ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-gray-800'}`}></div>
             ))}
          </div>
          <p className="text-[10px] text-red-500 font-mono mt-2 uppercase tracking-widest">
             Strike {strikes} of 3
          </p>
        </div>

        <div className="space-y-6 bg-black/50 backdrop-blur-md p-8 border border-white/10 rounded-xl cyber-border shadow-2xl relative">
          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-primary/50 animate-scan pointer-events-none"></div>

          {/* Country Selector with Search */}
          <div className="relative">
            <label className="text-[10px] text-cyber-primary uppercase font-bold tracking-widest mb-2 block">{t.locCountry}</label>
            
            <button 
              onClick={() => !isVerifying && setShowDropdown(!showDropdown)}
              className="w-full bg-cyber-dark border border-white/10 p-4 text-white font-mono text-left flex justify-between items-center hover:border-cyber-primary transition-all cyber-input"
            >
              <span>{selectedCountry || "SELECT DATABASE..."}</span>
              <span className="text-xs">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 w-full max-h-60 bg-black border border-cyber-primary z-50 overflow-y-auto custom-scrollbar shadow-xl mt-1">
                 <div className="sticky top-0 bg-black p-2 border-b border-white/10">
                    <input 
                      type="text" 
                      placeholder="SEARCH..." 
                      className="w-full bg-white/10 p-2 text-white font-mono text-xs outline-none"
                      value={searchCountry}
                      onChange={(e) => setSearchCountry(e.target.value)}
                      autoFocus
                    />
                 </div>
                 {isLoadingCountries ? (
                    <div className="p-4 text-center text-xs text-gray-500">LOADING API...</div>
                 ) : (
                    filteredCountries.map(c => (
                       <button
                         key={c.cca2}
                         onClick={() => {
                           setSelectedCountry(c.name.common);
                           setShowDropdown(false);
                           setSearchCountry('');
                         }}
                         className="w-full text-left p-3 hover:bg-cyber-primary hover:text-white text-gray-300 text-sm flex items-center gap-3 border-b border-white/5"
                       >
                         <img src={c.flags.svg} alt="" className="w-5 h-auto object-cover" />
                         <span className="truncate">{c.name.common}</span>
                       </button>
                    ))
                 )}
              </div>
            )}
          </div>

          <div>
             <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">{t.locRegion}</label>
             <input
               type="text"
               value={region}
               onChange={(e) => setRegion(e.target.value)}
               className="w-full bg-cyber-dark border border-white/10 p-4 text-white font-mono focus:border-cyber-primary outline-none cyber-input"
               placeholder="STATE / PROVINCE (e.g. Fergana)"
               disabled={isVerifying}
             />
          </div>

          <div>
             <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">{t.locCity}</label>
             <input
               type="text"
               value={city}
               onChange={(e) => setCity(e.target.value)}
               className="w-full bg-cyber-dark border border-white/10 p-4 text-white font-mono focus:border-cyber-primary outline-none cyber-input"
               placeholder="CITY / DISTRICT (e.g. Margilan)"
               disabled={isVerifying}
             />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-500 text-red-500 p-4 text-xs font-bold flex items-start gap-3 mt-4 animate-pulse">
               <AlertCircleIcon className="w-6 h-6 shrink-0" />
               <span className="uppercase">{error}</span>
            </div>
          )}

          <div className="pt-4">
             <button
               onClick={handleVerify}
               disabled={isVerifying}
               className={`w-full py-5 ${isVerifying ? 'bg-cyber-dark border border-cyber-primary cursor-wait' : 'bg-cyber-primary text-white hover:bg-white hover:text-black'} font-display font-black text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all cyber-input relative overflow-hidden group shadow-[0_0_20px_rgba(99,102,241,0.4)]`}
             >
               {isVerifying ? (
                 <>
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan"></div>
                   <LoaderIcon className="w-6 h-6 text-cyber-primary animate-spin" />
                   <span className="text-cyber-primary text-xs">{t.locVerifying}</span>
                 </>
               ) : (
                 <>
                   <GlobeIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" /> 
                   {t.locVerifyBtn}
                 </>
               )}
             </button>
             <p className="text-center text-[9px] text-gray-600 mt-4 font-mono uppercase">
                SECURE SATELLITE CONNECTION ESTABLISHED
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LocationVerifier;
