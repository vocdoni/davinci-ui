import { FloatingHeader } from "@/components/floating-header";
import { Footer } from "@/components/footer";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-davinci-paper-base/30 flex flex-col font-work-sans">
      <FloatingHeader />
      <main className="flex-1 pt-32 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
