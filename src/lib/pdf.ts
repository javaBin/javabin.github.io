import { formSchema } from "@/lib/expense"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { z } from "zod"

export async function generatePDF({
  name,
  streetAddress,
  postalCode,
  city,
  country,
  bankAccount,
  email,
  date,
  expenses,
}: z.infer<typeof formSchema>) {
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
    { label: "Address:", value: `${streetAddress}, ${postalCode} ${city}, ${country}` },
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
  const tableTop = height - 275
  const rowHeight = 30
  const columns = {
    attachment: { x: 50, width: 50 },
    description: { x: 100, width: 200 },
    category: { x: 300, width: 200 },
    amount: { x: 500, width: 100 },
  }

  // Table headers
  Object.entries(columns).forEach(([key, { x }]) => {
    const text = key.charAt(0).toUpperCase() + key.slice(1)
    coverPage.drawText(key === "attachment" ? "Att#" : text, {
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
      maxWidth: columns.description.width,
    })

    coverPage.drawText(expense.category, {
      x: columns.category.x,
      y,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
      maxWidth: columns.category.width,
    })

    coverPage.drawText(expense.amount.toFixed(2), {
      x:
        columns.amount.x +
        regularFont.widthOfTextAtSize(expense.amount.toFixed(2), 10),
      y,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
      maxWidth: columns.amount.width,
    })

    if (expense.attachment) {
      coverPage.drawText(`${index + 1}`, {
        x: columns.attachment.x,
        y,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
        maxWidth: columns.attachment.width,
      })
    }

    totalAmount += expense.amount
  })

  // Adjust total position to align with new amount column
  coverPage.drawText("Total:", {
    x: columns.amount.x - 10,
    y: tableTop - (expenses.length + 1) * rowHeight,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })

  coverPage.drawText(totalAmount.toFixed(2), {
    x:
      columns.amount.x -
      10 +
      font.widthOfTextAtSize(totalAmount.toFixed(2), 12),
    y: tableTop - (expenses.length + 1) * rowHeight,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })

  // Add attachments with labels
  for (const [index, expense] of expenses.entries()) {
    let receiptBytes: ArrayBufferLike
    const attachment = expense.attachment
    // Convert images to PDF if needed
    if (attachment.type.startsWith("image/")) {
      const pdfBytes = await imageFileToPdf(attachment)
      receiptBytes = pdfBytes.buffer as ArrayBuffer
    } else {
      receiptBytes = (await attachment.arrayBuffer()) as ArrayBuffer
    }

    const receiptPdf = await PDFDocument.load(receiptBytes)
    const receiptPages = await pdfDoc.copyPages(
      receiptPdf,
      receiptPdf.getPageIndices(),
    )

    for (const page of receiptPages) {
      // Add a header to identify which expense this attachment belongs to
      const attachmentPage = pdfDoc.addPage(page)
      attachmentPage.drawText(
        `Attachment for expense #${index + 1}: ${expense.description}`,
        {
          x: 50,
          y: attachmentPage.getHeight() - (regularFont.heightAtSize(12) + 5),
          size: 12,
          font,
          color: rgb(0, 0, 0),
        },
      )
    }
  }

  return pdfDoc.save()
}

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
