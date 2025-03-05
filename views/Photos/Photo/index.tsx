import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

//*lodash
import find from "lodash/find";
import filter from "lodash/filter";
import uniqBy from "lodash/uniqBy";
import includes from "lodash/includes";
import sumBy from "lodash/sumBy";
import findIndex from "lodash/findIndex";

//*components
import { CustomIcon } from "@/components/Icons";
import { FlexBox, Page } from "@/components/Box";

//*mui
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

//*data
import { useUserCourse } from "@/data/userCourse/course";
import { useUserPackages } from "../UserPackage";
import { useCart } from "@/views/Cart";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

function PhotoCotent() {
  const path = usePathname();
  const { push } = useRouter();
  const { upsertCart } = useCart();
  const { class_id, album_id, photo_id } = useParams();
  const { userCourseData, status } = useUserCourse(class_id as string);
  const { userPackage, setUserPackage } = useUserPackages();

  //*const
  const album = find(userCourseData.course.albums, {
    id: album_id as string,
  });
  const photo = album.photos.find((photo) => {
    return photo.id === photo_id;
  });
  const albumPackage = [
    {
      id: "none",
      name: "No Package",
      price: album.product_type.price,
      price_format: `RM ${album.product_type.price.toFixed(2)}`,
      package_type_format: "",
    },
    ...userCourseData.course.package.filter(({ packageAlbums }) => {
      return includes(
        packageAlbums.map(({ album_id }) => album_id),
        album_id as string
      );
    }),
  ];

  //*function
  const handlePackage = (packageId: string) => {
    setUserPackage({
      packageId,
      packageData: find(userCourseData.course.package, { id: packageId }),
      packagePrice:
        find(userCourseData.course.package, { id: packageId })?.price ??
        album.product_type.price,
    });
  };

  const handleProductVariationOption = (
    productVariationId: string,
    productVariationOptionId: string | null,
    name?: string,
    price?: number
  ) => {
    const items = userPackage.items;

    // Then add the new option
    items[0].productVariationOptions = filter(
      uniqBy(
        [
          {
            productVariationId,
            productVariationOptionId,
            name: name || "",
            price: price || 0,
          },
          ...items[0].productVariationOptions,
        ],
        "productVariationId"
      ),
      ({ productVariationOptionId }) => {
        return productVariationOptionId !== null;
      }
    );

    setUserPackage({
      itemsPrice: sumBy(items[0].productVariationOptions, "price"),
      items,
    });
  };

  const handleUserPackageName = (name: string) => {
    const items = userPackage.items;
    items[0].name = name;
    setUserPackage({
      items,
    });
  };

  const handleSave = () => {
    if (userPackage.packageId !== "none") {
      const expandedAlbums = [...userPackage.packageData.expandedAlbums];
      const matchIndex = findIndex(expandedAlbums, {
        id: userPackage.items[0].albumId,
      });

      if (matchIndex !== -1) {
        expandedAlbums.splice(matchIndex, 1);
      }

      const items = [
        userPackage.items[0],
        ...expandedAlbums.map(({ id }) => ({
          albumId: id,
          display_url: "",
          name: "",
          photoId: "",
          productVariationOptions: [],
        })),
      ];
      setUserPackage({ currentStage: 1, items });
      push(`/photos/${class_id}/${album_id}/${photo_id}/package`);
    } else {
      setUserPackage(undefined);
      const cartId = uuidv4();
      upsertCart({
        id: userPackage?.cartId ?? cartId,
        userPackage: {
          ...userPackage,
          cartId: userPackage?.cartId ?? cartId,
          currentStage: 0,
          items: filter(userPackage.items, ({ photoId }) => {
            return photoId !== "";
          }),
          albumData: album,
        },
        packageUrl: path,
        quantity: 1,
      });
      push(`/cart`);
    }
  };

  useEffect(() => {
    if (!userPackage) {
      push(`/photos/${class_id}`);
    }
  }, [class_id, userPackage]);

  if (!userPackage) return <></>;

  return (
    <Container maxWidth="xl">
      <Page
        isLoading={status === "pending"}
        disabledLinkButton={true}
        links={[
          { href: "/photos", title: "Class" },
          {
            href: `/photos/${class_id}`,
            title: "Albums",
          },
          {
            href: `/photos/${class_id}/${album_id}`,
            title: "Photo",
          },
        ]}
      >
        <Grid container>
          <Grid
            size={{ xs: 6 }}
            component={Paper}
            sx={{
              justifyContent: "center",
              display: "flex",
              height: getFullHeightSize(15),
            }}
            variant="outlined"
          >
            <Paper
              variant="outlined"
              component="img"
              src={photo.display_url ?? null}
              sx={{
                height: "100%",
                aspectRatio: "2/3",
                objectFit:
                  album.product_type.type === "INDIVIDUAL"
                    ? "cover"
                    : "contain",
              }}
            />
          </Grid>
          <Grid
            size={{ xs: 6 }}
            sx={{ height: getFullHeightSize(15), overflow: "auto" }}
          >
            <Stack sx={{ pl: 4, pr: 4 }} spacing={2}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  {album.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <b>{photo.name}</b>
                </Typography>
                <Typography variant="body1" color="primary" gutterBottom>
                  RM{" "}
                  {(userPackage.packagePrice + userPackage.itemsPrice).toFixed(
                    2
                  )}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  {"Child's Name"}
                </Typography>
                <TextField
                  value={userPackage.items[0]?.name}
                  select
                  onChange={(event) => {
                    handleUserPackageName(event.target.value);
                  }}
                >
                  {userCourseData.names.map((name) => {
                    return (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Box>
              {album.albumProductVariations.map(
                ({ productVariation }, index) => {
                  return (
                    <Box key={index}>
                      <ListItemText
                        primary={
                          productVariation.name +
                          `${
                            productVariation.is_downloadable
                              ? " (Downloadable)"
                              : ""
                          }`
                        }
                        secondary={productVariation.description}
                      />

                      <TextField
                        value={
                          find(userPackage.items[0].productVariationOptions, {
                            productVariationId: productVariation.id,
                          })?.productVariationOptionId
                        }
                        select
                        slotProps={{
                          select: {
                            displayEmpty: true,
                            defaultValue: undefined,
                          },
                        }}
                      >
                        <MenuItem
                          value={undefined}
                          onClick={() => {
                            handleProductVariationOption(
                              productVariation.id,
                              null
                            );
                          }}
                        >
                          <ListItemText primary={`None`} />
                        </MenuItem>
                        {productVariation.options.map(
                          ({ id, name, price_format, price, description }) => {
                            return (
                              <MenuItem
                                key={id}
                                value={id}
                                onClick={() => {
                                  handleProductVariationOption(
                                    productVariation.id,
                                    id,
                                    name,
                                    price
                                  );
                                }}
                              >
                                <ListItemText
                                  primary={`${name} - ${price_format}`}
                                  secondary={description}
                                />
                              </MenuItem>
                            );
                          }
                        )}
                      </TextField>
                    </Box>
                  );
                }
              )}
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" gutterBottom>
                  {"Packages"}
                </Typography>
                <Stack direction={"column"} spacing={2}>
                  {albumPackage.map(
                    ({ id, name, price_format, package_type_format }) => {
                      return (
                        <Button
                          key={id}
                          fullWidth
                          variant="outlined"
                          sx={{ p: 2, justifyContent: "space-between" }}
                          onClick={() => {
                            handlePackage(id);
                          }}
                          color={
                            userPackage?.packageId === id
                              ? "primary"
                              : "inherit"
                          }
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center" }}
                          >
                            <CustomIcon icon="check_circle" />
                            <ListItemText
                              sx={{ justifyItems: "start" }}
                              primary={name}
                              secondary={package_type_format}
                            />
                          </Stack>
                          <Typography variant="body1" gutterBottom>
                            {price_format}
                          </Typography>
                        </Button>
                      );
                    }
                  )}
                </Stack>
              </Box>
              <Stack
                sx={{
                  width: "100%",
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "white",
                  pt: 1,
                }}
                spacing={2}
                direction="row"
              >
                <FlexBox />
                <Button
                  variant="outlined"
                  onClick={() => {
                    push(`/photos/${class_id}/${album_id}`);
                  }}
                >
                  Back
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  {userPackage.cartId
                    ? "Edit"
                    : userPackage.packageId === "none"
                    ? "Add To Cart"
                    : "Next"}
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Page>
    </Container>
  );
}

function Photo() {
  const { class_id } = useParams();
  const { status } = useUserCourse(class_id as string);

  if (status === "pending") return <LinearProgress />;
  return <PhotoCotent />;
}

export default Photo;
