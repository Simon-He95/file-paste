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
 * @param {Function} [option.onProgress] - 文件处理进度更新回调。
 *   接收进度信息对象，包含以下字段：
 *   - `processedCount`：已处理的文件数量。
 *   - `totalFiles`：总文件数量。
 *   - `processedFiles`：当前已处理的文件列表。
 *   - `done`：是否所有文件都已处理完成。
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
  onProgress?: (info: {
    processedCount: number
    totalFiles: number
    processedFiles: ProcessedFile[]
    done: boolean
  }) => void
  preProcessFile?: (file: File) => File
  splitFormData?: boolean
}) {
  const returnType = option.returnType || 'blob'
  let processedFiles: ProcessedFile[] = [] // 每次粘贴事件独立的 processedFiles
  let processedCount = 0
  let totalFiles = 0
  const formData = new FormData()
  const formDataList: FormData[] = []
  const pasteHandler = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items)
      return

    const handleFileProcessed = async () => {
      processedCount++
      if (option.debug) {
        // eslint-disable-next-line no-console
        console.log(`Processed ${processedCount}/${totalFiles} files.`)
      }

      // 等待 onProgress 的异步操作完成
      if (option.onProgress) {
        const progressInfo = {
          processedCount,
          totalFiles,
          processedFiles,
          done: processedCount === totalFiles,
        }
        if (option.onProgress.constructor.name === 'AsyncFunction') {
          await option.onProgress(progressInfo)
        }
        else {
          option.onProgress(progressInfo)
        }
      }

      // 检查是否所有文件都已处理完成
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

    const removeFileHelper = (processedFile: ProcessedFile) => {
      if (processedFile.isRemoved) {
        if (option.debug) {
          console.warn(`File ${processedFile.name} is already removed.`)
        }
        return
      }
      if (processedFile.previewUrl) {
        URL.revokeObjectURL(processedFile.previewUrl)
      }
      processedFile.isRemoved = true
      totalFiles--
      processedCount--
      option.onProgress?.({
        processedCount,
        totalFiles,
        processedFiles: processedFiles.map((file) => {
          const isRemoved = file.id === processedFile.id ? true : file.isRemoved
          file.isRemoved = isRemoved
          return { ...file, status: file?.status || 'pending' }
        }),
        done: processedCount === totalFiles,
      })
      // 将已删除的文件从 processedFiles 中移除
      processedFiles = processedFiles.filter(file => file.id !== processedFile.id)
    }

    const addToProcessedFiles = (processedFile: ProcessedFile, content: any) => {
      const processedContent = option.preProcess
        ? option.preProcess(processedFile.file, content)
        : content
      const updatedFile: ProcessedFile = {
        ...processedFile,
        content: processedContent,
        status: 'done',
        removeFile: () => {
          removeFileHelper(updatedFile)
        },
      }
      // 更新 processedFiles 数组中的文件状态
      const index = processedFiles.findIndex(file => file.id === updatedFile.id)

      if (index !== -1) {
        processedFiles[index] = updatedFile
      }
      else {
        // 已经被 remove
      }
    }

    const needProcessedFiles = Array.from(items).map((item) => {
      const file = item.getAsFile()
      if (!file)
        return null
      if (option.allowedTypes && !option.allowedTypes.includes(file.type)) {
        option.onError?.({ file, reason: `File type ${file.type} is not allowed.` })
        return null
      }
      if (option.maxSize && file.size > option.maxSize) {
        option.onError?.({ file, reason: `File size ${file.size} exceeds the maximum size of ${option.maxSize} bytes.` })
        return null
      }

      const processedFile = option.preProcessFile ? option.preProcessFile(file) : file
      if (!processedFile) {
        option.onError?.({ file, reason: 'File was filtered out by preProcessFile hook.' })
        return null
      }
      const previewUrl = URL.createObjectURL(processedFile)
      const result: ProcessedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: processedFile.name,
        size: processedFile.size,
        type: processedFile.type,
        content: null,
        previewUrl,
        lastModified: processedFile.lastModified,
        status: 'pending',
        isRemoved: false,
        removeFile: () => {
          removeFileHelper(result)
        },
        file: processedFile,
      }
      return result
    }).filter(Boolean) as ProcessedFile[]
    processedFiles.push(...needProcessedFiles)

    totalFiles = processedFiles.length
    if (totalFiles === 0) {
      if (option.debug) {
        console.warn('No valid files found in the paste event.')
      }
      return
    }

    option.onProgress?.({
      processedCount,
      totalFiles,
      processedFiles,
      done: false,
    })

    needProcessedFiles.forEach((processedFile) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (processedFile.isRemoved) {
          if (option.debug) {
            console.warn(`File ${processedFile.name} is already removed.`)
          }
          return
        }
        if (content) {
          if (returnType === 'formData') {
            if (option.splitFormData) {
              const singleFormData = new FormData()
              singleFormData.append(processedFile.name, processedFile.file)
              formDataList.push(singleFormData)
            }
            else {
              formData.append(processedFile.name, processedFile.file)
            }
          }
          else {
            addToProcessedFiles(processedFile, content)
          }
        }
        handleFileProcessed()
      }

      if (returnType === 'arrayBuffer') {
        reader.readAsArrayBuffer(processedFile.file)
      }
      else if (returnType === 'blob') {
        reader.readAsBinaryString(processedFile.file)
      }
      else if (returnType === 'formData') {
        addToProcessedFiles(processedFile, formData)
        handleFileProcessed()
      }
      else {
        reader.readAsText(processedFile.file)
      }
    })
  }

  document.addEventListener('paste', pasteHandler)

  return () => {
    document.removeEventListener('paste', pasteHandler)
  }
}
