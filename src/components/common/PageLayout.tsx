import React from 'react';

interface PageLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}
