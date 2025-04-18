import Head from "next/head";
import { usePathname } from "next/navigation";

//*lodash
import find from "lodash/find";

//*components
import FlexBox from "./FlexBox";

//*mui
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import { SxProps, Theme } from "@mui/material";

function Page({
  children,
  leftButton,
  rightButton,
  links,
  title,
  subtitle,
  isLoading = false,
  sx,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  leftButton?: React.ReactNode[];
  rightButton?: React.ReactNode[];
  links?: { href: string; title: string }[];
  isLoading?: boolean;
  sx?: SxProps<Theme>;
}) {
  const pathName = usePathname();
  const findCurrentPathname = find(links, { href: pathName });

  return (
    <Box sx={{ pl: 2, pr: 2, pt: 1, pb: 1, background: "#F8F8F8", ...sx }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ width: "100%", alignItems: "center" }}
      >
        <Breadcrumbs separator=">" sx={{ color: "black" }}>
          {links &&
            links.length > 0 &&
            links.map(({ href, title }) => {
              if (findCurrentPathname?.href === href) {
                return (
                  <Typography variant="body1" key={href} color="inherit">
                    {title}
                  </Typography>
                );
              } else {
                return (
                  <Link
                    key={href}
                    href={href}
                    underline="hover"
                    color="inherit"
                  >
                    {title}
                  </Link>
                );
              }
            })}
        </Breadcrumbs>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{ width: "100%", pb: 1, alignItems: "center" }}
      >
        <Stack direction={"column"}>
          {title && (
            <Typography sx={{ fontSize: "28px" }}>
              <b>{title}</b>
            </Typography>
          )}
          {subtitle && <Typography variant="body2">{subtitle}</Typography>}
        </Stack>
        <Head>
          <title>{title ?? findCurrentPathname?.title}</title>
        </Head>
        {leftButton?.map((button) => button)}
        <FlexBox />
        {rightButton?.map((button) => button)}
      </Stack>
      {isLoading ? <LinearProgress /> : children}
    </Box>
  );
}

export default Page;
