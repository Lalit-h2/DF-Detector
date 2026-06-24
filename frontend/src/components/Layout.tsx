import { Sidebar } from "./Sidebar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main
        className="
          flex-1
          lg:ml-64
          pt-20 lg:pt-8
          p-4 sm:p-6 lg:p-8
          overflow-y-auto
          min-h-screen
          scrollbar-hide
        "
      >
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}