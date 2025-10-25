import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import OfficeInformation from "./pages/OfficeInformation";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";
import GeneralInformation from "./pages/GeneralInformation";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/office-information" element={<ProtectedRoute><OfficeInformation language={language} /></ProtectedRoute>} />
              <Route path="/general-information" element={<ProtectedRoute><GeneralInformation language={language} /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications language={language} /></ProtectedRoute>} />
              {/* <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} /> */}
              <Route path="/settings" element={<ProtectedRoute><Settings language={language} /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><Security language={language} /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
