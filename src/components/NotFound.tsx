import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-matteo-cream flex flex-col items-center justify-center text-center px-6">
      <Helmet>
        <title>Page Not Found | Matteo Perin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <span className="font-serif text-9xl text-matteo-charcoal/10 font-bold mb-8">404</span>
      <h1 className="font-serif text-4xl text-matteo-charcoal mb-4">Page Not Found</h1>
      <p className="font-sans text-matteo-stone-ink dark:text-matteo-stone mb-12 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="group flex items-center gap-4 text-matteo-charcoal hover:text-matteo-orange transition-colors"
      >
          <span className="h-[1px] w-8 bg-current group-hover:w-12 transition-all duration-300"></span>
          <span className="font-sans text-xs uppercase tracking-[0.2em]">Return Home</span>
      </Link>
    </div>
  );
};