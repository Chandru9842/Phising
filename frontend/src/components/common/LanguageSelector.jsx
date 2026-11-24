import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage, languages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${currentLanguage.nativeName} - ${t('nav.selectLanguage', {}, 'Select Language')}`}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] hover:border-[#94A3B8] transition-colors text-xs font-medium shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
      >
        <Globe className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
        <span className="font-sans font-semibold tracking-tight">{currentLanguage.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#64748B] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('nav.selectLanguage', {}, 'Select Language')}
          className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white border border-[#E2E8F0] shadow-lg py-1 z-[100] animate-fadeIn focus:outline-none"
        >
          <div className="px-3 py-1.5 border-b border-[#F1F5F9] text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            {t('nav.selectLanguage', {}, 'Select Language')}
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
                    : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-sans text-[13px]">{lang.nativeName}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">{lang.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#1D4ED8] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
