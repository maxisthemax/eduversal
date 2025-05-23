//*components
import { FlexBox } from "@/components/Box";

//*mui
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";

function ContactUs() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper elevation={0} sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 2 }}>
          Contact Us
        </Typography>
        <Table size="small">
          {[
            {
              header: "Company name",
              content: "Photoversal Studio",
            },
            {
              header: "SSM number",
              content: "202103306253 (TR0251372-W)",
            },
            {
              header: "Email",
              content: (
                <a href="mailto:hello@ysphotoversalstudio.com">
                  hello@ysphotoversalstudio.com
                </a>
              ),
            },
            {
              header: "Phone number",
              content: "0389489932 / 60176849932",
            },
            {
              header: "Company address",
              content:
                "Lot 3267 Jalan 18/36 Taman Sri Serdang 43300 Seri Kembangan, Selangor, Malaysia.",
            },
          ].map(({ header, content }) => {
            return (
              <TableRow key={header} sx={{ border: "none" }}>
                <TableCell sx={{ border: "none" }} width={150}>
                  <Typography variant="body1">{header}</Typography>
                </TableCell>
                <TableCell sx={{ border: "none" }}>
                  <Typography variant="body1">{content}</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
        <FlexBox minHeight={120} />
      </Paper>
    </Container>
  );
}

export default ContactUs;
