import * as React from "react"

import { cn } from "@/lib/utils"
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: JSX.Element
  description?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, description, error, ...props }, ref) => {
    const StartIcon = startIcon

    return (
      <div className="relative w-full">
        <div className="relative">
          {StartIcon && (
            <div className="absolute left-1 top-1/2 -translate-y-1/2 transform">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300",
              StartIcon ? "pl-10" : "px-3",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {description && (
          <p className="mt-2 text-sm text-neutral-500">{description}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
