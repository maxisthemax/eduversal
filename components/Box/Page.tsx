import Head from "next/head";
import { usePathname } from "next/navigation";
import router from "next/router";

//*lodash
import find from "lodash/find";
import findIndex from "lodash/findIndex";

//*components
import FlexBox from "./FlexBox";
import { CustomIcon } from "../Icons";

//*mui
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
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
  backgroundColor = "#F8F8F8",
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
  backgroundColor?: string;
}) {
  const pathName = usePathname();
  const findCurrentPathname = find(links, { href: pathName });

  return (
    <Box
      sx={{
        pl: { xs: 1, sm: 1, md: 2 },
        pr: { xs: 1, sm: 1, md: 2 },
        pt: 1,
        pb: 1,
        background: backgroundColor,
        ...sx,
      }}
    >
      {links?.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", alignItems: "center" }}
        >
          <Box sx={{ background: "white", p: 0.5, borderRadius: 1 }}>
            <IconButton
              disableRipple
              size="small"
              onClick={() => router.push(links[0].href)}
            >
              <CustomIcon
                fontSizeSx="20px"
                icon="home"
                iconColor="black"
                fill={true}
              />
            </IconButton>
          </Box>
          <Box sx={{ background: "white", p: 0.5, borderRadius: 1 }}>
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
              <CustomIcon
                fontSizeSx="20px"
                icon="arrow_back"
                iconColor="black"
              />
            </IconButton>
          </Box>
          <Breadcrumbs
            separator="▸"
            sx={{
              color: "black",
              background: "white",
              width: "100%",
              p: 1,
              borderRadius: 1,
              "& .MuiBreadcrumbs-ol": {
                flexWrap: "nowrap",
              },
            }}
          >
            {links &&
              links.length > 0 &&
              links.map(({ href, title }) => {
                if (findCurrentPathname?.href === href) {
                  return (
                    <Typography
                      variant="body1"
                      key={href}
                      color="inherit"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: { xs: "75px", sm: "100px", md: "100%" },
                      }}
                    >
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
      )}
      <Stack
        direction="row"
        spacing={1}
        sx={{ width: "100%", pb: 1, alignItems: "center" }}
      >
        <Stack direction={"column"}>
          {title && (
            <Typography variant="h5">
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
