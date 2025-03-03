import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

//*components
import { FlexBox } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";
import SelectPhotoDialog from "./SelectPhotoDialog";
import { useCustomDialog } from "@/components/Dialog";

//*mui
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

//*data
import { UserCoursePackageData } from "@/data/userCourse/course";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

export interface UserPackageData {
  packageId?: string;
  packageData?: UserCoursePackageData;
  packagePrice?: number;
  currentStage?: number;
  itemsPrice?: number;
  items?: UserPackageItemData[];
}

export interface UserPackageItemData {
  name: string | undefined;
  albumId: string;
  photoId: string;
  display_url: string;
  productVariationOptions: {
    productVariationId: string;
    productVariationOptionId: string;
    name: string;
    price: number;
  }[];
}

function UserPackages() {
  const { handleOpenDialog } = useCustomDialog();
  const { class_id, album_id } = useParams();
  const { push } = useRouter();
  const { userPackage, setUserPackage, removeUserPackage } = useUserPackages();

  useEffect(() => {
    if (!userPackage) {
      push(`/photos/${class_id}`);
    }
    if (userPackage?.packageId === "none") {
    }
  }, [class_id, userPackage]);

  const packageData = userPackage?.packageData;
  const items = userPackage?.items;
  const album = packageData?.expandedAlbums[userPackage.currentStage];

  const handleSave = () => {
    if (
      userPackage.items.some((item) => item.photoId === "") // Fix typo in condition
    ) {
      toast.error("Please select all photos");
      return;
    }
  };

  if (!packageData || !album) return null;

  return (
    <Box
      sx={{
        background: "#F5F5F5",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F5F5F5",
          p: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          <b>{packageData.name}</b>
        </Typography>
        <Typography variant="h6">Select {album.name}</Typography>
      </Stack>

      <Box sx={{ p: 2, background: "white", height: getFullHeightSize(25) }}>
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            {album.photos.map((photo) => {
              const { id: photoId, display_url } = photo;
              return (
                <Grid spacing={2} key={photoId} size={{ xs: 2 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        p: 0,
                        pl: 2,
                        pr: 2,
                        border: "1px solid #B8BDC4",
                        display: "flex",
                      }}
                    >
                      <Box
                        component="img"
                        src={display_url ?? null}
                        sx={{
                          backgroundColor: "grey.300",
                          width: "100%",
                          height: "100%",
                          aspectRatio: "2/3",
                          objectFit:
                            album.product_type.type === "INDIVIDUAL"
                              ? "cover"
                              : "contain",
                        }}
                      />
                    </Box>
                    <SelectPhotoDialog album={album} photo={photo} />
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Container>
        <Toolbar sx={{ height: "130px" }} />
      </Box>
      <AppBar
        position="fixed"
        sx={{ top: "auto", bottom: 0, background: "white" }}
      >
        <Toolbar disableGutters>
          <Container maxWidth="xl">
            <Stack
              direction="row"
              spacing={2}
              sx={{
                height: "80px",
                pt: 2,
                pb: 2,
                width: "100%",
                alignItems: "center",
              }}
            >
              {items.map((item, index) => {
                if (!item) return null;
                const { display_url } = item;

                return (
                  <>
                    <Button
                      onClick={() => {
                        setUserPackage({ currentStage: index });
                      }}
                      sx={{
                        p: 0,
                        pl: 2,
                        pr: 2,
                        border:
                          index === userPackage.currentStage
                            ? "1px solid #006DEE"
                            : "1px solid #B8BDC4",
                      }}
                    >
                      <Box
                        component="img"
                        src={display_url ?? null}
                        sx={{
                          backgroundColor: "grey.300",
                          height: "80px",
                          aspectRatio: "2/3",
                          objectFit:
                            album.product_type.type === "INDIVIDUAL"
                              ? "cover"
                              : "contain",
                        }}
                      />
                    </Button>
                    {items.length - 1 !== index && (
                      <CustomIcon icon="add" iconColor="black" />
                    )}
                  </>
                );
              })}

              <FlexBox />
              <Typography variant="h6" sx={{ color: "black" }}>
                Total:{" "}
                <b>
                  RM
                  {(userPackage.packagePrice + userPackage.itemsPrice).toFixed(
                    2
                  )}
                </b>
              </Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  handleOpenDialog({
                    title: "Reselect Package",
                    description: "Are you sure you want to reselect package?",
                    onConfirm: () => {
                      removeUserPackage();
                      push(`/photos/${class_id}/${album_id}`);
                    },
                  });
                }}
              >
                Reselect Package
              </Button>
              <Button variant="contained" size="large" onClick={handleSave}>
                ADD TO CART
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default UserPackages;

interface UserPackagesState {
  userPackage: UserPackageData | undefined;
  setUserPackage: (userPackage: UserPackageData) => void;
  removeUserPackage: () => void;
}

export const useUserPackages = create<UserPackagesState>()(
  persist(
    (set) => ({
      userPackage: undefined,
      setUserPackage: (userPackage) =>
        set((state) => ({
          ...state,
          userPackage: { ...state.userPackage, ...userPackage },
        })),
      removeUserPackage: () => set({ userPackage: undefined }),
    }),
    {
      name: "user-package-storage", // unique name for localStorage key
      partialize: (state) => ({ userPackage: state.userPackage }), // only store userPackage
    }
  )
);
