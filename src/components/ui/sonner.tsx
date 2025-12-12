import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      dir="rtl"
      expand={false}
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl",
          success: "group-[.toaster]:!bg-green-500/95 group-[.toaster]:!text-white group-[.toaster]:!border-green-600/50",
          error: "group-[.toaster]:!bg-red-500/95 group-[.toaster]:!text-white group-[.toaster]:!border-red-600/50",
          warning: "group-[.toaster]:!bg-amber-500/95 group-[.toaster]:!text-black group-[.toaster]:!border-amber-600/50",
          info: "group-[.toaster]:!bg-blue-500/95 group-[.toaster]:!text-white group-[.toaster]:!border-blue-600/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
