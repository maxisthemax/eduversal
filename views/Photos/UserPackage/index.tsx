import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { useParams, usePathname, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//*lodash
import filter from "lodash/filter";

//*components
import { FlexBox } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";
import SelectPhotoDialog from "./SelectPhotoDialog";
import { useCustomDialog } from "@/components/Dialog";
import AddCartSuccessDialog from "@/views/Cart/AddCartSuccessDialog";

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
import {
  UserCourseAlbumData,
  UserCoursePackageData,
  useUserCourse,
} from "@/data/userCourse/course";
import { useCart } from "@/views/Cart";

export interface UserPackageData {
  packageId?: string;
  packageData?: UserCoursePackageData;
  albumData?: UserCourseAlbumData;
  currentStage?: number;
  firstStage?: number;
  packagePrice?: number;
  itemsPrice?: number;
  items?: UserPackageItemData[];
  cartId?: string;
}

export interface UserPackageAlbum {
  albumId: string;
  albumName: string;
  albumDescription: string;
  productTypeId: string;
  productTypeName: string;
  productType: string;
  productTypeDeliverable: boolean;
  productTypeCurrency: string;
  productTypePrice: number;
}
export interface UserPackageItemDataProductVariationOption {
  productVariationId: string;
  productVariationName: string;
  productVariationDescription: string;
  productVariationDownloadable: boolean;
  productVariationOptionId: string;
  productVariationOptionName: string;
  productVariationOptionPrice: number;
  productVariationOptionDescription: string;
  productVariationOptionPreviewUrl: string;
  productVariationOptionCurrency: string;
}

export interface UserPackageItemData {
  name: string;
  photoId: string;
  photoName: string;
  photoUrl: string;
  downloadUrl: string;
  album: UserPackageAlbum;
  productVariationOptions: UserPackageItemDataProductVariationOption[];
}

function UserPackages() {
  const [addedToCart, setAddedToCart] = useState(false);
  const path = usePathname();
  const { upsertCart } = useCart();
  const { handleOpenDialog } = useCustomDialog();
  const { class_id, album_id } = useParams();
  const { push } = useRouter();
  const { userPackage, setUserPackage } = useUserPackages();
  const { userCourseData } = useUserCourse(class_id as string);

  useEffect(() => {
    if (!userPackage) {
      push(`/photos/${class_id}`);
    }
    if (userPackage?.packageId === "none") {
    }
  }, [class_id, userPackage]);

  const packageData = userPackage?.packageData;
  const items = userPackage?.items;
  const album = packageData?.expandedAlbums[userPackage?.currentStage ?? 0];

  const handleSave = () => {
    if (
      userPackage.items.some((item) => item.photoId === "") // Fix typo in condition
    ) {
      toast.error("Please select all photos");
      return;
    } else {
      const cartId = userPackage?.cartId ?? uuidv4();
      setUserPackage(undefined);
      upsertCart({
        id: cartId,
        userPackage: {
          ...userPackage,
          cartId: cartId,
          currentStage: 0,
          firstStage: 0,
          items: filter(userPackage.items, ({ photoId }) => {
            return photoId !== "";
          }),
        },
        packageUrl: path,
        quantity: 1,
        institutionId: userCourseData.institution_id,
        institutionName: userCourseData.institution_name,
        academicYearId: userCourseData.academic_year_id,
        academicYearName: userCourseData.academic_year_name,
        standardId: userCourseData.course.standard.id,
        standardName: userCourseData.course.standard.name,
        courseId: userCourseData.course.id,
        courseName: userCourseData.course.name,
        price: userPackage.itemsPrice + userPackage.packagePrice,
        albumId: userPackage.items.map(({ album }) => {
          return album.albumId;
        }),
        totalPrice: (userPackage.itemsPrice + userPackage.packagePrice) * 1,
      });
      setAddedToCart(true);
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
          <b>
            {packageData.name}{" "}
            {packageData.is_downloadable ? `(Include SoftCopy)` : ""}
          </b>
        </Typography>
        <Typography variant="h6">Select {album.name}</Typography>
      </Stack>

      <Box sx={{ p: 2, background: "white" }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {album.photos.map((photo) => {
              const { id: photoId, display_url } = photo;
              return (
                <Grid
                  spacing={2}
                  key={photoId}
                  size={{
                    xs: album.product_type.type === "INDIVIDUAL" ? 6 : 6,
                    sm: album.product_type.type === "INDIVIDUAL" ? 6 : 6,
                    md: album.product_type.type === "INDIVIDUAL" ? 2 : 3,
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        p: 0,
                        border: "1px solid #f2f2f2",
                        display: "flex",
                        backgroundColor: "#f2f2f2",
                      }}
                    >
                      <Box
                        draggable={false}
                        component="img"
                        src={display_url ?? null}
                        sx={{
                          width: "100%",
                          aspectRatio: "1/1",
                          objectFit: "contain",
                          backgroundColor: "#f2f2f2",
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
        sx={{
          top: "auto",
          bottom: 0,
          background: "white",
          height: { xs: "180px", sm: "180px", md: "inherit" },
        }}
      >
        <Toolbar disableGutters>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", sm: "column", md: "row" }}
              spacing={1}
              sx={{
                height: "80px",
                pt: 2,
                pb: 2,
                width: "100%",
              }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: "center" }}
                spacing={{ xs: 0.5, sm: 0.5, md: 2 }}
              >
                {items.map((item, index) => {
                  if (!item) return null;
                  const { photoUrl } = item;

                  return (
                    <>
                      <Button
                        onClick={() => {
                          setUserPackage({ currentStage: index });
                        }}
                        sx={{
                          p: 0,
                          border:
                            index === userPackage.currentStage
                              ? "2px solid #006DEE"
                              : "2px solid #f2f2f2",
                          backgroundColor: "#f2f2f2",
                        }}
                      >
                        {photoUrl ? (
                          <Box
                            draggable={false}
                            component="img"
                            src={photoUrl ?? null}
                            sx={{
                              backgroundColor: "#f2f2f2",
                              height: { xs: "50px", sm: "50px", md: "80px" },
                              width: { xs: "50px", sm: "50px", md: "80px" },
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              backgroundColor: "#f2f2f2",
                              height: { xs: "50px", sm: "50px", md: "80px" },
                              width: { xs: "50px", sm: "50px", md: "80px" },
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </Button>
                      {items.length - 1 !== index && (
                        <CustomIcon icon="add" iconColor="black" />
                      )}
                    </>
                  );
                })}
              </Stack>

              <FlexBox />
              <Box
                sx={{
                  alignContent: "center",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ color: "black" }}>
                  <b>
                    Total: RM
                    {(
                      userPackage.packagePrice + userPackage.itemsPrice
                    ).toFixed(2)}
                  </b>
                </Typography>
              </Box>
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    handleOpenDialog({
                      title: "Reselect Package",
                      description: "Are you sure you want to reselect package?",
                      onConfirm: () => {
                        push(
                          `/photos/${class_id}/${album_id}/${userPackage.items[0].photoId}`
                        );
                      },
                    });
                  }}
                >
                  Reselect Package
                </Button>
                <Button variant="contained" size="large" onClick={handleSave}>
                  {userPackage.cartId ? "Edit" : "Add To Cart"}
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
      <AddCartSuccessDialog open={addedToCart} />
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
