"use client"

import * as React from "react"
import Image from "next/image"
import { FileText, Upload, X } from "lucide-react"
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { cn, formatBytes } from "@/lib/utils"
import { useControllableState } from "@/hooks/use-controllable-state"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createWorker } from "tesseract.js"
import { Wand2 } from "lucide-react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[]

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps["accept"]

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps["maxSize"]

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps["maxFiles"]

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean

  /**
   * Callback when OCR processes an amount
   * @type (amount: number, index: number) => void
   */
  onOCRComplete?: (amount: number) => void
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    onOCRComplete,
    progresses,
    accept = {
      "image/*": [],
    },
    maxSize = 1024 * 1024 * 2,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  })

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time")
        return
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`)
        return
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      )

      const updatedFiles = files ? [...files, ...newFiles] : newFiles

      setFiles(updatedFiles)

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`)
        })
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFileCount
      ) {
        const target =
          updatedFiles.length > 1 ? `${updatedFiles.length} files` : `file`

        try {
          await toast.promise(onUpload(updatedFiles), {
            loading: `Uploading ${target}...`,
            success: `${target} uploaded`,
            error: `Failed to upload ${target}`,
          })
        } catch (error) {
          console.error("Upload failed:", error)
        }
      }
    },
    [files, maxFileCount, multiple, onUpload, setFiles],
  )

  function onRemove(index: number) {
    if (!files) return

    const newFiles = files.filter((_, i) => i !== index)

    setFiles(newFiles)
    onValueChange?.(newFiles)
  }

  React.useEffect(() => {
    return () => {
      files?.forEach((file) => {
        if ("preview" in file) {
          URL.revokeObjectURL(file.preview as string)
        }
      })
    }
  }, [files])

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      {!isDisabled && (
        <Dropzone
          onDrop={onDrop}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFileCount}
          multiple={maxFileCount > 1 || multiple}
          disabled={isDisabled}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={cn(
                "border-muted-foreground/25 hover:bg-muted/25 group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed px-5 py-2.5 text-center transition",
                "ring-offset-background focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isDragActive && "border-muted-foreground/50",
                isDisabled && "pointer-events-none opacity-60",
                className,
              )}
              {...dropzoneProps}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="text-muted-foreground size-7"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    Drop the files here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="text-muted-foreground size-7"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col gap-px">
                    <p className="text-muted-foreground font-medium">
                      Drag {`'n'`} drop files here, or click to select files
                    </p>
                    <p className="text-muted-foreground/70 text-sm">
                      You can upload
                      {maxFileCount > 1
                        ? ` ${maxFileCount === Infinity ? "multiple" : maxFileCount}
                      files (up to ${formatBytes(maxSize)} each)`
                        : ` a file with ${formatBytes(maxSize)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Dropzone>
      )}
      {files?.length ? (
        <ScrollArea className="h-fit w-full px-3">
          <div className="flex max-h-48 flex-col gap-4">
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                onOCRComplete={onOCRComplete}
                progress={progresses?.[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  )
}

interface FileCardProps {
  file: File
  onRemove: () => void
  onOCRComplete?: (amount: number) => void
  progress?: number
}

function FileCard({ file, progress, onRemove, onOCRComplete }: FileCardProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  const extractHighestAmount = (text: string): number | null => {
    const numbers = text.match(/\d+[.,]+\d{1,2}/g)
    if (!numbers) return null
    return Math.max(...numbers.map((n) => parseFloat(n.replace(",", "."))))
  }

  const processReceiptOCR = async () => {
    if (!file.type.startsWith("image/") || !onOCRComplete) return

    setIsProcessing(true)
    const toastId = toast.loading("Processing receipt with OCR...")

    try {
      const worker = await createWorker(["eng", "nor"])
      const imageUrl = URL.createObjectURL(file)

      const {
        data: { text },
      } = await worker.recognize(imageUrl)
      console.log(text)
      const amount = extractHighestAmount(text)

      URL.revokeObjectURL(imageUrl)
      await worker.terminate()

      if (amount) {
        toast.success(`Found amount: ${amount} NOK`, {
          id: toastId,
          action: {
            label: "Use this amount",
            onClick: () => onOCRComplete(amount),
          },
          cancel: {
            label: "Cancel",
            onClick: () => toast.dismiss(toastId),
          },
          duration: Infinity,
        })
      } else {
        toast.error("Could not find any amount in the receipt", {
          id: toastId,
        })
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
      toast.error("Failed to process receipt", {
        id: toastId,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {file.type.startsWith("image/") || file.type === "application/pdf" ? (
          <FilePreview file={file} />
        ) : null}
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-px">
            <p className="text-foreground/80 line-clamp-1 text-sm font-medium">
              {file.name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-xs">
                {formatBytes(file.size)}
              </p>
              {onOCRComplete && file.type.startsWith("image/") && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={isProcessing}
                  onClick={processReceiptOCR}
                >
                  <Wand2 className="mr-1 size-3" />
                  Scan for amount
                </Button>
              )}
            </div>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={onRemove}
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  )
}

interface FilePreviewProps {
  file: File
}

function FilePreview({ file }: FilePreviewProps) {
  const [preview, setPreview] = React.useState<string>("")
  const [isPdfOpen, setIsPdfOpen] = React.useState(false)
  const [isImageOpen, setIsImageOpen] = React.useState(false)

  React.useEffect(() => {
    // Create preview URL when component mounts
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Cleanup preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (file.type.startsWith("image/")) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsImageOpen(true)}
          className="relative aspect-square size-12 shrink-0 overflow-hidden rounded-md border"
        >
          <Image
            src={preview}
            alt={file.name}
            width={48}
            height={48}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </button>

        <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{file.name}</DialogTitle>
            </DialogHeader>
            <div className="relative flex h-[75vh] w-full items-center justify-center">
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit
                wheel={{ wheelDisabled: false }}
                doubleClick={{
                  mode: "toggle",
                  step: 2,
                }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent
                      wrapperClass="!w-full"
                      contentClass="!w-full flex items-center justify-center"
                    >
                      <Image
                        src={preview}
                        alt={file.name}
                        width={1200}
                        height={800}
                        className="max-h-[70vh] w-auto object-contain"
                        loading="lazy"
                        unoptimized
                      />
                    </TransformComponent>
                    <div className="bg-background/80 absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-lg px-4 py-2 backdrop-blur">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => zoomOut()}
                      >
                        <ZoomOut className="size-4" />
                        <span className="sr-only">Zoom out</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => resetTransform()}
                      >
                        <Image
                          src={preview}
                          alt={file.name}
                          width={16}
                          height={16}
                          className="size-4 object-cover"
                        />
                        <span className="sr-only">Reset zoom</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => zoomIn()}
                      >
                        <ZoomIn className="size-4" />
                        <span className="sr-only">Zoom in</span>
                      </Button>
                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (file.type === "application/pdf") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsPdfOpen(true)}
          className="bg-muted relative aspect-square size-12 shrink-0 overflow-hidden rounded-md border"
        >
          <FileText
            className="text-muted-foreground absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
        </button>

        <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{file.name}</DialogTitle>
            </DialogHeader>
            <div className="h-[75vh] w-full">
              <iframe
                src={preview}
                title={file.name}
                className="h-full w-full"
                style={{ border: "none" }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <FileText className="text-muted-foreground size-10" aria-hidden="true" />
  )
}
