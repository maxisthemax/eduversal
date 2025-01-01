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

export function removeParamsFromString(
  url: string,
  paramsToRemove: string[]
): string {
  const [baseUrl, query] = url.split("?");

  // If there are no query parameters, return the original URL
  if (!query) {
    return url;
  }

  // Split the query string into individual parameters
  const queryArr = query.split("&");

  // Filter out the parameters to remove
  const filteredQueryArr = queryArr.filter((param) => {
    const [key] = param.split("=");
    return !paramsToRemove.includes(key);
  });

  // Join the filtered parameters back into a query string
  const filteredQuery = filteredQueryArr.join("&");

  // Return the updated URL string
  return filteredQuery ? `${baseUrl}?${filteredQuery}` : baseUrl;
}
