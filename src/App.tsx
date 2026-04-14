import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PainelLayout from "./pages/painel/PainelLayout";
import Dashboard from "./pages/painel/Dashboard";
import Promocoes from "./pages/painel/Promocoes";
import Videos from "./pages/painel/Videos";
import Agentes from "./pages/painel/Agentes";
import Logs from "./pages/painel/Logs";
import Configuracoes from "./pages/painel/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/painel" element={<PainelLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="promocoes" element={<Promocoes />} />
            <Route path="videos" element={<Videos />} />
            <Route path="agentes" element={<Agentes />} />
            <Route path="logs" element={<Logs />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
