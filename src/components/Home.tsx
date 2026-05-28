
import React from 'react';
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

