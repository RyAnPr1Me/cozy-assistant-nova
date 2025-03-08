
import { forwardRef, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardGlassVariants = cva(
  "rounded-xl border border-border/10 backdrop-blur-md shadow-sm animate-scale-in",
  {
    variants: {
      variant: {
        default: "bg-secondary/30",
        accent: "bg-primary/10",
        dark: "bg-background/80 border-border/20",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
      hover: {
        default: "",
        lift: "transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md",
        glow: "transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        border: "transition-all duration-300 hover:border-primary/50",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "default",
    },
  }
);

export interface CardGlassProps 
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardGlassVariants> {}

const CardGlass = forwardRef<HTMLDivElement, CardGlassProps>(
  ({ className, variant, size, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardGlassVariants({ variant, size, hover }), className)}
        {...props}
      />
    );
  }
);

CardGlass.displayName = "CardGlass";

const CardGlassHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));

CardGlassHeader.displayName = "CardGlassHeader";

const CardGlassTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

CardGlassTitle.displayName = "CardGlassTitle";

const CardGlassDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

CardGlassDescription.displayName = "CardGlassDescription";

const CardGlassContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));

CardGlassContent.displayName = "CardGlassContent";

const CardGlassFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));

CardGlassFooter.displayName = "CardGlassFooter";

export {
  CardGlass,
  CardGlassHeader,
  CardGlassTitle,
  CardGlassDescription,
  CardGlassContent,
  CardGlassFooter,
};
