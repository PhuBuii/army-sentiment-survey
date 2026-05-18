import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 [a]:hover:bg-emerald-600/20",
        secondary:
          "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 [a]:hover:bg-slate-200",
        destructive:
          "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 focus-visible:ring-red-500/20 [a]:hover:bg-red-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 focus-visible:ring-amber-500/20 [a]:hover:bg-amber-500/20",
        success:
          "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 focus-visible:ring-emerald-500/20 [a]:hover:bg-emerald-500/20",
        outline:
          "border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300 [a]:hover:bg-slate-50 dark:[a]:hover:bg-white/5",
        ghost:
          "hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-300",
        link: "text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400",
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
