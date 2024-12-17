//*theme
import theme from 'theme'

export function getFullHeightSize(spacing = 2) {
  return `calc(100vh - ${theme.spacing(spacing)})`
}
