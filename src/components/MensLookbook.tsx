import React from 'react';
import { LookbookPage, LookbookConfig } from './LookbookPage';
import { MENS_LOOKBOOK_IMAGES } from '../constants';

const CONFIG: LookbookConfig = {
    idPrefix: 'm',
    images: MENS_LOOKBOOK_IMAGES,
    label: "Men's Lookbook",
    subline: "Luxury Men's Clothing \u00B7 Jackson Hole, Wyoming",
    quote: 'Form strictly follows intent.',
    enquiryContext: 'Men Lookbook',
    helmet: {
        title: "Luxury Men's Clothing in Jackson, WY | Matteo Perin",
        description: "Discover luxury men's clothing in Jackson, Wyoming. Matteo Perin's men's lookbook features bespoke jackets, suits, and exotic outerwear, handcrafted in Italy and available at our Jackson Hole showroom on 164 E Deloney Ave.",
        canonical: 'https://www.matteoperin.com/lookbook/men',
        ogTitle: "Luxury Men's Clothing in Jackson, WY | Matteo Perin",
        ogDescription: "Bespoke men's jackets, suits, and exotic outerwear, handcrafted in Italy. Luxury menswear in Jackson Hole, Wyoming.",
    },
};

export const MensLookbook: React.FC = () => <LookbookPage config={CONFIG} />;
