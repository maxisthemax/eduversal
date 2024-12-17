import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";

//*theme
import theme from "theme";

//*css
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppCacheProvider {...pageProps}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </AppCacheProvider>
  );
}
