
import React from 'react';
import { Helmet } from 'react-helmet-async';
// import { SolomeiHero } from './SolomeiHero';
// import { NarrativeStream } from './NarrativeStream';
import { Hero } from './Hero';
import { DualHero } from './DualHero';
import { Collection } from './Collection';
// import { GenderSplit } from './GenderSplit';
import { Contact } from './Contact';
import { Interlude } from './Interlude';
import { CrocJacketHero } from './CrocJacketHero';
import { HiddenInventoryTest } from './HiddenInventoryTest';

interface HomeProps {
  startAnimation?: boolean;
}

export const Home: React.FC<HomeProps> = ({ startAnimation = true }) => {
  return (
    <>
      <Helmet>
        <title>Luxury Men's & Women's Clothing in Jackson, WY | Matteo Perin</title>
        <meta name="description" content="Matteo Perin is a luxury men's and women's clothing atelier in Jackson, Wyoming. Bespoke outerwear, exotic leather, and one-of-a-kind pieces, handcrafted in Italy. Visit our Jackson Hole showroom at 164 E Deloney Ave." />
        <meta name="keywords" content="luxury womens clothing jackson wy, luxury mens clothing jackson wy, luxury clothing jackson hole, designer clothing jackson wyoming, bespoke clothing jackson hole, Matteo Perin, high end clothing jackson wy" />
        <link rel="canonical" href="https://www.matteoperin.com/" />
        <meta property="og:title" content="Luxury Men's & Women's Clothing in Jackson, WY | Matteo Perin" />
        <meta property="og:description" content="A luxury clothing atelier in Jackson, Wyoming. Bespoke men's and women's outerwear, exotic leather, and one-of-a-kind pieces handcrafted in Italy." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.matteoperin.com/" />
      </Helmet>
      {/* <SolomeiHero /> */}
      {/* <NarrativeStream /> */}
      {/* <Hero startAnimation={startAnimation} /> */}
      <DualHero />
      <Collection />
      <CrocJacketHero />
      <HiddenInventoryTest />
      <Interlude />
      <Contact />
    </>
  );
};

