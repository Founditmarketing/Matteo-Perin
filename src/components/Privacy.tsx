import React from 'react';
import { Helmet } from 'react-helmet-async';

export const Privacy: React.FC = () => {
  return (
    <div className="bg-matteo-cream min-h-screen pt-32 pb-24">
      <Helmet>
        <title>Privacy Policy | Matteo Perin</title>
        <meta name="description" content="How Matteo Perin collects, uses, and protects your personal information across our atelier, showroom, and online services." />
        <link rel="canonical" href="https://www.matteoperin.com/privacy" />
      </Helmet>
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        
        <div className="mb-16">
            <h1 className="font-serif text-4xl md:text-5xl text-matteo-charcoal mb-8">Privacy Policy</h1>
            <p className="font-sans text-xs uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone">Last Updated: January 2026</p>
        </div>

        <div className="font-serif text-matteo-charcoal/80 space-y-8 leading-relaxed">
            <p>
                Matteo Perin ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>

            <h3 className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal font-bold mt-8">1. Information We Collect</h3>
            <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows: Identity Data, Contact Data, Technical Data, and Usage Data. We do not collect any Special Categories of Personal Data about you.
            </p>

            <h3 className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal font-bold mt-8">2. How We Use Your Data</h3>
            <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                <br/>• To process your bespoke commission inquiry.
                <br/>• To manage our relationship with you.
                <br/>• To send you information about our services and events that you have requested.
            </p>

             <h3 className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal font-bold mt-8">3. Data Security</h3>
            <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
            
             <h3 className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal font-bold mt-8">4. Contact Us</h3>
            <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at our atelier in Veneto or via the contact form on this website.
            </p>
        </div>

      </div>
    </div>
  );
};