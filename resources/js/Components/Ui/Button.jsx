import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 gap-2",
    {
        variants: {
            variant: {
                default:
                    "bg-gray-700 text-white shadow-xl shadow-gray-200 hover:bg-gray-600",
                primary:
                    "bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700",
                secondary:
                    "bg-slate-300 text-gray-500 shadow-xl shadow-slate-400 hover:bg-slate-400",
                success:
                    "bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700",
                danger: "bg-rose-500 text-white shadow-xl shadow-rose-200 hover:bg-rose-600",
                warning:
                    "bg-amber-500 text-white shadow-xl shadow-amber-200 hover:bg-amber-600",
                outline:
                    "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600",
                ghost: "hover:bg-slate-100 text-slate-500",
                link: "text-blue-600 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-8 px-3 rounded-[0.5rem]",
                sm: "h-8 px-3 rounded-[0.5rem]",
                lg: "h-14 px-8 rounded-[0.8rem]",
                xl: "h-20 px-12 rounded-[2.5rem] text-sm",
                icon: "h-10 w-10 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

const Button = React.forwardRef(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading = false,
            children,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={loading || props.disabled}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Cargando...</span>
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
