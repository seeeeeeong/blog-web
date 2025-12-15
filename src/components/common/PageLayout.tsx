import React from 'react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900 text-white py-16 mb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold font-mono tracking-tight">{title}</h1>
        </div>
      </header>
      <main className="container mx-auto px-6 max-w-4xl pb-20">
        {children}
      </main>
    </div>
  );
}
