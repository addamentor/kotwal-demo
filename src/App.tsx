import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DemoLanding from "./pages/DemoLanding";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { DemoSessionProvider } from "./context/DemoSessionContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DemoBanner from "./components/DemoBanner";
import DemoLeadGateMount from "./components/lead/DemoLeadGateMount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* DemoSessionProvider sits inside BrowserRouter so the session
                context and the lead-gate hook can both read `useLocation`. */}
            <DemoSessionProvider>
              <DemoLeadGateMount />
              <Routes>
                <Route path="/demo" element={<DemoLanding />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DemoBanner />
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <DemoBanner />
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DemoSessionProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
