//*lodash
import replace from "lodash/replace";

//*theme
import theme from "theme";

export function getFullHeightSize(spacing = 2) {
  return `calc(100vh - ${theme.spacing(spacing)})`;
}

export function replaceStringAll(
  content: string,
  oldContent: string,
  newContent: string
) {
  return replace(content, new RegExp(oldContent, "g"), newContent);
}
