import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { EXPENSE_CATEGORIES } from "@/data/utleggsposter"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

type CategorySelectorProps = {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedItem?: string
  onItemChange?: (category: string, item: string) => void
  showOverrideBadge?: boolean
  globalCategoryItem?: string
}

export function CategorySelector({
  selectedCategory,
  onCategoryChange,
  selectedItem,
  onItemChange,
  showOverrideBadge,
  globalCategoryItem,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const uniqueCategories = Object.keys(
    EXPENSE_CATEGORIES.reduce(
      (acc, item) => {
        acc[item.category] = true
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={onCategoryChange} value={selectedCategory}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Alle</SelectItem>
          {uniqueCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {onItemChange && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-[300px] justify-between",
                !selectedItem && "text-muted-foreground",
              )}
              disabled={!selectedCategory}
            >
              {selectedItem
                ? EXPENSE_CATEGORIES.find(
                    (item) => item.fullName === selectedItem,
                  )?.fullName
                : "Select item"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search items..." />
              <CommandList>
                <CommandEmpty>No items found.</CommandEmpty>
                {selectedCategory === "alle" ? (
                  Object.entries(
                    EXPENSE_CATEGORIES.reduce(
                      (acc, item) => {
                        if (!acc[item.category]) {
                          acc[item.category] = []
                        }
                        acc[item.category]!.push(item)
                        return acc
                      },
                      {} as Record<string, typeof EXPENSE_CATEGORIES[number][]>,
                    ),
                  ).map(([groupCategory, items]) => (
                    <CommandGroup key={groupCategory} heading={groupCategory}>
                      {items.map((label) => (
                        <CommandItem
                          key={label.fullName}
                          value={label.fullName}
                          onSelect={(value) => {
                            onItemChange(selectedCategory, value)
                            setIsOpen(false)
                          }}
                        >
                          {label.fullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))
                ) : (
                  <CommandGroup>
                    {EXPENSE_CATEGORIES.filter(
                      (x) => x.category === selectedCategory,
                    ).map((label) => (
                      <CommandItem
                        key={label.fullName}
                        value={label.fullName}
                        onSelect={(value) => {
                          onItemChange(selectedCategory, value)
                          setIsOpen(false)
                        }}
                      >
                        {label.fullName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      {showOverrideBadge && selectedItem !== globalCategoryItem && (
        <Badge variant="outline" className="ml-2">
          Overridden category item
        </Badge>
      )}
    </div>
  )
}
