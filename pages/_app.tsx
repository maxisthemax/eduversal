import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

//*components
import LayoutWrapper from "@/components/Layouts/LayoutWrapper";
import { CustomDialog } from "@/components/Dialog";

//*mui
import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { ThemeProvider } from "@mui/material/styles";

//*theme
import theme from "theme";
import themeuser from "theme_user";

//*css
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const pathName = usePathname().split("/")[1];

  return (
    <QueryClientProvider client={queryClient}>
      <AppCacheProvider {...pageProps}>
        <ThemeProvider theme={pathName === "admin" ? theme : themeuser}>
          <CustomDialog />
          <ToastContainer
            limit={3}
            position="bottom-left"
            pauseOnFocusLoss={true}
          />
          <LayoutWrapper>
            <Component {...pageProps} />
          </LayoutWrapper>
        </ThemeProvider>
      </AppCacheProvider>
    </QueryClientProvider>
  );
}
