
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DualHero } from './DualHero';
import { Collection } from './Collection';
import { Contact } from './Contact';
import { Interlude } from './Interlude';
import { CrocJacketHero } from './CrocJacketHero';
import { HiddenInventoryTest } from './HiddenInventoryTest';

export const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Matteo Perin | Bespoke Italian Atelier — Jackson Hole</title>
        <meta name="description" content="Luxury men's and women's clothing in Jackson, WY. Matteo Perin is a bespoke Italian atelier offering outerwear, leather goods, and exotic one-of-one pieces. Visit our Jackson Hole showroom at 164 E Deloney Ave." />
        <link rel="canonical" href="https://www.matteoperin.com/" />
        <meta property="og:title" content="Matteo Perin | Bespoke Italian Atelier — Jackson Hole" />
        <meta property="og:description" content="A bespoke Italian atelier in Jackson, Wyoming. Men's and women's outerwear, exotic leather, and one-of-a-kind pieces handcrafted in Italy." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.matteoperin.com/" />
      </Helmet>
      <DualHero />
      <HiddenInventoryTest />
      <Collection />
      <CrocJacketHero />
      <Interlude />
      <Contact />
    </>
  );
};

