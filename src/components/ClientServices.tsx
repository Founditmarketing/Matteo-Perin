import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from './RevealOnScroll';

// Shipping, returns, and authenticity. The trust scaffolding a buyer
// (or their advisor) looks for before completing a significant purchase.
//
// NOTE FOR THE HOUSE: the return window and terms below are a sensible
// draft — confirm them with Matteo before treating them as policy.

const Section: React.FC<{ kicker: string; title: string; children: React.ReactNode }> = ({ kicker, title, children }) => (
    <RevealOnScroll>
        <section className="mb-20">
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-4">{kicker}</span>
            <h2 className="font-serif text-3xl md:text-4xl text-matteo-charcoal dark:text-white mb-8">{title}</h2>
            <div className="space-y-5 font-serif text-lg leading-relaxed text-matteo-charcoal/70 dark:text-white/60 max-w-2xl">
                {children}
            </div>
        </section>
    </RevealOnScroll>
);

export const ClientServices: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-40 pb-32 px-6 md:px-12 transition-colors duration-700">
            <Helmet>
                <title>Shipping, Returns &amp; Authenticity | Matteo Perin</title>
                <meta name="description" content="Complimentary insured worldwide delivery, returns on in-stock pieces, and a guarantee of authenticity on every Matteo Perin piece, handcrafted in Italy." />
                <link rel="canonical" href="https://www.matteoperin.com/shipping-returns" />
                <meta property="og:title" content="Shipping, Returns &amp; Authenticity | Matteo Perin" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/shipping-returns" />
            </Helmet>

            <div className="max-w-4xl mx-auto">
                <header className="mb-24">
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-stone block mb-6">Client Services</span>
                    <h1 className="font-serif text-5xl md:text-7xl text-matteo-charcoal dark:text-white font-light leading-none">
                        Considered, <br />from atelier to door.
                    </h1>
                </header>

                <Section kicker="Delivery" title="Shipping">
                    <p>
                        Every order is delivered by insured courier, signature required, at no charge —
                        worldwide. Standard delivery arrives within 5 to 7 business days; priority
                        express (2 to 3 business days) is available at checkout for $120.
                    </p>
                    <p>
                        Each piece is packed by hand at our Jackson Hole atelier and fully insured in
                        transit. You will receive tracking details by private correspondence as soon
                        as your order is dispatched.
                    </p>
                </Section>

                <Section kicker="Peace of Mind" title="Returns &amp; Exchanges">
                    <p>
                        In-stock pieces from the Current Edit may be returned within 14 days of
                        delivery for a full refund, provided they are unworn and in their original
                        condition. Contact the concierge and we will arrange insured collection at
                        our expense.
                    </p>
                    <p>
                        Bespoke commissions and made-to-order pieces are crafted for you alone and
                        are final sale once production begins — this is confirmed with you explicitly
                        before any commission is accepted.
                    </p>
                </Section>

                <Section kicker="Provenance" title="Authenticity">
                    <p>
                        Every Matteo Perin piece is handcrafted in Italy in strictly limited
                        quantities — most are one of one. Each arrives with documentation of its
                        materials and provenance, and exotic leathers are sourced in full compliance
                        with CITES certification.
                    </p>
                </Section>

                <Section kicker="At Your Service" title="The Concierge">
                    <p>
                        Questions before or after a purchase — sizing, materials, delivery, or care —
                        are answered personally. Write to{' '}
                        <a href="mailto:concierge@matteoperin.com" className="text-matteo-orange hover:opacity-70 transition-opacity">concierge@matteoperin.com</a>{' '}
                        or call <a href="tel:+13072649655" className="text-matteo-orange hover:opacity-70 transition-opacity">+1 (307) 264-9655</a>.
                        The showroom at 164 E Deloney Ave, Jackson, Wyoming welcomes you daily.
                    </p>
                </Section>

                <RevealOnScroll>
                    <div className="pt-8 border-t border-matteo-charcoal/10 dark:border-white/10">
                        <Link to="/shop" className="font-sans text-[10px] uppercase tracking-widest border-b border-matteo-orange text-matteo-orange pb-1 hover:opacity-70 transition-opacity">
                            Shop Available Pieces
                        </Link>
                    </div>
                </RevealOnScroll>
            </div>
        </div>
    );
};
