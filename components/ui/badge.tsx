import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border-2 border-transparent px-3 py-0.5 text-xs font-bold tracking-wide whitespace-nowrap transition-all select-none [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white border-emerald-700 shadow-[0_2px_0_0_#065f46]",
        secondary:
          "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
        destructive:
          "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
        outline:
          "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
        ghost:
          "hover:bg-slate-100 text-slate-700",
        link: "text-emerald-700 underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
