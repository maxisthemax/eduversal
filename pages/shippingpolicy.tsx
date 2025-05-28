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

function ShippingPolicy() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{ display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          Shipping Policy
        </Typography>
        <Box>
          <Typography gutterBottom>
            All photo products are processed under a preorder system. This means
            we only begin production after the purchase period ends, not at the
            time of individual payment. Estimated delivery is within 7 to 14
            working days from the order deadline.
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
      </Paper>
    </Container>
  );
}

export default ShippingPolicy;
