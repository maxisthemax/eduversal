import Head from "next/head";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

//*lodash
import find from "lodash/find";
import findIndex from "lodash/findIndex";

//*components
import FlexBox from "./FlexBox";
import { CustomIcon } from "components/Icons";

//*mui
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import { SxProps, Theme } from "@mui/material";

function Page({
  children,
  leftButton,
  rightButton,
  links,
  title,
  subtitle,
  isLoading = false,
  disabledLinkButton = false,
  sx,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  leftButton?: React.ReactNode[];
  rightButton?: React.ReactNode[];
  links?: { href: string; title: string }[];
  isLoading?: boolean;
  disabledLinkButton?: boolean;
  sx?: SxProps<Theme>;
}) {
  const router = useRouter();
  const pathName = usePathname();
  const findCurrentPathname = find(links, { href: pathName });

  return (
    <Box sx={{ pl: 2, pr: 2, pt: 1, pb: 1, ...sx }}>
      {title && <Typography variant="h6">{title}</Typography>}
      {subtitle && <Typography variant="body2">{subtitle}</Typography>}
      <Head>
        <title>{title ?? findCurrentPathname?.title}</title>
      </Head>
      <Stack
        direction="row"
        spacing={1}
        sx={{ width: "100%", pb: 1, alignItems: "center" }}
      >
        {links && !disabledLinkButton && (
          <Box>
            <IconButton
              disableRipple
              size="small"
              onClick={() => router.push(links[0].href)}
              color="primary"
            >
              <CustomIcon fontSizeSx="16px" icon="home" />
            </IconButton>
            {links?.length > 1 && (
              <IconButton
                disableRipple
                size="small"
                onClick={() =>
                  router.push(
                    links[findIndex(links, { href: pathName }) - 1].href
                  )
                }
                color="primary"
              >
                <CustomIcon fontSizeSx="16px" icon="arrow_back" />
              </IconButton>
            )}
          </Box>
        )}
        <Breadcrumbs separator=">">
          {links &&
            links.length > 0 &&
            links.map(({ href, title }) => {
              if (findCurrentPathname?.href === href) {
                return (
                  <Typography key={href} color="primary">
                    {title}
                  </Typography>
                );
              } else {
                return (
                  <Link key={href} href={href}>
                    {title}
                  </Link>
                );
              }
            })}
        </Breadcrumbs>
        {leftButton?.map((button) => button)}
        <FlexBox />
        {rightButton?.map((button) => button)}
      </Stack>
      {isLoading ? <LinearProgress /> : children}
    </Box>
  );
}

export default Page;
