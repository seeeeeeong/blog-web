import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6 transition-all-smooth hover:opacity-80">
            <h1 className="text-2xl font-sans font-semibold text-text">
              Seeeeeeong.log
            </h1>
          </Link>
          <h2 className="text-xl font-sans font-bold text-text">{title}</h2>
          {subtitle && (
            <p className="text-sm font-sans text-muted mt-2">{subtitle}</p>
          )}
        </div>

        <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
          {children}
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm font-sans text-muted hover:text-text transition-all-smooth inline-flex items-center gap-2">
            <span>←</span>
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
