import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6 hover:opacity-70 transition-opacity">
            <h1 className="text-2xl font-mono font-bold text-text tracking-tighter">
              Seeeeeeong.log
            </h1>
          </Link>
          <h2 className="text-lg font-mono font-semibold text-text">{title}</h2>
          {subtitle && (
            <p className="text-sm font-mono text-muted mt-2">{subtitle}</p>
          )}
        </div>

        <div className="border border-border bg-white p-8">
          {children}
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm font-mono text-muted hover:text-text underline">
            / HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
