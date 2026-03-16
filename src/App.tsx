import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/stores/appStore";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import BottomNav from "@/components/layout/BottomNav";
import Index from "./pages/Index";
import Pantry from "./pages/Pantry";
import Chat from "./pages/Chat";
import Shopping from "./pages/Shopping";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  if (!hasOnboarded) {
    return <OnboardingFlow />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
