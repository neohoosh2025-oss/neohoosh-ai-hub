import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Upload, FileText, Languages, Download, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import VideoInput from "@/components/neoflux/VideoInput";
import SubtitleProcessor from "@/components/neoflux/SubtitleProcessor";
import TranslationLab from "@/components/neoflux/TranslationLab";
import Dashboard from "@/components/neoflux/Dashboard";
import { NeoFluxProvider } from "@/contexts/NeoFluxContext";

const NeoFlux = () => {
  const [activeTab, setActiveTab] = useState("input");

  return (
    <NeoFluxProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    NeoFlux
                  </h1>
                  <p className="text-xs text-muted-foreground">پردازش هوشمند ویدیو و زیرنویس</p>
                </div>
              </div>
              
              {/* API Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">متصل</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-muted/50 backdrop-blur">
              <TabsTrigger value="input" className="gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">ورودی ویدیو</span>
              </TabsTrigger>
              <TabsTrigger value="subtitle" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">زیرنویس</span>
              </TabsTrigger>
              <TabsTrigger value="translate" className="gap-2">
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">ترجمه</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">داشبورد</span>
              </TabsTrigger>
            </TabsList>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="input" className="space-y-6">
                <VideoInput onNext={() => setActiveTab("subtitle")} />
              </TabsContent>

              <TabsContent value="subtitle" className="space-y-6">
                <SubtitleProcessor onNext={() => setActiveTab("translate")} />
              </TabsContent>

              <TabsContent value="translate" className="space-y-6">
                <TranslationLab onNext={() => setActiveTab("dashboard")} />
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-6">
                <Dashboard />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </NeoFluxProvider>
  );
};

export default NeoFlux;
