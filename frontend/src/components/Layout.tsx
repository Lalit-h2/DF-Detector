import { Sidebar } from "./Sidebar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
