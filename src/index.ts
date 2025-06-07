import type { ProcessedFile } from './type'

export * from './type'

/**
 * 处理文件粘贴事件，具有健壮的错误处理、资源管理和灵活的配置。
 *
 * @template T - 处理文件的返回类型，可以是 'text'、'blob'、'arrayBuffer' 或 'formData'。
 * @param {object} option - filePaste 函数的配置选项。
 * @param {number} [option.maxSize] - 允许的最大文件大小（以字节为单位）。
 * @param {T} [option.returnType] - 处理文件的返回类型。
 * @param {string[]} [option.allowedTypes] - 允许的文件 MIME 类型数组。
 * @param {Function} [option.onComplete] - 所有文件处理完成时触发的回调。
 *   如果 returnType 是 'formData'，接收一个 FormData 对象。
 *   否则，接收一个处理后的文件对象数组。
 * @param {Function} [option.onError] - 文件处理过程中发生错误时触发的回调。
 *   接收一个包含文件和错误原因的对象。
 * @param {boolean} [option.debug] - 启用调试日志以跟踪文件处理进度。
 * @param {Function} [option.preProcess] - 在返回文件内容之前对其进行预处理的回调。
 *   接收文件和其内容，并返回处理后的内容。
 * @param {string|Function} [option.formDataKey] - 自定义将文件附加到 FormData 的键。
 *   可以是字符串或接收文件名和类型的函数。
 * @param {Function} [option.preProcessFile] - 在处理文件之前对其进行预处理的回调。
 *   接收文件并返回处理后的文件或 null（如果文件被过滤）。
 * @param {boolean} [option.splitFormData] - 控制是否分割 FormData 当 returnType 为 'formData' 有效。
 * @returns {Function} 清理函数，用于移除粘贴事件监听器并释放资源。
 */
export function filePaste<T extends 'text' | 'blob' | 'arrayBuffer' | 'formData' = 'blob'>(option: {
  maxSize?: number
  returnType?: T
  allowedTypes?: string[]
  onComplete?: T extends 'formData'
    ? (files: FormData | FormData[]) => void
    : (files: ProcessedFile[]) => void
  onError?: (error: { file: File, reason: string }) => void
  debug?: boolean
  preProcess?: (file: File, content: any) => any
  formDataKey?: string | ((fileName: string, fileType: string) => string)
  preProcessFile?: (file: File) => File
  splitFormData?: boolean // 新增属性，控制是否分割 FormData
}) {
  const returnType = option.returnType || 'blob'
  const processedFiles: ProcessedFile[] = []
  const formData = new FormData()
  const formDataList: FormData[] = [] // 用于存储多个 FormData
  const errorPromises: Promise<void>[] = []
  let processedCount = 0
  let totalFiles = 0

  const handleFileRead = (file: File, content: any): Blob | ArrayBuffer | string => {
    if (option.returnType === 'blob') {
      return new Blob([content], { type: file.type })
    }
    else if (option.returnType === 'arrayBuffer') {
      return content as ArrayBuffer
    }
    else {
      return content as string // 默认返回文本
    }
  }

  const appendToFormData = (file: File, targetFormData: FormData) => {
    const key
      = typeof option.formDataKey === 'function'
        ? option.formDataKey(file.name, file.type)
        : option.formDataKey || file.name
    targetFormData.append(key, file)
  }

  const addToProcessedFiles = (file: File, content: any) => {
    const processedContent = option.preProcess ? option.preProcess(file, content) : handleFileRead(file, content)
    const previewUrl = URL.createObjectURL(new Blob([content], { type: file.type }))
    processedFiles.push({
      name: file.name,
      size: file.size,
      type: file.type,
      content: processedContent,
      previewUrl,
      lastModified: file.lastModified, // 新增 lastModified 属性
    })
  }

  const handleError = (error: { file: File, reason: string }) => {
    const errorPromise = option.onError ? Promise.resolve(option.onError(error)) : Promise.resolve()
    errorPromises.push(errorPromise)
  }

  const handleFileProcessed = () => {
    processedCount++
    if (option.debug) {
      // eslint-disable-next-line no-console
      console.log(`Processed ${processedCount}/${totalFiles} files.`)
    }
    if (processedCount === totalFiles && option.onComplete) {
      if (returnType === 'formData') {
        if (option.splitFormData) {
          option.onComplete(formDataList as any)
        }
        else {
          option.onComplete(formData as any)
        }
      }
      else {
        option.onComplete(processedFiles as any)
      }
    }
  }

  const pasteHandler = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items)
      return

    const fileItems = Array.from(items).filter(item => item.kind === 'file')
    totalFiles = fileItems.length // 在 pasteHandler 中设置 totalFiles

    for (const item of fileItems) {
      const file = item.getAsFile()
      if (file) {
        if (option.allowedTypes && !option.allowedTypes.includes(file.type)) {
          handleError({ file, reason: `File type ${file.type} is not allowed.` })
          continue
        }
        if (option.maxSize && file.size > option.maxSize) {
          handleError({ file, reason: `File size ${file.size} exceeds the maximum size of ${option.maxSize} bytes.` })
          continue
        }

        // Apply preProcessFile hook
        const processedFile = option.preProcessFile ? option.preProcessFile(file) : file
        if (!processedFile) {
          handleError({ file, reason: 'File was filtered out by preProcessFile hook.' })
          continue
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result
          if (content) {
            if (returnType === 'formData') {
              if (option.splitFormData) {
                const singleFormData = new FormData()
                appendToFormData(processedFile, singleFormData)
                formDataList.push(singleFormData)
              }
              else {
                appendToFormData(processedFile, formData)
              }
            }
            else {
              addToProcessedFiles(processedFile, content)
            }
          }
          handleFileProcessed()
        }

        if (returnType === 'arrayBuffer') {
          reader.readAsArrayBuffer(processedFile)
        }
        else if (returnType === 'blob') {
          reader.readAsBinaryString(processedFile)
        }
        else if (returnType === 'formData') {
          if (option.splitFormData) {
            const singleFormData = new FormData()
            appendToFormData(processedFile, singleFormData)
            formDataList.push(singleFormData)
          }
          else {
            appendToFormData(processedFile, formData)
          }
          handleFileProcessed()
        }
        else {
          reader.readAsText(processedFile)
        }
      }
    }
  }

  document.addEventListener('paste', pasteHandler)

  return () => {
    // 移除事件监听器
    document.removeEventListener('paste', pasteHandler)

    // 释放所有临时 URL
    processedFiles.forEach((file) => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })
  }
}
