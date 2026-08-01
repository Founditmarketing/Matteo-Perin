import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { RevealOnScroll } from './RevealOnScroll';

// The House Record — a dated ledger of the house's doings, read from the
// "Record" tab of the sheet via /api/record. Nothing is written here by
// hand: an empty or failed fetch falls back to the quiet forthcoming line.
interface RecordEntry {
    Date: string;
    Title: string;
    Note?: string;
}

export const Journal: React.FC = () => {
    const [entries, setEntries] = useState<RecordEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadRecord = async () => {
            try {
                const res = await fetch('/api/record');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!cancelled) setEntries(Array.isArray(json?.data) ? json.data : []);
            } catch {
                // Stay quiet — the forthcoming line below covers the ledger.
            } finally {
                if (!cancelled) setLoaded(true);
            }
        };
        loadRecord();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-40 pb-32 px-6 md:px-12 transition-colors duration-700">
            <Helmet>
                <title>The House Record | Matteo Perin</title>
                <meta name="description" content="The House Record — a dated ledger of notes from the Matteo Perin atelier." />
                <link rel="canonical" href="https://www.matteoperin.com/journal" />
                <meta property="og:title" content="The House Record | Matteo Perin" />
                <meta property="og:description" content="A dated ledger of notes from the atelier." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/journal" />
            </Helmet>

            <div className="max-w-3xl mx-auto">
                <RevealOnScroll>
                    <header className="mb-16 md:mb-20">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] font-medium text-matteo-orange-ink dark:text-matteo-orange block mb-6">
                            The House Record
                        </span>
                        <h1 className="font-serif text-5xl md:text-7xl text-matteo-charcoal dark:text-white font-light tracking-tight">
                            The Record
                        </h1>
                    </header>
                </RevealOnScroll>

                {loaded && entries.length > 0 ? (
                    <RevealOnScroll delay={0.1}>
                        {/* The ledger — hairline rows: date in the eyebrow register,
                            title in serif, the note as an italic aside. */}
                        <div className="border-t border-matteo-charcoal/10 dark:border-white/10">
                            {entries.map((entry, index) => (
                                <article
                                    key={`${entry.Date}-${index}`}
                                    className="py-8 md:py-10 border-b border-matteo-charcoal/10 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8"
                                >
                                    <span className="md:col-span-3 font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange md:pt-2">
                                        {entry.Date}
                                    </span>
                                    <div className="md:col-span-9">
                                        <h2 className="font-serif text-2xl md:text-3xl text-matteo-charcoal dark:text-white font-light leading-tight">
                                            {entry.Title}
                                        </h2>
                                        {entry.Note && (
                                            <p className="font-serif italic text-[15px] text-matteo-charcoal/70 dark:text-white/60 mt-3 leading-relaxed">
                                                {entry.Note}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </RevealOnScroll>
                ) : loaded ? (
                    <RevealOnScroll delay={0.1}>
                        {/* Empty ledger — the house says nothing until it has
                            something to record. */}
                        <div className="w-[1px] h-16 bg-matteo-charcoal/20 dark:bg-white/20 mb-8"></div>
                        <p className="font-serif text-xl md:text-2xl text-matteo-charcoal/80 dark:text-white/70 italic">
                            Notes from the atelier &mdash; forthcoming.
                        </p>
                    </RevealOnScroll>
                ) : null}
            </div>
        </div>
    );
};
