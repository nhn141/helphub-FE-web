import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-bold tracking-wide whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-[0_3px_0_0_#065f46] hover:bg-emerald-500 active:translate-y-0.5 active:shadow-none",
        duo:
          "bg-emerald-500 text-white font-extrabold shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:translate-y-1 active:shadow-none",
        outline:
          "border-2 border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_0_#e2e8f0] hover:border-emerald-300 hover:text-emerald-700 active:translate-y-0.5 active:shadow-none",
        secondary:
          "bg-slate-100 text-slate-800 border-2 border-slate-200 shadow-[0_3px_0_0_#cbd5e1] hover:bg-slate-200 active:translate-y-0.5 active:shadow-none",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/80 font-semibold",
        destructive:
          "bg-rose-600 text-white shadow-[0_3px_0_0_#9f1239] hover:bg-rose-500 active:translate-y-0.5 active:shadow-none",
        link: "text-emerald-700 underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 rounded-2xl px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
