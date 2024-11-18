import { EXPENSE_CATEGORIES } from "@/data/utleggsposter"
import { z } from "zod"

export const expenseItemSchema = z.object({
  description: z.string().min(2, "Description required"),
  category: z
    .string()
    .refine((val) => EXPENSE_CATEGORIES.some((cat) => cat.fullName === val), {
      message: "Category required",
    }),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  attachment: z
    .custom<File>((file) => file instanceof File, "File is required")
    .refine((file) => file.size > 0, "File is required")
    .default(new File([], "")),
})

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required").default("Norway"),
  bankAccount: z
    .string()
    .refine((str) => validateAccountNumber(str), "Invalid account number"),
  email: z.string().email("Please enter a valid email address"),
  date: z.string().min(1, "Please select a date"),
  expenses: z
    .array(expenseItemSchema)
    .min(1, "At least one expense is required"),
})

export const validateAccountNumber = (accountNumber: string) => {
  const cleanAccountNumber = accountNumber.replace(/\D/g, "")
  if (cleanAccountNumber.length !== 11) return false
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = cleanAccountNumber
    .slice(0, 10)
    .split("")
    .map((c) => parseInt(c))
    .reduce((acc, digit, index) => acc + digit * (weights?.[index] ?? 0), 0)
  const checkDigit = (11 - (sum % 11)) % 11
  return checkDigit === parseInt(cleanAccountNumber.charAt(10))
}
