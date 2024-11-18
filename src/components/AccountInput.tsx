import { Input } from "@/components/ui/input"
import Image from "next/image"
import React from "react"
import { banks } from "@/data/NorwegianBanks"
import { PiggyBank } from "lucide-react"
import { useController, Control, Controller } from "react-hook-form"
import { validateAccountNumber } from "@/lib/expense"
import { InputProps } from "./ui/input"

// Define base props without form-specific props
interface AccountInputBaseProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "onChange" | "onBlur" | "value" | "name"
  > {
  description?: string
  error?: string
}

const AccountInputBase = React.forwardRef<
  HTMLInputElement,
  AccountInputBaseProps & {
    value: string
    onChange: (value: string) => void
    onBlur: () => void
  }
>(({ value, onChange, onBlur, ...props }, ref) => {
  // Find bank based on clearing code
  const bank = React.useMemo(() => {
    const cleanValue = value?.replace(/\D/g, "")
    return (
      banks.find((bank) =>
        bank.clearingCodes.includes(cleanValue?.slice(0, 4)),
      ) || null
    )
  }, [value])

  return (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      startIcon={
        bank ? (
          <Image
            src={`/bank/${bank.identifier}.png`}
            alt={`${bank.name} logo`}
            width={30}
            height={30}
            className="object-contain"
          />
        ) : (
          <PiggyBank
            size="1rem"
            className="absolute left-2 top-1/2 -translate-y-1/2 transform"
          />
        )
      }
      description={bank?.name}
      value={value}
      onChange={(e) => {
        const value = e.target.value.replace(/\p{Letter}/gu, "")
        if (value.replace(/\D/g, "").length > 11) return
        onChange(value)
      }}
      onBlur={() => {
        onBlur()
        const cleanValue = value.replace(/\D/g, "")
        if (!cleanValue) return
        onChange(
          `${cleanValue.slice(0, 4)} ${cleanValue.slice(4, 6)} ${cleanValue.slice(6)}`,
        )
      }}
      onFocus={(e) => {
        const value = e.currentTarget.value
        onChange(value.replace(/\s/g, ""))
      }}
    />
  )
})

// Export the controlled version for use with React Hook Form
export function AccountInput({
  name,
  ...props
}: AccountInputBaseProps & { name: string }) {
  return (
    <Controller
      name={name}
      rules={{
        validate: (value) => {
          if (!value) return true
          const cleanValue = value.replace(/\D/g, "")
          return validateAccountNumber(cleanValue) || "Ugyldig kontonummer"
        },
      }}
      render={({ field, fieldState }) => (
        <AccountInputBase
          {...props}
          {...field}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}

export default AccountInput
