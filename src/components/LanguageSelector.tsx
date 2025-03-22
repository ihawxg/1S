import { useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { FiChevronDown } from 'react-icons/fi';
import { FiCheck } from 'react-icons/fi';

interface Language {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  onLanguageChange: (languageCode: string) => void;
  currentLanguage: string;
  isLoading?: boolean;
  progress?: number;
  total?: number;
}

const LanguageSelector = ({ 
  onLanguageChange, 
  currentLanguage, 
  isLoading = false,
  progress = 0,
  total = 0
}: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
  ];

  const currentLanguageName = languages.find(lang => lang.code === currentLanguage)?.name || 'English';

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="relative">
        <button
          type="button"
          className={`flex bg-white border border-gray-300 justify-between rounded-md shadow-sm text-gray-700 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium items-center px-4 py-2 ${isLoading ? 'opacity-80' : 'hover:bg-gray-50'}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="border-2 border-b-blue-200 border-l-transparent border-r-blue-200 border-t-blue-200 h-4 rounded-full w-4 animate-spin mr-2"></span>
              <span className="truncate">{currentLanguageName}</span>
              {progress > 0 && total > 0 && (
                <span className="text-xs ml-1 text-blue-600">
                  {Math.round((progress / total) * 100)}%
                </span>
              )}
            </>
          ) : (
            <span>{currentLanguageName}</span>
          )}
          <FiChevronDown className="h-5 w-5 -mr-1 ml-auto shrink-0" />
        </button>

        {isOpen && (
          <div className="bg-white rounded-md shadow-lg w-40 absolute mt-1 right-0 z-10">
            <ul 
              className="text-base max-h-60 overflow-auto py-1"
              role="listbox"
            >
              {languages.map((language) => (
                <li
                  key={language.code}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                    currentLanguage === language.code ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleLanguageSelect(language.code)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleLanguageSelect(language.code)}
                >
                  <span className="text-gray-800 block truncate">{language.name}</span>
                  {currentLanguage === language.code && (
                    <span className="flex text-blue-600 absolute inset-y-0 items-center pr-4 right-0">
                      <FiCheck className="h-5 w-5" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default LanguageSelector; 