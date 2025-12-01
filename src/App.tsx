import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { PageTransition } from "./components/PageTransition";
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MemoryManagement from "./pages/MemoryManagement";
import AdminTranslate from "./pages/AdminTranslate";
import NeoHi from "./pages/NeoHi";
import AISettings from "./pages/AISettings";
import DesignSystem from "./pages/DesignSystem";
import Pricing from "./pages/Pricing";
import Tools from "./pages/Tools";
import ImageGenerator from "./pages/ImageGenerator";
import VoiceToText from "./pages/VoiceToText";
import TextToVoice from "./pages/TextToVoice";
import CodeGenerator from "./pages/CodeGenerator";
import NotFound from "./pages/NotFound";
import VoiceCall from "./pages/VoiceCall";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <Routes>
              {/* Full-screen routes without Navigation/Footer */}
              <Route path="/neohi" element={<NeoHi />} />
              <Route path="/ai-settings" element={<AISettings />} />
              <Route path="/design-system" element={<DesignSystem />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/voice-call" element={<VoiceCall />} />
              
              {/* Regular routes with Navigation/Footer */}
              <Route path="*" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <PageTransition>
                      <Routes>
                        <Route path="/" element={<Home />} />
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
                        <Route path="/profile" element={<Profile />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </PageTransition>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
  </QueryClientProvider>
);

export default App;
