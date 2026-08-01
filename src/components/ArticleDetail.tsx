import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

// The Journal is not yet published. Every /journal/:slug URL previously rendered
// the same placeholder essay under six different titles — a credibility risk for
// a house whose word is its product. Until real essays exist, article URLs are
// marked noindex and redirect to /journal.
//
// NOTE FOR THE HOUSE: when the first genuine essays are ready, restore a proper
// article template here, reinstate the /journal/<slug> entries in
// scripts/prerender.mjs and public/sitemap.xml, and re-link Journal in the footer.
export const ArticleDetail: React.FC = () => {
    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex" />
            </Helmet>
            <Navigate to="/journal" replace />
        </>
    );
};
