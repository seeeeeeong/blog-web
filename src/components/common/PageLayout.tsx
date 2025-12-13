import React from 'react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white w-full">
      <div className="bg-gray-900 text-white py-12 mb-8">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <h1 className="text-3xl font-bold font-mono">{title}</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-8 max-w-5xl pb-16">
        {children}
      </div>
    </div>
  );
}
