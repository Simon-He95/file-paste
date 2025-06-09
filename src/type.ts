export interface ProcessedFile {
  /**
   * 文件的唯一标识符
   */
  id: string
  /**
   * 文件名
   */
  name: string

  /**
   * 文件大小（以字节为单位）
   */
  size: number

  /**
   * 文件的 MIME 类型
   */
  type: string

  /**
   * 文件内容，根据配置的返回类型可能是 Blob、ArrayBuffer 或字符串
   */
  content: any

  /**
   * 文件的预览 URL，用于在浏览器中预览文件
   */
  previewUrl: string

  /**
   * 文件的最后修改时间（时间戳）
   */
  lastModified: number

  /**
   * 文件的处理状态，可能是 'pending' 或 'done'
   */
  status: 'pending' | 'done'

  /**
   * 原始的 File 对象
   */
  file: File

  /**
   * 文件是否已被移除
   */
  isRemoved: boolean

  /**
   * 移除文件的方法，用于释放资源并更新状态
   */
  removeFile?: () => void
}
