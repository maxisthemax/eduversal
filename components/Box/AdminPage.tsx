import Head from "next/head";
import { usePathname } from "next/navigation";
import router from "next/router";

//*lodash
import find from "lodash/find";

//*lodash
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

function AdminPage({
  children,
  leftButton,
  rightButton,
  links,
  title,
  subtitle,
  isLoading = false,
  backgroundColor = "white",
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
    <Box sx={{ p: 2, background: backgroundColor, ...sx }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ width: "100%", alignItems: "center" }}
      >
        <Stack direction={"column"}>
          {subtitle && <Typography variant="body2">{subtitle}</Typography>}
        </Stack>
        <Head>
          <title>{title ?? findCurrentPathname?.title}</title>
        </Head>
        {leftButton?.map((button) => button)}
        <FlexBox />
        {rightButton?.map((button) => button)}
      </Stack>
      {links && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", pb: 2, alignItems: "center" }}
        >
          <Box sx={{ background: "#f2f2f2", p: 0.5, borderRadius: 1 }}>
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
          {links?.length > 1 && (
            <Box sx={{ background: "#f2f2f2", p: 0.5, borderRadius: 1 }}>
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
          )}
          <Breadcrumbs
            separator="▸"
            sx={{
              color: "black",
              background: "#f2f2f2",
              width: "100%",
              p: 1,
              borderRadius: 1,
            }}
          >
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
      )}
      {isLoading ? <LinearProgress /> : children}
    </Box>
  );
}

export default AdminPage;
