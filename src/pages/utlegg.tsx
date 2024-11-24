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
import { Label } from "@/components/ui/label"
import { generatePDF } from "@/lib/pdf"
import { Trash2 } from "lucide-react"
import { CategorySelector } from "@/components/CategorySelector"
import { formSchema } from "@/lib/expense"
import AccountInput from "@/components/AccountInput"
import { FileUploader } from "@/components/FileUploader"
import { Toaster } from "sonner"

type FormValues = z.infer<typeof formSchema>

// BBAN: 8601 1117947
// IBAN: NO9386011117947

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
      streetAddress: "",
      postalCode: "",
      city: "",
      country: "Norway",
      bankAccount: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
      expenses: [
        {
          description: "",
          category: "",
          amount: 0,
          attachment: undefined as unknown as File,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const expenseReport = await generatePDF({
        name: data.name,
        streetAddress: data.streetAddress,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        bankAccount: data.bankAccount,
        email: data.email,
        date: data.date,
        expenses: data.expenses,
      })

      const blob = new Blob([expenseReport], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `expense-report-${data.date}.pdf`)
      // Create temporary link element to trigger download
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

  // Add this helper function for image resizing
  const resizeImage = async (
    file: File,
    options: { maxWidth: number; maxHeight: number; quality: number },
  ): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)

      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

        if (width > options.maxWidth) {
          height = (height * options.maxWidth) / width
          width = options.maxWidth
        }
        if (height > options.maxHeight) {
          width = (width * options.maxHeight) / height
          height = options.maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }))
            }
          },
          "image/jpeg",
          options.quality,
        )

        URL.revokeObjectURL(img.src)
      }
    })
  }

  return (
    <div className="container mx-auto mt-12 py-10">
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
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <Label>Gateveien</Label>
                <FormControl>
                  <Input placeholder="Gateveien 1, 0123 Oslo" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <Label>Postnummer</Label>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <Label>Poststed</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <Label>Land</Label>
                <FormControl>
                  <Input placeholder="Norway" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankAccount"
            render={({ field }) => (
              <FormItem>
                <Label>Kontonummer (IBAN eller BBAN)</Label>
                <FormControl>
                  <AccountInput {...field} />
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
                    attachment: new File([], ""),
                  })
                }
              >
                Add Expense
              </Button>
            </div>
            <div className="mb-6">
              <Label>Default Category for All Expenses</Label>
              <CategorySelector
                selectedCategory={globalCategoryGroup}
                onCategoryChange={setGlobalCategoryGroup}
                selectedItem={globalCategoryItem}
                onItemChange={(category, value) => {
                  setGlobalCategoryItem(value)
                }}
              />
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
                          onItemChange={(category, value) => {
                            field.onChange(value)
                            if (value === globalCategoryItem) {
                              setOverriddenCategoryItems((prev) => {
                                const next = { ...prev }
                                delete next[index]
                                return next
                              })
                            } else {
                              setOverriddenCategories((prev) => ({
                                ...prev,
                                [index]: category,
                              }))
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
                  name={`expenses.${index}.attachment`}
                  render={({ field }) => (
                    <FormItem>
                      <Label>Attachment</Label>
                      <FormControl>
                        <FileUploader
                          onUpload={async (files) => {
                            const file = files[0]
                            if (!file) {
                              field.onChange(undefined)
                              return
                            }

                            if (file.type.startsWith("image/")) {
                              // TODO: Figure out what the sweet spot is, when I tried to change it further,
                              // it didn't work on my taxi receipt..
                              const resizedFile = await resizeImage(file, {
                                maxWidth: 1800,
                                maxHeight: 1800,
                                quality: 0.8,
                              })
                              field.onChange(resizedFile)
                            } else {
                              field.onChange(file)
                            }
                          }}
                          onOCRComplete={(amount) => {
                            form.setValue(`expenses.${index}.amount`, amount)
                          }}
                          accept={{
                            "image/*": [],
                            "application/pdf": [],
                          }}
                          maxSize={10 * 1024 * 1024}
                          {...field}
                          value={field.value?.size > 0 ? [field.value] : []}
                          onValueChange={(files) => {
                            const file = files?.[0]
                            field.onChange(
                              file && file?.size > 0 ? file : undefined,
                            )
                          }}
                        />
                      </FormControl>
                      <FormMessage />
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
      <Toaster />
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
