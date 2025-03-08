import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { useRouter } from "next/navigation";

//*components
import { useCustomDialog } from "@/components/Dialog";

//*lodash
import findIndex from "lodash/findIndex";

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

interface CartData {
  id?: string;
  userPackage: UserPackageData;
  quantity?: number;
  packageUrl: string;
}

function Cart() {
  const { handleOpenDialog } = useCustomDialog();
  const { push } = useRouter();
  const { cart, deleteCart, updateCartQuantity } = useCart();
  const { setUserPackage } = useUserPackages();

  return (
    <Container maxWidth="xl">
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
      <Typography variant="h6">Your Items</Typography>
      <Box sx={{ pt: 2, pb: 2 }}>
        <Divider />
      </Box>
      {cart &&
        cart.length > 0 &&
        cart.map((item) => {
          return (
            <>
              <Grid container key={item.id} spacing={4}>
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
                      src={item.userPackage.packageData.preview_url ?? null}
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
                      sx={{ width: "100%", justifyContent: "space-between" }}
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
                                  ? ` (Downloadable)`
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
                        {item.userPackage.packageData?.name}
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
                              album,
                            },
                            index
                          ) => {
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
                                    sx={{ justifyContent: "space-between" }}
                                  >
                                    <Stack direction="column">
                                      <Typography variant="h6" gutterBottom>
                                        {photoName}
                                      </Typography>
                                      {productVariationOptions.map((option) => (
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
                                      ))}
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
                                <Grid></Grid>
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
                    <Stack>
                      <TextField
                        type="number"
                        value={item.quantity}
                        sx={{ width: "65px" }}
                        onChange={(e) => {
                          if (Number(e.target.value) < 1) return;
                          updateCartQuantity(item.id, Number(e.target.value));
                        }}
                      />
                      <Button
                        onClick={() => {
                          handleOpenDialog({
                            allowOutsideClose: false,
                            title: "Are you to sure remove this from cart?",
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
                      <Typography variant="h6">
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
            </>
          );
        })}
      <Grid container spacing={4}>
        <Grid size={{ xs: "grow" }}></Grid>
        <Grid size={{ xs: 2 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6">Subtotal</Typography>
            <Typography variant="h6">
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
            state.cart[index] = { ...state.cart[index], quantity };
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
