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
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import ListItem from "@mui/material/ListItem";

interface CartData {
  id?: string;
  userPackage: UserPackageData;
  quantity?: number;
  packageUrl: string;
}

function Cart() {
  const { push } = useRouter();
  const { cart, clearCart, deleteCart } = useCart();
  const { setUserPackage } = useUserPackages();

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
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
      <Button onClick={clearCart}>Clear</Button>
      <List disablePadding dense>
        {cart &&
          cart.length > 0 &&
          cart.map((item) => {
            if (item.userPackage.packageId === "none")
              return (
                <ListItem key={item.id} disableGutters>
                  <Stack direction="row" spacing={2}>
                    <Box
                      component="img"
                      src={item.userPackage.items[0].display_url ?? null}
                      sx={{
                        backgroundColor: "grey.300",
                        height: "200px",
                        aspectRatio: "2/3",
                        objectFit:
                          item.userPackage.albumData?.product_type.type ===
                          "INDIVIDUAL"
                            ? "cover"
                            : "contain",
                      }}
                    />
                    <Box>
                      <Button
                        onClick={() => {
                          deleteCart(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
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
                </ListItem>
              );
            else
              return (
                <ListItem key={item.id} disableGutters>
                  <Stack direction="row" spacing={2}>
                    <Box
                      component="img"
                      src={item.userPackage.packageData.preview_url ?? null}
                      sx={{
                        backgroundColor: "grey.300",
                        height: "200px",
                        aspectRatio: "2/3",
                        objectFit:
                          item.userPackage.albumData?.product_type.type ===
                          "INDIVIDUAL"
                            ? "cover"
                            : "contain",
                      }}
                    />
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
                </ListItem>
              );
          })}
      </List>
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
