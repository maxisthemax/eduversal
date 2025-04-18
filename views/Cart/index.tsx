import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

//*components
import { useCustomDialog } from "@/components/Dialog";

//*lodash
import findIndex from "lodash/findIndex";
import groupBy from "lodash/groupBy";

//*hooks
import { UserPackageData, useUserPackages } from "../Photos/UserPackage";

//*mui
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

export interface CartData {
  id?: string;
  userPackage: UserPackageData;
  quantity?: number;
  packageUrl: string;
  institutionId?: string;
  institutionName?: string;
  academicYearId?: string;
  academicYearName?: string;
  courseId?: string;
  courseName?: string;
  albumId: string[];
  shippingFee?: number;
  price: number;
  total_price: number;
}

function Cart() {
  const { handleOpenDialog } = useCustomDialog();
  const { push } = useRouter();
  const { cart, deleteCart, updateCartQuantity } = useCart();
  const { setUserPackage } = useUserPackages();

  const cartGroup = useMemo(
    () =>
      groupBy(cart, (item) => {
        return `${item.institutionName} - ${item.academicYearName} - ${item.courseName}`;
      }),
    [cart]
  );

  if (cartGroup && Object.keys(cartGroup).length === 0) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Typography variant="h5">
            <b>Your Cart is Empty</b>
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="h5">
          <b>Your Cart</b>
        </Typography>
      </Box>
      <Paper
        sx={{ height: getFullHeightSize(30), overflow: "auto", p: 2 }}
        elevation={0}
      >
        {cartGroup &&
          Object.keys(cartGroup).length > 0 &&
          Object.keys(cartGroup).map((key: string) => {
            const cart = cartGroup[key];
            return (
              <Box key={key}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <b>{key}</b>
                  </Typography>
                </Box>
                {cart &&
                  cart.length > 0 &&
                  cart.map((item) => {
                    return (
                      <Box key={item.id}>
                        <Grid container spacing={4}>
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
                                  item.userPackage.packageData.preview_url ??
                                  null
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
                          <Grid size={{ xs: 7.5 }}>
                            {item.userPackage.packageId === "none" ? (
                              <Stack
                                direction="row"
                                sx={{
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Stack spacing={0.5}>
                                  <Typography variant="h6" gutterBottom>
                                    {item.userPackage.items[0]?.photoName}
                                  </Typography>
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
                                <Box>
                                  <Button
                                    onClick={() => {
                                      setUserPackage({
                                        ...item.userPackage,
                                        cartId: item.id,
                                      });
                                      push(item.packageUrl);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </Box>
                              </Stack>
                            ) : (
                              <Stack>
                                <Typography variant="h6">
                                  {item.userPackage.packageData?.name}{" "}
                                  {item.userPackage.packageData?.is_downloadable
                                    ? `(Include SoftCopy)`
                                    : ""}
                                </Typography>
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
                                      },
                                      index
                                    ) => {
                                      return (
                                        <Grid
                                          container
                                          key={photoId}
                                          spacing={2}
                                        >
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
                                                  variant="h6"
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
                                                      {
                                                        option.productVariationName
                                                      }
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
                                              <Box>
                                                <Button
                                                  onClick={() => {
                                                    setUserPackage({
                                                      ...item.userPackage,
                                                      cartId: item.id,
                                                      currentStage: index,
                                                    });
                                                    push(item.packageUrl);
                                                  }}
                                                >
                                                  Edit
                                                </Button>
                                              </Box>
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
                          <Grid size={{ xs: 3 }}>
                            <Stack
                              direction="row"
                              sx={{ justifyContent: "space-between" }}
                            >
                              <Stack>
                                <TextField
                                  type="number"
                                  value={item.quantity}
                                  sx={{ width: "65px", pb: 1 }}
                                  onChange={(e) => {
                                    if (Number(e.target.value) < 1) return;
                                    updateCartQuantity(
                                      item.id,
                                      Number(e.target.value)
                                    );
                                  }}
                                />
                                <Button
                                  onClick={() => {
                                    handleOpenDialog({
                                      allowOutsideClose: false,
                                      title:
                                        "Are you to sure remove this from cart?",
                                      onConfirm: async () => {
                                        deleteCart(item.id);
                                      },
                                    });
                                  }}
                                >
                                  Remove
                                </Button>
                              </Stack>
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
                                <Typography
                                  variant="h6"
                                  sx={{ whiteSpace: "nowrap" }}
                                >
                                  RM{" "}
                                  {(
                                    (item.userPackage.itemsPrice +
                                      item.userPackage.packagePrice) *
                                    item.quantity
                                  ).toFixed(2)}
                                </Typography>
                              </Tooltip>
                            </Stack>
                          </Grid>
                        </Grid>
                        <Box sx={{ pt: 2, pb: 2 }}>
                          <Divider />
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            );
          })}
        <Grid container spacing={4}>
          <Grid size={{ xs: 9 }}></Grid>
          <Grid size={{ xs: 3 }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between" }}
              spacing={1}
            >
              <Typography variant="h6">Subtotal</Typography>
              <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
                RM{" "}
                {cart
                  .reduce(
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
            <Box sx={{ pt: 2, pb: 2 }}>
              <Divider />
            </Box>
            <Box sx={{ pb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => push("/checkout")}
              >
                Check Out
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Cart;

interface CartState {
  cart: CartData[] | undefined;
  upsertCart: (cart: CartData) => void;
  clearCart: () => void;
  deleteCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      cart: undefined,
      upsertCart: (cart: CartData) => {
        set((state) => {
          const index = findIndex(state.cart, { id: cart.id });
          if (index > -1) {
            state.cart[index] = { ...state.cart[index], ...cart };
          } else {
            state.cart = [...(state.cart || []), cart];
          }
          return state;
        });
      },
      updateCartQuantity: (id: string, quantity: number) => {
        set((state) => {
          const index = findIndex(state.cart, { id });
          if (index > -1) {
            state.cart[index] = {
              ...state.cart[index],
              quantity,
              price:
                state.cart[index].userPackage.itemsPrice +
                state.cart[index].userPackage.packagePrice,
              total_price:
                (state.cart[index].userPackage.itemsPrice +
                  state.cart[index].userPackage.packagePrice) *
                quantity,
            };
          }
          return { ...state };
        });
      },
      deleteCart: (id: string) => {
        set((state) => {
          return {
            ...state,
            cart: [...state.cart?.filter((item) => item.id !== id)],
          };
        });
      },
      clearCart: () => set({ cart: undefined }),
    }),
    {
      name: "user-cart", // unique name for localStorage key
      partialize: (state) => ({ cart: state.cart }), // only store userPackage
    }
  )
);
