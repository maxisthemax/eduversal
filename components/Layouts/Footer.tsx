import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FlexBox } from "../Box";
import { Link } from "@mui/material";

function Footer() {
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
        <Stack direction={"row"} sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ alignItems: "start" }}>
            {[
              "Photoversal Studio",
              "Company Registration No: 202103306253 (TR0251372-W)",
              "Email :Hello@ysphotoversalstudio.com",
              "Tel: 0389489932 / 60176849932",
              "Company address: Lot 3267 Jalan 18/36 Taman Sri Serdang,",
              `43300 Seri Kembangan, Selangor, Malaysia`,
            ].map((text, index) => {
              return (
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
              );
            })}
          </Stack>
          <FlexBox />
          <Stack direction="column" sx={{ alignItems: "end" }}>
            {[
              { href: "/contactus", text: "Contact Us" },
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
