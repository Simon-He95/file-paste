export interface ProcessedFile { name: string, size: number, type: string, content: any, previewUrl: string, lastModified: number, status: 'pending' | 'done', file: File }
