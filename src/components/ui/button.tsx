import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cyan' | 'violet' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
          // Variants
          variant === 'primary' && "bg-white text-black hover:bg-neutral-200 shadow-sm",
          variant === 'secondary' && "bg-white/5 text-white hover:bg-white/10 border border-white/10",
          variant === 'outline' && "border border-white/10 bg-transparent text-white hover:bg-white/5",
          variant === 'ghost' && "bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white",
          variant === 'cyan' && "bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 shadow-[0_0_15px_-3px_rgba(0,240,255,0.2)]",
          variant === 'violet' && "bg-neon-violet text-white hover:bg-neon-violet/90 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]",
          variant === 'danger' && "bg-neon-rose text-white hover:bg-neon-rose/90 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]",
          // Sizes
          size === 'sm' && "h-8 px-3 text-xs",
          size === 'md' && "h-10 px-4 text-sm",
          size === 'lg' && "h-12 px-6 text-base",
          size === 'icon' && "h-10 w-10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export default Button;
