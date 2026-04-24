import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 bg-surface min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
