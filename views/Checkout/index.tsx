import * as yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

//*components
import { FlexBox } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";
import {
  TextFieldForm,
  MobileNumberForm,
  StateSelectTextFieldForm,
} from "@/components/Form";

//*mui
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";

//*data
import { useCart } from "../Cart";
import { useOrder } from "@/data/order";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

const validationSchema = yup.object({
  shipping_address: yup.object().when("shipment_method", {
    is: "in-store",
    then: () =>
      yup.object().shape({
        first_name: yup.string(),
        last_name: yup.string(),
        phone_no: yup.string(),
        address_1: yup.string(),
        postcode: yup.string(),
        state: yup.string(),
        city: yup.string(),
      }),
    otherwise: () =>
      yup.object().shape({
        first_name: yup.string().required("First Name is required"),
        last_name: yup.string().required("Last Name is required"),
        phone_no: yup.string().required("Phone No is required"),
        address_1: yup.string().required("Address 1 No is required"),
        postcode: yup.string().required("Postcode is required"),
        state: yup.string().required("State is required"),
        city: yup.string().required("City is required"),
      }),
  }),
});

function Checkout() {
  const { push } = useRouter();
  const { cart } = useCart();
  const { addOrder } = useOrder();

  const isDeliverable = cart?.some((item) =>
    item.userPackage.items.some((item) => item.album.productTypeDeliverable)
  );

  const formik = useFormik({
    initialValues: {
      shipping_address: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        country_code: "+60",
        phone_no: "",
        address_1: "",
        address_2: "",
        postcode: "",
        state: "",
        city: "",
      },
      payment_method: "",
      shipment_method: "in-store",
      shipping_fee: 0,
      remark: "",
    },
    validationSchema: validationSchema,
    onSubmit: async ({
      shipping_address,
      payment_method,
      shipment_method,
      shipping_fee,
      remark,
    }) => {
      if (payment_method === "") {
        toast("Payment method required.", { type: "error" });
        return;
      }

      try {
        const newCart = cart.map((item) => {
          if (item?.userPackage?.packageData?.expandedAlbums)
            delete item.userPackage.packageData.expandedAlbums;
          return item;
        });

        // Calculate total price
        const totalPrice =
          cart.reduce(
            (acc, item) =>
              acc +
              (item.userPackage.itemsPrice + item.userPackage.packagePrice) *
                item.quantity,
            0
          ) + shipping_fee;

        // Create order first
        await addOrder({
          cart: newCart,
          payment_method,
          shipment_method,
          shipping_fee,
          remark,
          shipping_address,
          price: totalPrice,
          status: "PENDING",
        });
      } catch (error) {
        console.error("Checkout error:", error);
        toast("An error occurred during checkout. Please try again.", {
          type: "error",
        });
      }
    },
  });
  const values = formik.values;
  const setFieldValue = formik.setFieldValue;
  const formProps = {
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    handleBlur: formik.handleBlur,
    handleChange: formik.handleChange,
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container sx={{ height: getFullHeightSize(0), width: "100%" }}>
        <Grid
          size={{ xs: 6 }}
          sx={{ pt: 4, pl: 4, pr: 4, height: "100%", overflow: "auto" }}
        >
          <Container maxWidth="md" disableGutters sx={{ marginRight: "0px" }}>
            <Stack sx={{ width: "100%" }} spacing={4}>
              <Box>
                <Box component="img" src={"/image/logo.png"} height={"30px"} />
              </Box>
              <Stack sx={{ width: "100%" }} spacing={2}>
                <Typography gutterBottom>Shipping Method</Typography>
                <Button
                  onClick={() => {
                    setFieldValue("shipment_method", "in-store");
                    setFieldValue("shipping_fee", 0);
                  }}
                  fullWidth
                  variant="outlined"
                  color={
                    values?.shipment_method === "in-store"
                      ? "primary"
                      : "inherit"
                  }
                  sx={{ p: 2, justifyContent: "space-between" }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                  >
                    <CustomIcon icon="check_circle" />
                    <ListItemText
                      slotProps={{
                        primary: { variant: "inherit" },
                        secondary: { variant: "inherit" },
                      }}
                      sx={{ justifyItems: "start" }}
                      primary={"Pick up in store"}
                      secondary={"Address"}
                    />
                  </Stack>
                </Button>
                {isDeliverable && (
                  <Button
                    onClick={() => {
                      setFieldValue("shipment_method", "ship");
                      setFieldValue("shipping_fee", 15);
                    }}
                    color={
                      values?.shipment_method === "ship" ? "primary" : "inherit"
                    }
                    fullWidth
                    variant="outlined"
                    sx={{ p: 2, justifyContent: "space-between" }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center", width: "100%" }}
                    >
                      <CustomIcon icon="check_circle" />
                      <ListItemText
                        slotProps={{
                          primary: { variant: "inherit" },
                          secondary: { variant: "inherit" },
                        }}
                        sx={{ justifyItems: "start" }}
                        primary={"Ship In"}
                      />
                      <FlexBox />
                      <Typography variant="inherit">RM 15.00</Typography>
                    </Stack>
                  </Button>
                )}
              </Stack>
              {values?.shipment_method === "ship" && (
                <Stack sx={{ width: "100%" }} spacing={2}>
                  <Typography gutterBottom>Shipping Address</Typography>
                  <Stack spacing={2} sx={{ textAlign: "center" }}>
                    <Stack direction={"row"} spacing={2}>
                      <TextFieldForm
                        name="shipping_address.first_name"
                        label="First Name"
                        formProps={formProps}
                        props={{ required: true, size: "medium" }}
                      />
                      <TextFieldForm
                        name="shipping_address.last_name"
                        label="Last Name"
                        formProps={formProps}
                        props={{ required: true, size: "medium" }}
                      />
                    </Stack>
                    <MobileNumberForm
                      name="shipping_address.phone_no"
                      label="Phone No"
                      formProps={formProps}
                      props={{ required: true, size: "medium" }}
                      countryCallingCode={values.shipping_address.country_code}
                      onCountryChange={(e) => setFieldValue("country_code", e)}
                    />
                    <TextFieldForm
                      name="shipping_address.address_1"
                      label="Address 1"
                      formProps={formProps}
                      props={{ required: true, size: "medium" }}
                    />
                    <TextFieldForm
                      name="shipping_address.address_2"
                      label="Address 2"
                      formProps={formProps}
                      props={{ size: "medium" }}
                    />
                    <Stack direction={"row"} spacing={2}>
                      <TextFieldForm
                        name="shipping_address.postcode"
                        label="Postcode"
                        formProps={formProps}
                        onlyNumber={true}
                        props={{ size: "medium" }}
                      />
                      <StateSelectTextFieldForm
                        name="shipping_address.state"
                        label="State"
                        formProps={formProps}
                        props={{ size: "medium", sx: { textAlign: "start" } }}
                      />
                      <TextFieldForm
                        name="shipping_address.city"
                        label="City"
                        formProps={formProps}
                        props={{ size: "medium" }}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              )}
              <Stack sx={{ width: "100%" }} spacing={2}>
                <Typography gutterBottom>Payment Method</Typography>
                {["fpx", "credit card", "e-wallet"].map((method) => (
                  <Button
                    onClick={() => {
                      setFieldValue("payment_method", method);
                    }}
                    key={method}
                    fullWidth
                    variant={"outlined"}
                    color={
                      values?.payment_method === method ? "primary" : "inherit"
                    }
                    sx={{ p: 2, justifyContent: "space-between" }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <CustomIcon icon="check_circle" />
                      <ListItemText
                        slotProps={{
                          primary: { variant: "inherit" },
                          secondary: { variant: "inherit" },
                        }}
                        sx={{ justifyItems: "start" }}
                        primary={method}
                      />
                    </Stack>
                  </Button>
                ))}
              </Stack>
              <TextFieldForm
                name="remark"
                label="Remark"
                formProps={formProps}
                props={{ size: "medium", multiline: true, minRows: 4 }}
              />
            </Stack>
            <Stack
              sx={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                pt: 2,
                pb: 4,
                background: "white",
              }}
              spacing={2}
            >
              <Button
                onClick={() => {
                  formik.handleSubmit();
                }}
                variant="contained"
                fullWidth
              >
                Continue
              </Button>
              <Button
                onClick={() => {
                  push("/cart");
                }}
                variant="outlined"
                fullWidth
              >
                Back
              </Button>
            </Stack>
          </Container>
        </Grid>
        <Grid
          size={{ xs: 6 }}
          sx={{
            background: "#FBF9F7",
            pl: 4,
            pr: 4,
            pt: 4,
            height: "100%",
            overflow: "auto",
          }}
        >
          <Container maxWidth="md" disableGutters sx={{ marginLeft: "0px" }}>
            {cart &&
              cart.length > 0 &&
              cart.map((item) => {
                return (
                  <>
                    <Grid container key={item.id} spacing={2}>
                      <Grid size={{ xs: 2 }}>
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
                            <Stack spacing={0.5} sx={{ width: "100%" }}>
                              <Stack direction="row">
                                <Stack>
                                  <Typography gutterBottom>
                                    {item.userPackage.items[0]?.photoName}
                                  </Typography>
                                  {!item.userPackage.items[0].album
                                    .productTypeDeliverable && (
                                    <Typography variant="inherit" color="error">
                                      Please note that this product is available
                                      for collection at the school by the
                                      assigned teacher.
                                    </Typography>
                                  )}
                                </Stack>
                                <FlexBox />
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
                                  <Typography sx={{ whiteSpace: "nowrap" }}>
                                    x {item.quantity}&nbsp;&nbsp;&nbsp;&nbsp;RM{" "}
                                    {(
                                      (item.userPackage.packagePrice +
                                        item.userPackage.itemsPrice) *
                                      item.quantity
                                    ).toFixed(2)}
                                  </Typography>
                                </Tooltip>
                              </Stack>
                              <Typography variant="body1">
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
                            <Stack direction="row">
                              <Typography>
                                {item.userPackage.packageData?.name}
                              </Typography>
                              <FlexBox />
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
                                <Typography sx={{ whiteSpace: "nowrap" }}>
                                  x {item.quantity}&nbsp;&nbsp;&nbsp;&nbsp;RM{" "}
                                  {(
                                    (item.userPackage.packagePrice +
                                      item.userPackage.itemsPrice) *
                                    item.quantity
                                  ).toFixed(2)}
                                </Typography>
                              </Tooltip>
                            </Stack>
                            <Typography variant="body1" gutterBottom>
                              Child: {item.userPackage.items[0]?.name}
                            </Typography>
                            <Stack spacing={2}>
                              {item.userPackage.items.map(
                                (
                                  {
                                    photoId,
                                    photoName,
                                    photoUrl,
                                    productVariationOptions,
                                    album,
                                  },
                                  index
                                ) => {
                                  return (
                                    <Grid
                                      container
                                      key={`${photoId}_${index}`}
                                      spacing={2}
                                    >
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
                                            <Stack>
                                              <Typography gutterBottom>
                                                {photoName}
                                              </Typography>
                                              {!album.productTypeDeliverable && (
                                                <Typography
                                                  variant="inherit"
                                                  color="error"
                                                >
                                                  Please note that this product
                                                  is available for collection at
                                                  the school by the assigned
                                                  teacher.
                                                </Typography>
                                              )}
                                            </Stack>
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
                    </Grid>
                    <Box sx={{ pt: 2, pb: 2 }}>
                      <Divider />
                    </Box>
                  </>
                );
              })}
            <Grid
              container
              sx={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                pt: 2,
                pb: 2,
                background: "#FBF9F7",
              }}
            >
              <Grid size={{ xs: 12 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between" }}
                  spacing={1}
                >
                  <Typography sx={{ fontWeight: 300 }}>Subtotal</Typography>
                  <Typography sx={{ fontWeight: 300 }}>
                    RM{" "}
                    {cart
                      ?.reduce(
                        (acc, item) =>
                          acc +
                          (item.userPackage.itemsPrice +
                            item.userPackage.packagePrice) *
                            item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 300 }}>Delivery Fee</Typography>
                  {values.shipment_method === "ship" ? (
                    <Typography>RM {values.shipping_fee.toFixed(2)}</Typography>
                  ) : (
                    <Typography>Free</Typography>
                  )}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography>Total</Typography>
                  <Typography>
                    RM{" "}
                    {(
                      cart?.reduce(
                        (acc, item) =>
                          acc +
                          (item.userPackage.itemsPrice +
                            item.userPackage.packagePrice) *
                            item.quantity,
                        0
                      ) + values.shipping_fee
                    ).toFixed(2)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Grid>
      </Grid>
    </form>
  );
}

export default Checkout;
