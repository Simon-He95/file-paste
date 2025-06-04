# file-paste

file-paste 是一个开箱即用的工具，用于捕获粘贴事件并对粘贴的文件或图片进行处理。它支持将文件转换为多种格式（如 `FormData` 或 `Buffer`），并提供详细的文件信息，包括文件名、文件类型以及可预览的 `Blob` URL。该工具还支持同时处理多个粘贴的文件。

## 功能特点

- **捕获粘贴事件**：自动检测应用中的粘贴操作。
- **文件格式转换**：将粘贴的文件转换为 `FormData`、`Blob`、`ArrayBuffer` 或文本格式。
- **详细的文件信息**：提供文件名、类型以及可预览的 `Blob` URL。
- **多文件支持**：支持一次性处理多个粘贴的文件。
- **灵活的配置**：支持文件大小限制、文件类型过滤、自定义预处理逻辑等。
- **文件预处理钩子**：支持在文件处理前进行过滤或压缩。
- **错误处理**：提供回调函数处理文件处理过程中的错误。
- **调试模式**：可启用调试日志，跟踪文件处理进度。

## 安装

```bash
pnpm add file-paste
```

## 使用方法

以下是一个简单的使用示例：

```typescript
import { filePaste } from 'file-paste'

const cleanup = filePaste({
  maxSize: 5 * 1024 * 1024, // 最大文件大小为 5MB
  returnType: 'formData',
  allowedTypes: ['image/png', 'image/jpeg'],
  onComplete: (files) => {
    console.log('处理完成的文件：', files)
  },
  onError: (error) => {
    console.error('文件处理错误：', error)
  },
  debug: true,
  preProcess: (file, content) => {
    console.log('预处理文件内容：', file.name)
    return content
  },
  preProcessFile: (file) => {
    console.log('预处理文件：', file.name)
    // 过滤掉超过 1MB 的文件
    if (file.size > 1 * 1024 * 1024)
      return null
    return file
  },
  formDataKey: (fileName, fileType) => `${fileName}-${fileType}`,
})

// 调用 cleanup() 以移除事件监听器并释放资源
```

## 配置选项

`filePaste` 函数支持以下配置选项：

- `maxSize`：允许的最大文件大小（以字节为单位）。
- `returnType`：处理文件的返回类型，可选值为 `'text'`、`'blob'`、`'arrayBuffer'` 或 `'formData'`，默认值为 `'blob'`。
- `allowedTypes`：允许的文件 MIME 类型数组。
- `onComplete`：所有文件处理完成时触发的回调函数。
- `onError`：文件处理过程中发生错误时触发的回调函数。
- `debug`：是否启用调试日志。
- `preProcess`：在返回文件内容之前对其进行预处理的回调函数。
- `preProcessFile`：在文件处理前对文件进行过滤或压缩的回调函数，返回 `null` 时文件会被过滤掉。
- `formDataKey`：自定义将文件附加到 `FormData` 的键，可以是字符串或函数。

## 清理资源

`filePaste` 函数返回一个清理函数，用于移除粘贴事件监听器并释放所有临时 URL。

```typescript
const cleanup = filePaste({ })

// 在不需要时调用 cleanup
cleanup()
```
