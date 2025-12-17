import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PageTransition } from "./components/PageTransition";
import { SystemMonitor } from "./components/SystemMonitor";
import { SplashScreen } from "./components/SplashScreen";
import { lazy, Suspense, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Chat from "./pages/Chat";

// Lazy load most pages
const Home = lazy(() => import("./pages/Index"));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const MemoryManagement = lazy(() => import("./pages/MemoryManagement"));
const AdminTranslate = lazy(() => import("./pages/AdminTranslate"));
const NeoHi = lazy(() => import("./pages/NeoHi"));
const AISettings = lazy(() => import("./pages/AISettings"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Tools = lazy(() => import("./pages/Tools"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const VoiceToText = lazy(() => import("./pages/VoiceToText"));
const TextToVoice = lazy(() => import("./pages/TextToVoice"));
const CodeGenerator = lazy(() => import("./pages/CodeGenerator"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient for high-volume requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

import { Navigate } from "react-router-dom";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash was shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SystemMonitor />
          
          <AnimatePresence mode="wait">
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          </AnimatePresence>
          
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                  <Route path="/neohi" element={<NeoHi />} />
                  <Route path="/ai-settings" element={<AISettings />} />
                  <Route path="/design-system" element={<DesignSystem />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/tools/image-generator" element={<ImageGenerator />} />
                  <Route path="/tools/voice-to-text" element={<VoiceToText />} />
                  <Route path="/tools/text-to-voice" element={<TextToVoice />} />
                  <Route path="/tools/code-generator" element={<CodeGenerator />} />
                  <Route path="/memory" element={<MemoryManagement />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/translate" element={<AdminTranslate />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
