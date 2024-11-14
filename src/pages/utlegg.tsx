import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import nextI18nConfig from "../../next-i18next.config.mjs"
import { PDFDocument } from "pdf-lib"
import { Label } from "@/components/ui/label"
import { generatePDF } from "@/lib/pdf"
import { Tags, Calendar, Trash, Trash2, User } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { EXPENSE_CATEGORIES } from "@/data/utleggsposter"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CategorySelector } from "@/components/category-selector"

const expenseItemSchema = z.object({
  description: z.string().min(2, "Description required"),
  category: z.string().min(1, "Category required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  attachments: z
    .custom<FileList>()
    .transform((files) => Array.from(files))
    .refine((files) => files.length > 0, "At least one file is required"),
})

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  bankAccount: z.string(),
  email: z.string().email("Please enter a valid email address"),
  date: z.string().min(1, "Please select a date"),
  expenses: z
    .array(expenseItemSchema)
    .min(1, "At least one expense is required"),
})

// Infer TypeScript type from the schema
type FormValues = z.infer<typeof formSchema>

export default function ExpensePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [globalCategoryGroup, setGlobalCategoryGroup] = useState<string>("alle")
  const [globalCategoryItem, setGlobalCategoryItem] = useState<string>("")
  const [overriddenCategories, setOverriddenCategories] = useState<
    Record<number, string>
  >({})
  const [overriddenCategoryItems, setOverriddenCategoryItems] = useState<
    Record<number, string>
  >({})

  // Initialize react-hook-form with zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      bankAccount: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
      expenses: [{ description: "", category: "", amount: 0, attachments: [] }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  })

  // Track which combobox is currently open (if any)
  const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(
    null,
  )

  // Add helper function to convert image to PDF
  const imageFileToPdf = async (file: File): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size in points

    const imageBytes = await file.arrayBuffer()
    let image

    if (file.type === "image/jpeg") {
      image = await pdfDoc.embedJpg(imageBytes)
    } else if (file.type === "image/png") {
      image = await pdfDoc.embedPng(imageBytes)
    } else {
      throw new Error("Unsupported image format")
    }

    // Calculate dimensions to fit the page while maintaining aspect ratio
    const { width, height } = image.scale(1)
    const aspectRatio = width / height
    const maxWidth = 500 // Leave some margin
    const maxHeight = 747 // Leave some margin
    let scaledWidth = width
    let scaledHeight = height

    if (width > maxWidth || height > maxHeight) {
      if (width / maxWidth > height / maxHeight) {
        scaledWidth = maxWidth
        scaledHeight = maxWidth / aspectRatio
      } else {
        scaledHeight = maxHeight
        scaledWidth = maxHeight * aspectRatio
      }
    }

    page.drawImage(image, {
      x: (page.getWidth() - scaledWidth) / 2,
      y: (page.getHeight() - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    })

    return await pdfDoc.save()
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const pdfBytes = await generatePDF({
        name: data.name,
        address: data.address,
        bankAccount: data.bankAccount,
        email: data.email,
        date: data.date,
        expenses: data.expenses,
      })

      // Create and download the PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `expense-report-${data.date}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to get category for a specific expense index
  const getCategoryForExpense = (index: number) => {
    return overriddenCategories[index] || globalCategoryGroup
  }

  // Helper to get category item for a specific expense index
  const getCategoryItemForExpense = (index: number) => {
    return overriddenCategoryItems[index] || globalCategoryItem
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Label>Default Category for All Expenses</Label>
        <CategorySelector
          selectedCategory={globalCategoryGroup}
          onCategoryChange={setGlobalCategoryGroup}
          selectedItem={globalCategoryItem}
          onItemChange={setGlobalCategoryItem}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label>Navn</Label>
                <FormControl>
                  <Input placeholder="Ola Nordmann" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <Label>Adresse</Label>
                <FormControl>
                  <Input placeholder="Gateveien 1, 0123 Oslo" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankAccount"
            render={({ field }) => (
              <FormItem>
                <Label>Kontonummer (IBAN)</Label>
                <FormControl>
                  <Input
                    placeholder="NO## #### #### ###"
                    {...field}
                    onChange={(e) => {
                      // Format input as user types
                      let value = e.target.value.replace(/[^\dNO]/g, "")
                      if (value.startsWith("NO")) {
                        value = value.replace(/(\d{4})/g, "$1 ").trim()
                      }
                      field.onChange(value)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label>E-post</Label>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ola.nordmann@example.com"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <Label>Dato</Label>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Expenses</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    description: "",
                    category: "",
                    amount: 0,
                    attachments: [],
                  })
                }
              >
                Add Expense
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`expenses.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Description</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`expenses.${index}.category`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Category</FormLabel>
                      <div className="space-y-2">
                        <CategorySelector
                          selectedCategory={getCategoryForExpense(index)}
                          onCategoryChange={(category) => {
                            if (category === globalCategoryGroup) {
                              setOverriddenCategories((prev) => {
                                const next = { ...prev }
                                delete next[index]
                                return next
                              })
                            } else {
                              setOverriddenCategories((prev) => ({
                                ...prev,
                                [index]: category,
                              }))
                            }
                          }}
                          selectedItem={getCategoryItemForExpense(index)}
                          onItemChange={(value) => {
                            field.onChange(value)
                            if (value === globalCategoryItem) {
                              setOverriddenCategoryItems((prev) => {
                                const next = { ...prev }
                                delete next[index]
                                return next
                              })
                            } else {
                              setOverriddenCategoryItems((prev) => ({
                                ...prev,
                                [index]: value,
                              }))
                            }
                          }}
                          showOverrideBadge={
                            overriddenCategories[index] !== undefined ||
                            overriddenCategoryItems[index] !== undefined
                          }
                          globalCategoryItem={globalCategoryItem}
                        />
                        {(overriddenCategories[index] !== undefined ||
                          overriddenCategoryItems[index] !== undefined) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setOverriddenCategories((prev) => {
                                const next = { ...prev }
                                delete next[index]
                                return next
                              })
                              setOverriddenCategoryItems((prev) => {
                                const next = { ...prev }
                                delete next[index]
                                return next
                              })
                              field.onChange(globalCategoryItem)
                            }}
                          >
                            Reset to Global Category
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`expenses.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Amount (NOK)</Label>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`expenses.${index}.attachments`}
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <Label>Attachments</Label>
                      <FormControl>
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          multiple
                          onChange={(e) => onChange(e.target.files)}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Generate Report"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? "no",
        ["common"],
        nextI18nConfig,
        ["no", "en"],
      )),
    },
  }
}
