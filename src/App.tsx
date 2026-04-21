import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Intro from "./pages/Intro.tsx";
import Index from "./pages/Index.tsx";
import Inventory from "./pages/Inventory.tsx";
import Financials from "./pages/Financials.tsx";
import Projects from "./pages/Projects.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Funding from "./pages/Funding.tsx";
import Insurance from "./pages/Insurance.tsx";
import Reports from "./pages/Reports.tsx";
import Recollab from "./pages/Recollab.tsx";
import Set1 from "./pages/Set1.tsx";
import Set2 from "./pages/Set2.tsx";
import Problem from "./pages/Problem.tsx";
import NotFound from "./pages/NotFound.tsx";
import FloatingChat from "./components/FloatingChat.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FloatingChat />
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/onboarding" element={<Index />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/funding" element={<Funding />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/recollab" element={<Recollab />} />
          <Route path="/problem" element={<Problem />} />
          <Route path="/set1" element={<Set1 />} />
          <Route path="/set2" element={<Set2 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
