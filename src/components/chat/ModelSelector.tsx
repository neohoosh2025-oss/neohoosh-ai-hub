import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

interface ModelSelectorProps {
  models: Model[];
  onSelect: (modelId: string) => void;
}

export function ModelSelector({ models, onSelect }: ModelSelectorProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold mb-2">با چه مدلی صحبت کنیم؟</h2>
        <p className="text-muted-foreground text-sm">یک دستیار انتخاب کنید</p>
      </motion.div>
      
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {models.map((model, i) => {
          const Icon = model.icon;
          return (
            <motion.button
              key={model.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(model.id)}
              className={cn(
                "p-4 rounded-2xl text-right transition-all duration-200",
                "bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl mb-3 flex items-center justify-center",
                `bg-gradient-to-br ${model.gradient}`
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{model.name}</h3>
              <p className="text-xs text-muted-foreground">{model.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
