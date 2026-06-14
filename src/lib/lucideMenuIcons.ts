const LUCIDE_ICON_SIZE = 20

const createLucideSvg = (
  inner: string,
  options: { fill?: string; size?: number } = {}
): string => {
  const size = options.size ?? LUCIDE_ICON_SIZE
  const fill = options.fill ?? "none"

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
}

const BOOKMARK_PATH =
  '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>'

const FOLDER_PLUS_PATHS =
  '<path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'

export const getBookmarkMenuIconSvg = (bookmarked: boolean): string =>
  createLucideSvg(BOOKMARK_PATH, {
    fill: bookmarked ? "currentColor" : "none"
  })

export const getFolderMenuIconSvg = (inFolder: boolean): string =>
  createLucideSvg(FOLDER_PLUS_PATHS, {
    fill: inFolder ? "currentColor" : "none"
  })

export const FOLDER_PLUS_MENU_ICON_SVG = getFolderMenuIconSvg(false)

export const getBookmarkMenuLabel = (bookmarked: boolean): string =>
  bookmarked ? "Remove Bookmark" : "Bookmark"

export const ADD_TO_FOLDER_MENU_LABEL = "Add to folder"
