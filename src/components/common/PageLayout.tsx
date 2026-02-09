import React from 'react';

interface PageLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="w-full lg:px-8 px-4 py-8">
      {children}
    </div>
  );
}
