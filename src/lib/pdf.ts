import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

type ExpenseItem = {
  description: string
  category: string
  amount: number
  attachments: File[]
}

type GeneratePDFProps = {
  name: string
  address: string
  bankAccount: string
  email: string
  date: string
  expenses: ExpenseItem[]
}

export async function generatePDF({
  name,
  address,
  bankAccount,
  email,
  date,
  expenses,
}: GeneratePDFProps): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const coverPage = pdfDoc.addPage()
  const { width, height } = coverPage.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Title
  coverPage.drawText("Expense Report", {
    x: 50,
    y: height - 50,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  })

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("no-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Personal information
  const infoLines = [
    { label: "Name:", value: name },
    { label: "Address:", value: address },
    { label: "Bank Account:", value: bankAccount },
    { label: "Email:", value: email },
    { label: "Date:", value: formattedDate },
  ]

  infoLines.forEach((line, index) => {
    // Draw label
    coverPage.drawText(line.label, {
      x: 50,
      y: height - 120 - index * 30,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })

    // Draw value
    coverPage.drawText(line.value, {
      x: 150,
      y: height - 120 - index * 30,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    })
  })

  // Add expense items table
  const tableTop = height - 250
  const rowHeight = 30
  const columns = {
    description: { x: 50, width: 200 },
    category: { x: 260, width: 150 },
    amount: { x: 420, width: 100 },
  }

  // Table headers
  Object.entries(columns).forEach(([key, { x }]) => {
    coverPage.drawText(key.charAt(0).toUpperCase() + key.slice(1), {
      x,
      y: tableTop,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })
  })

  // Table rows
  let totalAmount = 0
  expenses.forEach((expense, index) => {
    const y = tableTop - (index + 1) * rowHeight
    
    coverPage.drawText(expense.description, {
      x: columns.description.x,
      y,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    coverPage.drawText(expense.category, {
      x: columns.category.x,
      y,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    coverPage.drawText(expense.amount.toFixed(2), {
      x: columns.amount.x,
      y,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    totalAmount += expense.amount
  })

  // Draw total
  coverPage.drawText("Total:", {
    x: columns.category.x,
    y: tableTop - (expenses.length + 1) * rowHeight,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })

  coverPage.drawText(totalAmount.toFixed(2), {
    x: columns.amount.x,
    y: tableTop - (expenses.length + 1) * rowHeight,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })

  // Add attachments with labels
  for (const expense of expenses) {
    for (const file of expense.attachments) {
      const receiptBytes = await file.arrayBuffer()
      const receiptPdf = await PDFDocument.load(receiptBytes)
      const receiptPages = await pdfDoc.copyPages(
        receiptPdf,
        receiptPdf.getPageIndices(),
      )

      for (const page of receiptPages) {
        // Add a header to identify which expense this attachment belongs to
        const attachmentPage = pdfDoc.addPage(page)
        attachmentPage.drawText(`Attachment for: ${expense.description}`, {
          x: 50,
          y: attachmentPage.getHeight() - 50,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        })
      }
    }
  }

  return pdfDoc.save()
}

// Export these types for use in the form
export type { ExpenseItem }
