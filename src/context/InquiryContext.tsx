import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';

interface InquiryContextType {
  isInquiryOpen: boolean;
  setIsInquiryOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  openInquiry: (product: Product) => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const InquiryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openInquiry = (product: Product) => {
    setSelectedProduct(product);
    setIsInquiryOpen(true);
  };

  return (
    <InquiryContext.Provider value={{ isInquiryOpen, setIsInquiryOpen, selectedProduct, openInquiry }}>
      {children}
    </InquiryContext.Provider>
  );
};

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (context === undefined) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};