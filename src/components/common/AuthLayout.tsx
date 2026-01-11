import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8 transition-transform-smooth hover:scale-105">
            <h1 className="text-2xl font-mono text-primary hover:text-accent-green transition-all-smooth tracking-wider uppercase">
              seeeeeeong.log
            </h1>
          </Link>
          <h2 className="text-xl font-mono text-primary mb-2 tracking-wide uppercase animate-slide-in-up delay-100">{title}</h2>
          {subtitle && (
            <p className="text-xs font-mono text-tertiary mt-2 tracking-wide uppercase animate-slide-in-up delay-200">{subtitle}</p>
          )}
        </div>
        <div className="bg-whitesmoke border border-primary p-10 shadow-[1px_1px_0_#232324] transition-all-smooth hover:shadow-[2px_2px_0_#232324] animate-slide-in-up delay-300">
          {children}
        </div>
        <div className="text-center mt-6 animate-fade-in delay-400">
          <Link to="/" className="text-xs font-mono text-tertiary hover:text-primary transition-all-smooth tracking-wide uppercase relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full group">
            <span className="inline-block transition-transform-smooth group-hover:-translate-x-1">←</span> BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
