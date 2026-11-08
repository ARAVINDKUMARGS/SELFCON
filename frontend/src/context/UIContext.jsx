import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [comparisonList, setComparisonList] = useState([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');

  // Currency rates (simplified baseline conversion)
  const rates = {
    USD: 1,
    INR: 83.5,
    EUR: 0.92
  };

  const symbols = {
    USD: '$',
    INR: '₹',
    EUR: '€'
  };

  const formatPrice = (amountInUSD, mode = 'nightly') => {
    if (!amountInUSD || amountInUSD === 0) return 'Contact Host';
    const rate = rates[currency] || 1;
    const converted = Math.round(amountInUSD * rate);
    const sym = symbols[currency] || '$';

    if (currency === 'INR') {
      return `${sym}${converted.toLocaleString('en-IN')}`;
    }
    return `${sym}${converted.toLocaleString('en-US')}`;
  };

  const toggleComparison = property => {
    setComparisonList(prev => {
      const exists = prev.some(p => p._id === property._id);
      if (exists) {
        return prev.filter(p => p._id !== property._id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 properties at once.');
        return prev;
      }
      return [...prev, property];
    });
  };

  const clearComparison = () => setComparisonList([]);

  const openAiWithPrompt = (prompt = '') => {
    setAiInitialPrompt(prompt);
    setIsAiModalOpen(true);
  };

  return (
    <UIContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        currencySymbol: symbols[currency] || '$',
        comparisonList,
        toggleComparison,
        clearComparison,
        isAiModalOpen,
        setIsAiModalOpen,
        aiInitialPrompt,
        openAiWithPrompt
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

