//*components
import { CustomIcon } from "@/components/Icons";

//*mui
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

function PrivacyPolicy() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{ display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          Privacy Policy
        </Typography>
        <Box>
          <Typography gutterBottom>
            At Photoversal Studio, we are committed to protecting your privacy
            and personal information.
          </Typography>
          <List dense>
            {[
              {
                header: "Information We Collect:",
                list: [
                  "Student’s name, class, and school",
                  "Parent’s name, contact number, and email address",
                  "Delivery address (if applicable)",
                  "Payment and transaction details (processed securely via third-party providers)",
                ],
              },
              {
                header: "How We Use Your Information:",
                list: [
                  "To process and deliver your order",
                  "To provide customer support and order-related updates",
                  "To verify and fulfill school delivery or home delivery options",
                ],
              },
              {
                header: "Data Protection:",
                list: [
                  "We do not store your payment details. Payments are handled securely via third-party payment gateways.",
                  "We do not share or sell your personal data to external marketers or unrelated third parties.",
                  "We implement reasonable security measures to protect your data from unauthorized access.",
                ],
              },
            ].map(({ header, list }) => {
              return (
                <>
                  <ListItem disableGutters>
                    <ListItemText
                      primary={header}
                      slotProps={{ primary: { variant: "body1" } }}
                    />
                  </ListItem>
                  {list.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CustomIcon
                          icon="check_indeterminate_small"
                          fontSizeSx="20px"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        slotProps={{ primary: { variant: "body1" } }}
                      />
                    </ListItem>
                  ))}
                </>
              );
            })}
          </List>
          <Typography gutterBottom>Consent:</Typography>

          <Typography gutterBottom>
            By placing an order or using our website, you consent to the
            collection and use of your data as outlined in this policy.
          </Typography>
          <br />
          <Typography gutterBottom>Policy Updates:</Typography>
          <Typography gutterBottom>
            Photoversal Studio may update this Privacy Policy from time to time.
            Any changes will be posted on this page. Continued use of our
            services constitutes your agreement to the revised policy.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default PrivacyPolicy;
