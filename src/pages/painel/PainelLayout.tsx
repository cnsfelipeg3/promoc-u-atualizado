import { Outlet } from "react-router-dom";
import PainelSidebar from "@/components/painel/PainelSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/useTheme";

const PainelLayout = () => {
  useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0f172a]">
        <PainelSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-white/10 px-4 lg:hidden">
            <SidebarTrigger className="text-white" />
            <span className="ml-3 text-white font-semibold">PromoCéu</span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PainelLayout;
