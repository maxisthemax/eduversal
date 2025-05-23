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

function RefundPolicy() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{ display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          Refund Policy
        </Typography>
        <Box>
          <Typography gutterBottom>
            Due to the custom and personalized nature of our photo products, all
            sales are final.
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
      </Paper>
    </Container>
  );
}

export default RefundPolicy;
