export type ScreenshotDirectoryDetection = {
  confidence: 'high' | 'medium' | 'low'
  directoryName: string
  imageCount: number
  matchedFileNames: string[]
  source: 'local-device'
}

type FileSystemDirectoryPicker = {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
}

type IterableDirectoryHandle = FileSystemDirectoryHandle & {
  entries: () => AsyncIterable<DirectoryEntry>
}

type DirectoryEntry = [
  string,
  FileSystemDirectoryHandle | FileSystemFileHandle,
]

const SCREENSHOT_DIRECTORY_KEY = 'ss-screenshot-directory'
const SCREENSHOT_FILE_PATTERN =
  /screenshot|screen shot|screen-capture|screen_capture|capture|snip/i
const IMAGE_FILE_PATTERN = /\.(png|jpe?g|webp|heic|gif|bmp)$/i

export function getStoredScreenshotDirectory():
  | ScreenshotDirectoryDetection
  | null {
  const rawDetection = window.localStorage.getItem(SCREENSHOT_DIRECTORY_KEY)

  if (!rawDetection) {
    return null
  }

  try {
    return JSON.parse(rawDetection) as ScreenshotDirectoryDetection
  } catch {
    window.localStorage.removeItem(SCREENSHOT_DIRECTORY_KEY)
    return null
  }
}

export function supportsDirectoryDetection() {
  return 'showDirectoryPicker' in window
}

export async function detectScreenshotDirectory(): Promise<ScreenshotDirectoryDetection> {
  const directoryPicker = window as Window & FileSystemDirectoryPicker

  if (!directoryPicker.showDirectoryPicker) {
    throw new Error('Directory detection needs a Chromium browser.')
  }

  const directoryHandle = await directoryPicker.showDirectoryPicker()
  const matchedFileNames = await collectScreenshotLikeFiles(directoryHandle)
  const directoryLooksRight = SCREENSHOT_FILE_PATTERN.test(directoryHandle.name)
  const detection: ScreenshotDirectoryDetection = {
    confidence: getConfidence(directoryLooksRight, matchedFileNames.length),
    directoryName: directoryHandle.name,
    imageCount: matchedFileNames.length,
    matchedFileNames: matchedFileNames.slice(0, 8),
    source: 'local-device',
  }

  window.localStorage.setItem(SCREENSHOT_DIRECTORY_KEY, JSON.stringify(detection))
  return detection
}

async function collectScreenshotLikeFiles(
  directoryHandle: FileSystemDirectoryHandle,
) {
  const matches: string[] = []
  const iterableDirectory = directoryHandle as IterableDirectoryHandle

  for await (const [name, handle] of iterableDirectory.entries()) {
    if (handle.kind !== 'file' || !IMAGE_FILE_PATTERN.test(name)) {
      continue
    }

    if (SCREENSHOT_FILE_PATTERN.test(name)) {
      matches.push(name)
    }
  }

  return matches
}

function getConfidence(directoryLooksRight: boolean, matchCount: number) {
  if (directoryLooksRight && matchCount > 0) {
    return 'high'
  }

  if (directoryLooksRight || matchCount >= 3) {
    return 'medium'
  }

  return 'low'
}
