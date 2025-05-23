//*mui
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

function TermsAndConditions() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{ display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          Terms and Conditions
        </Typography>
        <Box>
          <Typography gutterBottom>
            By accessing and using the Photoversal Studio website, you agree to
            the following terms.
          </Typography>
          <List dense>
            {[
              {
                header:
                  "In these Terms and Conditions, the terms ‘we’, ‘our’, and ‘us’ refer to Photoversal Studio.",
                list: [
                  "You confirm that you are a parent or legal guardian of the student in the photo or have legal permission to place the order.",
                  "You agree to provide accurate and complete information when placing an order, including student name, class, and delivery address (if applicable).",
                  "You understand that photos are for personal use only and may not be copied, resold, or used for commercial purposes.",
                  "You acknowledge that photo products are produced under a preorder system, and delivery will only take place after the purchase window closes.",
                  "No changes or cancellations are allowed once an order is submitted and payment is made.",
                  "Refunds are not available due to the personalized nature of the product (see Refund Policy).",
                  "Our delivery responsibility ends once the package is delivered to the school or courier service.",
                  "You agree not to hold Photoversal Studio liable for school-related distribution delays.",
                  "All photos displayed on this website are protected digital assets owned by Photoversal Studio. Users are strictly prohibited from copying, downloading, or capturing any images using right-click, keyboard shortcuts (e.g., F12 or Print Screen), browser developer tools, or any other means. Such actions are considered theft and may result in legal action.",
                  "We reserve the right to refuse service, cancel orders, or take corrective action if there is evidence of misuse or violation of our policies.",
                  "We reserve the right to modify or update our Terms and Conditions, Delivery Policy, Refund Policy, and Privacy Policy at any time. Changes will be effective upon posting on our website.",
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
                      <Box
                        sx={{
                          minWidth: 40,
                          height: "100%",
                          alignSelf: "start",
                          pt: 0.5,
                        }}
                      >
                        <Typography variant="body1">{index + 1}.</Typography>
                      </Box>
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
          <Typography gutterBottom>
            Please review all policies before placing an order. Continued use of
            our website constitutes acceptance of the latest version of these
            terms.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default TermsAndConditions;
