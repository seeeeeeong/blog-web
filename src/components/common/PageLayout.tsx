import React from 'react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="py-16 mb-12 animate-fade-in">
        <div className="container mx-auto px-6 max-w-5xl">
          <h1 className="text-3xl font-mono tracking-wider text-primary uppercase transition-all-smooth hover:text-accent-green">{title}</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 max-w-5xl pb-20 animate-slide-in-up delay-100">
        {children}
      </main>
    </div>
  );
}
