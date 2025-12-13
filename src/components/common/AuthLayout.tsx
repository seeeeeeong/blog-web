import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold font-mono">seeeeeeong.log</h1>
          </Link>
          <h2 className="text-2xl font-bold font-mono text-gray-900">{title}</h2>
          <p className="text-sm font-mono text-gray-500">{subtitle}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          {children}
        </div>
        <div className="text-center mt-6">
          <Link to="/" className="text-xs font-mono text-gray-500 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
