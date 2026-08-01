import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Anything the concierge modal can be opened for: catalog garments (Product
 * from ../types satisfies this shape) or Casa furniture pieces, which carry
 * string ids and no price.
 */
export interface InquiryItem {
  id: number | string;
  title: string;
  image: string;
  price?: number;
}

interface InquiryContextType {
  isInquiryOpen: boolean;
  setIsInquiryOpen: (open: boolean) => void;
  selectedProduct: InquiryItem | null;
  /** Optional whisper shown in the modal and sent with the inquiry,
      e.g. 'Regarding the Orfeo, from Casa.' */
  inquiryContext: string | null;
  openInquiry: (item: InquiryItem, contextLine?: string) => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const InquiryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InquiryItem | null>(null);
  const [inquiryContext, setInquiryContext] = useState<string | null>(null);

  const openInquiry = (item: InquiryItem, contextLine?: string) => {
    setSelectedProduct(item);
    setInquiryContext(contextLine ?? null);
    setIsInquiryOpen(true);
  };

  return (
    <InquiryContext.Provider value={{ isInquiryOpen, setIsInquiryOpen, selectedProduct, inquiryContext, openInquiry }}>
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
