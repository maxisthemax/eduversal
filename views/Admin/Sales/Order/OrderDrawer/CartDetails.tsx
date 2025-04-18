import { useMemo } from "react";

//*lodash
import groupBy from "lodash/groupBy";

//*mui
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

function CartDetails({ cart }) {
  const cartGroup = useMemo(
    () =>
      groupBy(cart, (item) => {
        return `${item.institutionName} - ${item.academicYearName} - ${item.courseName}`;
      }),
    [cart]
  );

  return (
    cartGroup &&
    Object.keys(cartGroup).length > 0 &&
    Object.keys(cartGroup).map((key: string) => {
      const cart = cartGroup[key];
      return (
        <Box key={key}>
          <Box>
            <Typography variant="h6" gutterBottom>
              <b>{key}</b>
            </Typography>
            {cart &&
              cart.length > 0 &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cart.map((item: any, index) => {
                return (
                  <Box key={item.id}>
                    <Grid
                      container
                      key={item.id}
                      spacing={2}
                      sx={{ py: 2, px: 0 }}
                    >
                      <Grid size={{ xs: 1.5 }}>
                        {item.userPackage.packageId === "none" ? (
                          <Box
                            component="img"
                            src={item.userPackage.items[0].photoUrl ?? null}
                            sx={{
                              width: "100%",
                              aspectRatio: "1/1",
                              objectFit: "contain",
                              backgroundColor: "#f2f2f2",
                            }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={
                              item.userPackage.packageData.preview_url ?? null
                            }
                            sx={{
                              width: "100%",
                              aspectRatio: "1/1",
                              objectFit: "contain",
                              backgroundColor: "#f2f2f2",
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
                              {!item.userPackage.items[0].album
                                .productTypeDeliverable && (
                                <Typography variant="inherit" color="error">
                                  Please note that this product is available for
                                  collection at the school by the assigned
                                  teacher.
                                </Typography>
                              )}
                              <Typography variant="body2">
                                Child: {item.userPackage.items[0]?.name}
                              </Typography>
                              {item.userPackage.items[0]?.productVariationOptions.map(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (option: any) =>
                                  option.productVariationOptionId ? (
                                    <Typography
                                      variant="body2"
                                      key={option.productVariationOptionId}
                                    >
                                      {option.productVariationName}
                                      {option.productVariationDownloadable
                                        ? ` (Includes Soft Copy)`
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
                                            width: "100%",
                                            aspectRatio: "1/1",
                                            objectFit: "contain",
                                            backgroundColor: "#f2f2f2",
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
                                            {!album.productTypeDeliverable && (
                                              <Typography
                                                variant="inherit"
                                                color="error"
                                              >
                                                Please note that this product is
                                                available for collection at the
                                                school by the assigned teacher.
                                              </Typography>
                                            )}
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
                                                    ? ` (Includes Soft Copy)`
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
                          <Tooltip
                            placement="top"
                            title={`RM ${(
                              item.userPackage.packagePrice +
                              item.userPackage.itemsPrice
                            ).toFixed(2)} x ${item.quantity} = ${(
                              (item.userPackage.packagePrice +
                                item.userPackage.itemsPrice) *
                              item.quantity
                            ).toFixed(2)}`}
                          >
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
                          </Tooltip>
                        </Stack>
                      </Grid>
                    </Grid>
                    {cart.length - 1 !== index && <Divider />}
                  </Box>
                );
              })}
          </Box>
        </Box>
      );
    })
  );
}

export default CartDetails;
