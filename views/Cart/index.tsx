import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { useRouter } from "next/navigation";

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

interface CartData {
  id?: string;
  userPackage: UserPackageData;
  quantity?: number;
  packageUrl: string;
}

function Cart() {
  const { push } = useRouter();
  const { cart, deleteCart } = useCart();
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
          console.log(item);
          return (
            <>
              <Grid container key={item.id} spacing={2}>
                <Grid size={{ xs: 1.5 }}>
                  {item.userPackage.packageId === "none" ? (
                    <Box
                      component="img"
                      src={item.userPackage.items[0].display_url ?? null}
                      sx={{
                        backgroundColor: "grey.300",
                        width: "100%",
                        aspectRatio: "2/3",
                        objectFit:
                          item.userPackage.albumData?.product_type.type ===
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
                        objectFit:
                          item.userPackage.albumData?.product_type.type ===
                          "INDIVIDUAL"
                            ? "cover"
                            : "contain",
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
                      <Stack>
                        <Typography variant="h6" gutterBottom>
                          {item.userPackage.items[0]?.photoName}
                        </Typography>
                        <Typography variant="body1">
                          Child: {item.userPackage.items[0]?.name}
                        </Typography>
                        {item.userPackage.items[0]?.productVariationOptions.map(
                          (option) => (
                            <Typography
                              variant="body2"
                              key={option.productVariationOptionId}
                            >
                              {option.productVariationName} : {option.name}
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
                      <Typography variant="body1">
                        Child: {item.userPackage.items[0]?.name}
                      </Typography>
                      {item.userPackage.items.map(
                        (
                          {
                            photoId,
                            photoName,
                            display_url,
                            productVariationOptions,
                          },
                          index
                        ) => {
                          return (
                            <Grid container key={photoId} spacing={2}>
                              <Grid size={{ xs: 1.5 }}>
                                <Box
                                  component="img"
                                  src={display_url ?? null}
                                  sx={{
                                    backgroundColor: "grey.300",
                                    width: "100%",
                                    aspectRatio: "2/3",
                                    objectFit:
                                      item.userPackage.albumData?.product_type
                                        .type === "INDIVIDUAL"
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
                                        {option.productVariationName}:{" "}
                                        {option.name}
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
                  )}
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <Button
                    onClick={() => {
                      deleteCart(item.id);
                    }}
                  >
                    Remove
                  </Button>
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <Typography variant="h6">
                    RM{" "}
                    {(
                      item.userPackage.itemsPrice +
                      item.userPackage.packagePrice
                    ).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ pt: 2, pb: 2 }}>
                <Divider />
              </Box>
            </>
          );
        })}
    </Container>
  );
}

export default Cart;

interface CartState {
  cart: CartData[] | undefined;
  upsertCart: (cart: CartData) => void;
  clearCart: () => void;
  deleteCart: (id: string) => void;
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
