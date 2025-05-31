import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

//*components
import { FlexBox } from "../Box";

//*helpers
import { useGetIsMobileSize } from "@/helpers/view";

function Footer() {
  const isMobile = useGetIsMobileSize();
  return (
    <Stack
      spacing={2}
      sx={{
        background: "white",
        width: "100%",
        py: 2,
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={isMobile ? "column" : "row"}
          sx={{ width: "100%" }}
          spacing={1}
        >
          <Stack direction="column" sx={{ alignItems: "start" }}>
            {[
              "Photoversal Studio",
              "Company Registration No: 202103306253 (TR0251372-W)",
              "Email: Hello@ysphotoversalstudio.com",
              "Tel: 0389489932 / 60176849932",
              "Company address: Lot 3267 Jalan 18/36 Taman Sri Serdang, 43300, Seri Kembangan, Selangor, Malaysia",
            ].map((text, index) => {
              return (
                <Typography
                  key={index}
                  variant="body1"
                  sx={{
                    textAlign: "start",
                    color: "#6b6f74",
                  }}
                >
                  {text}
                </Typography>
              );
            })}
          </Stack>
          <FlexBox />
          <Stack
            direction="column"
            sx={{ alignItems: isMobile ? "start" : "end" }}
          >
            {[
              { href: "/aboutus", text: "About Us" },
              { href: "/refundpolicy", text: "Refund Policy" },
              { href: "/privacypolicy", text: "Privacy Policy" },
              { href: "/shippingpolicy", text: "Shipping Policy" },
              { href: "/termsandconditions", text: "Terms and Conditions" },
            ].map(({ href, text }, index) => {
              return (
                <Link href={href} key={index} underline="none">
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{
                      textAlign: "center",
                      color: "#6b6f74",
                    }}
                  >
                    {text}
                  </Typography>
                </Link>
              );
            })}
          </Stack>
        </Stack>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "#6b6f74",
            pt: 2,
          }}
        >
          {`Copyright © ${new Date().getFullYear()} Photoversal Studio. All rights reserved.`}
        </Typography>
      </Container>
    </Stack>
  );
}

export default Footer;
