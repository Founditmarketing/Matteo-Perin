import React from 'react';
import { LookbookPage, LookbookConfig } from './LookbookPage';
import { WOMENS_LOOKBOOK_IMAGES } from '../constants';

const CONFIG: LookbookConfig = {
    idPrefix: 'w',
    images: WOMENS_LOOKBOOK_IMAGES,
    label: "Women's Lookbook",
    subline: "Luxury Women's Clothing \u00B7 Jackson Hole, Wyoming",
    quote: 'Elegance in the uncompromising detail.',
    helmet: {
        title: "Luxury Women's Clothing in Jackson, WY | Matteo Perin",
        description: "Discover luxury women's clothing in Jackson, Wyoming. Matteo Perin's women's lookbook features bespoke outerwear, exotic leather, and one-of-a-kind pieces, handcrafted in Italy and available at our Jackson Hole showroom on 164 E Deloney Ave.",
        canonical: 'https://www.matteoperin.com/lookbook/women',
        ogTitle: "Luxury Women's Clothing in Jackson, WY | Matteo Perin",
        ogDescription: "Bespoke women's outerwear, exotic leather, and one-of-a-kind pieces, handcrafted in Italy. Luxury womenswear in Jackson Hole, Wyoming.",
    },
};

export const WomensLookbook: React.FC = () => <LookbookPage config={CONFIG} />;
