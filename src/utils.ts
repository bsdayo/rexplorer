import { getIconData, replaceIDs, iconToSVG, iconToHTML } from '@iconify/utils'

export function humanizeBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB']
  let i = -1
  do {
    bytes /= 1024
    i++
  } while (bytes >= 1024 && i < units.length - 1)
  return bytes.toFixed(1) + ' ' + units[i]
}

export function generateIconSVG(icons: Parameters<typeof getIconData>[0], iconName: string) {
  const iconData = getIconData(icons, iconName)
  if (!iconData) return null
  const renderData = iconToSVG(iconData)
  const svg = iconToHTML(replaceIDs(renderData.body), renderData.attributes)
  return svg
}
