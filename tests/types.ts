declare module '../src/index.js' {
  interface ErrorTypes {
    'HttpError': {method: 'GET' | 'POST', url: string, status: number}
    'JsonError': {text: string}
    'FileError': {operation: 'read' | 'write', filePath: string, error: Error}
  }
}

export {}