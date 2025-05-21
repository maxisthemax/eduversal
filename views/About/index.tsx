//*components
import { CustomIcon } from "@/components/Icons";

//*mui
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

function About() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<CustomIcon icon="expand_more" />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">
            <b>Contact Us</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
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
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<CustomIcon icon="expand_more" />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">
            <b>Delivery policy</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Typography gutterBottom>
              All photo products are processed under a preorder system. This
              means we only begin production after the purchase period ends, not
              at the time of individual payment.
            </Typography>
            <Typography>How Delivery Works:</Typography>
            <List dense>
              {[
                {
                  header: "1. School Delivery (Default Option)",
                  list: [
                    "Most orders will be delivered in bulk to the student’s school after production is complete.",
                    "Class teachers will help distribute the printed photos to students.",
                    "It is the buyer’s responsibility to provide accurate student name, class, and school name. Incorrect details may result in failed or delayed delivery.",
                    "Once we deliver the parcel to the school, our responsibility is considered fulfilled. Any delays due to internal school distribution are beyond our control.",
                  ],
                },
                {
                  header: "Home Delivery (Only for Selected Products)",
                  list: [
                    "Some special photos or items may offer delivery to your home address.",
                    "If this option is available during checkout, please fill in your complete and accurate address.",
                    "A delivery fee applies and will be displayed before payment is completed.",
                  ],
                },
                {
                  header: "Important Notes:",
                  list: [
                    "We do not provide express or rush delivery. All photos are printed in bulk after the preorder deadline.",
                    "We do not entertain changes to delivery details after the order is submitted.",
                    "We are not responsible for missed deliveries caused by:",
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
              {[
                "Inaccurate or incomplete order information",
                "Absence during school distribution",
                "Incorrect addresses for home delivery",
                "Orders placed with the wrong photo selected",
                "By placing an order, you agree to these delivery terms.",
              ].map((item, index) => (
                <ListItem key={index} sx={{ pl: 8 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CustomIcon icon="circle" fontSizeSx="12px" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    slotProps={{ primary: { variant: "body1" } }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<CustomIcon icon="expand_more" />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">
            <b>Refund policy</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Typography gutterBottom>
              Due to the custom and personalized nature of our photo products,
              all sales are final.
            </Typography>
            <List dense>
              {[
                {
                  header: "We do not offer refunds for:",
                  list: [
                    "Change of mind after placing the order",
                    "Incorrect or incomplete order information provided by the customer",
                    "Delays in delivery due to schools, courier services, or inaccurate delivery information",
                    "Each order is produced specifically for your child and cannot be reused, exchanged, or resold.",
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
            <Typography gutterBottom>Exception:</Typography>
            <Typography gutterBottom>
              In the rare case of damaged prints or printing errors made by us,
              you must notify us within 7 days of receiving the item, along with
              photo evidence. We will investigate and may reprint or replace the
              item at our discretion.
            </Typography>
            <Typography gutterBottom sx={{ pt: 2 }}>
              By completing a purchase, you acknowledge and agree to this
              no-refund policy.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<CustomIcon icon="expand_more" />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">
            <b>Terms and Conditions</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Typography gutterBottom>
              By accessing and using the Photoversal Studio website, you agree
              to the following terms.
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
              Please review all policies before placing an order. Continued use
              of our website constitutes acceptance of the latest version of
              these terms.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<CustomIcon icon="expand_more" />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">
            <b>Privacy policy</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AccordionDetails>
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>
                At Photoversal Studio, we are committed to protecting your
                privacy and personal information.
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
                Photoversal Studio may update this Privacy Policy from time to
                time. Any changes will be posted on this page. Continued use of
                our services constitutes your agreement to the revised policy.
              </Typography>
            </Box>
          </AccordionDetails>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
export default About;
