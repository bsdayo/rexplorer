import { icons as materialIconThemeIcons } from '@iconify-json/material-icon-theme'
import { getIconData, IconifyIcon } from '@iconify/utils'

// https://icones.js.org/collection/material-icon-theme
const FILE_ICONS: [RegExp, IconifyIcon | null][] = [
  // Specific filenames
  [/^README/i, i('readme')],
  [/^LICENSE/i, i('certificate')],
  [/^CHANGELOG/i, i('changelog')],

  // File extensions
  [/\.(?:jpe?g|a?png|webp|svg|gif|bmp|ico|avif|tiff?)$/i, i('image')],
  [/\.(?:mp3|wav|flac|aac|midi?|og[ag]|opus|weba)$/i, i('audio')],
  [/\.(?:mp4|mpeg|mkv|mov|avi|ogv|ts|webm)$/i, i('video')],
  [/\.(?:ass|srt)$/i, i('subtitles')],
  [/\.(?:zip|7z|rar|t?gz|t?xz|t?bz|t?zst)$/i, i('zip')],
  [/\.(?:xml|nfo)$/i, i('xml')],
  [/\.(?:ya?ml)$/i, i('yaml')],
  [/\.(?:md|markdown)$/i, i('markdown')],
  [/\.(?:docx?)$/i, i('word')],
  [/\.(?:xlsx?)$/i, i('table')],
  [/\.(?:pptx?)$/i, i('powerpoint')],
  [/\.(?:db)$/i, i('database')],
]
const FILE_FALLBACK_ICON = i('document')!

function i(name: string) {
  return getIconData(materialIconThemeIcons, name)
}

export function mapFileIcon(filename: string) {
  for (const [pattern, icon] of FILE_ICONS) {
    if (pattern.test(filename)) {
      return icon ?? FILE_FALLBACK_ICON
    }
  }
  return FILE_FALLBACK_ICON
}
