//*lodash
import startCase from "lodash/startCase";

//*components
import { Page, useCustomTabs } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";

//*mui
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { useOrder } from "@/data/order";

//*utils
import { statusColor } from "@/utils/constant";

function Purchase() {
  const { tabsComponent } = useCustomTabs({
    tabs: [
      {
        label: "All",
        value: "all",
        render: <PurchaseComponent status={"ALL"} />,
      },
      {
        label: "Pending",
        value: "pending",
        render: <PurchaseComponent status={"PENDING"} />,
      },
      {
        label: "Completed",
        value: "completed",
        render: <PurchaseComponent status={"COMPLETED"} />,
      },
      {
        label: "Cancelled/Refund",
        value: "cancelled/refund",
        render: <PurchaseComponent status={"CANCELLED/REFUND"} />,
      },
    ],
    defaultTab: "all",
    isPaper: false,
    variant: "fullWidth",
  });

  return (
    <Page title="Purchase" subtitle="Manage your purchase">
      {tabsComponent}
    </Page>
  );
}
export default Purchase;

function PurchaseComponent({ status }) {
  const { orderDataByStatus } = useOrder(status);

  return (
    <Stack sx={{ height: getFullHeightSize(30), p: 2 }} spacing={2}>
      {orderDataByStatus.map(({ cart, id, status }) => {
        return (
          <Paper key={id}>
            <Stack
              direction="row"
              sx={{ p: 2, justifyContent: "space-between" }}
            >
              <Stack direction="row" spacing={2}>
                <CustomIcon icon="list_alt" />
                <Typography variant="body1">ORDER ID: {id}</Typography>
              </Stack>
              <Typography variant="body1" color={statusColor[status]}>
                {startCase(status)}
              </Typography>
            </Stack>
            <Divider />
            {cart &&
              cart.length > 0 &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cart.map((item: any) => {
                return (
                  <Box key={item.id}>
                    <Grid container key={item.id} spacing={4} sx={{ p: 2 }}>
                      <Grid size={{ xs: 1.5 }}>
                        {item.userPackage.packageId === "none" ? (
                          <Box
                            component="img"
                            src={item.userPackage.items[0].photoUrl ?? null}
                            sx={{
                              backgroundColor: "grey.300",
                              width: "100%",
                              aspectRatio: "2/3",
                              objectFit:
                                item.userPackage.items[0].album.productType ===
                                "INDIVIDUAL"
                                  ? "cover"
                                  : "contain",
                            }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={
                              item.userPackage.packageData.preview_url ?? null
                            }
                            sx={{
                              backgroundColor: "grey.300",
                              width: "100%",
                              aspectRatio: "2/3",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Grid>
                      <Grid size={{ xs: "grow" }}>
                        {item.userPackage.packageId === "none" ? (
                          <Stack
                            direction="row"
                            sx={{
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Stack spacing={0.5}>
                              <Typography variant="body1" gutterBottom>
                                {item.userPackage.items[0]?.photoName}
                              </Typography>
                              <Typography variant="body2">
                                Child: {item.userPackage.items[0]?.name}
                              </Typography>
                              {item.userPackage.items[0]?.productVariationOptions.map(
                                (option) =>
                                  option.productVariationOptionId ? (
                                    <Typography
                                      variant="body2"
                                      key={option.productVariationOptionId}
                                    >
                                      {option.productVariationName}
                                      {option.productVariationDownloadable
                                        ? ` (Downloadable)`
                                        : ""}
                                      : {option.productVariationOptionName}
                                    </Typography>
                                  ) : (
                                    <></>
                                  )
                              )}
                            </Stack>
                          </Stack>
                        ) : (
                          <Stack>
                            <Typography variant="body1">
                              {item.userPackage.packageData?.name}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Child: {item.userPackage.items[0]?.name}
                            </Typography>
                            <Stack spacing={2}>
                              {item.userPackage.items.map(
                                ({
                                  photoId,
                                  photoName,
                                  photoUrl,
                                  productVariationOptions,
                                  album,
                                }) => {
                                  return (
                                    <Grid container key={photoId} spacing={2}>
                                      <Grid size={{ xs: 1.5 }}>
                                        <Box
                                          component="img"
                                          src={photoUrl ?? null}
                                          sx={{
                                            backgroundColor: "grey.300",
                                            width: "100%",
                                            aspectRatio:
                                              album.productType === "INDIVIDUAL"
                                                ? "2/3"
                                                : "3/2",
                                            objectFit:
                                              album.productType === "INDIVIDUAL"
                                                ? "cover"
                                                : "contain",
                                          }}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: "grow" }}>
                                        <Stack
                                          direction="row"
                                          sx={{
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <Stack direction="column">
                                            <Typography
                                              variant="body1"
                                              gutterBottom
                                            >
                                              {photoName}
                                            </Typography>
                                            {productVariationOptions.map(
                                              (option) => (
                                                <Typography
                                                  variant="body2"
                                                  key={
                                                    option.productVariationOptionId
                                                  }
                                                >
                                                  {option.productVariationName}
                                                  {option.productVariationDownloadable
                                                    ? ` (Downloadable)`
                                                    : ""}
                                                  :{" "}
                                                  {
                                                    option.productVariationOptionName
                                                  }
                                                </Typography>
                                              )
                                            )}
                                          </Stack>
                                        </Stack>
                                      </Grid>
                                    </Grid>
                                  );
                                }
                              )}
                            </Stack>
                          </Stack>
                        )}
                      </Grid>
                      <Grid size={{ xs: 2 }}>
                        <Stack
                          direction="row"
                          sx={{ justifyContent: "space-between" }}
                        >
                          <Typography variant="body1">
                            x {item.quantity}
                          </Typography>
                          <Typography variant="body1">
                            <b>
                              RM{" "}
                              {(
                                (item.userPackage.itemsPrice +
                                  item.userPackage.packagePrice) *
                                item.quantity
                              ).toFixed(2)}
                            </b>
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                    <Divider />
                  </Box>
                );
              })}
          </Paper>
        );
      })}
    </Stack>
  );
}
