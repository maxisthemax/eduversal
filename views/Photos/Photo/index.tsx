import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { formatDate } from "date-fns";

//*lodash
import find from "lodash/find";
import filter from "lodash/filter";
import uniqBy from "lodash/uniqBy";
import includes from "lodash/includes";
import sumBy from "lodash/sumBy";
import findIndex from "lodash/findIndex";

//*components
import { CustomIcon } from "@/components/Icons";
import { Page } from "@/components/Box";
import AddCartSuccessDialog from "@/views/Cart/AddCartSuccessDialog";

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

//*interface
import {
  ProductVariationData,
  ProductVariationOption,
} from "@/data/admin/productVariation";

function PhotoCotent() {
  const [addedToCart, setAddedToCart] = useState(false);
  const path = usePathname();
  const { push } = useRouter();
  const { upsertCart } = useCart();
  const { class_id, album_id, photo_id } = useParams();
  const { userCourseData, status } = useUserCourse(class_id as string);
  const { userPackage, setUserPackage } = useUserPackages();
  const [mandatoryField, setMandatoryField] = useState([]);

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
      is_downloadable: false,
      preview_url: "",
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
    productVariation?: ProductVariationData,
    option?: ProductVariationOption
  ) => {
    const items = userPackage.items;

    // Then add the new option
    items[userPackage?.firstStage ?? 0].productVariationOptions = filter(
      uniqBy(
        [
          {
            productVariationName: productVariation.name,
            productVariationId: productVariation.id,
            productVariationDescription: productVariation.description,
            productVariationDownloadable: productVariation.is_downloadable,
            productVariationOptionId: option?.id ?? undefined,
            productVariationOptionName: option?.name ?? undefined,
            productVariationOptionCurrency: option?.currency ?? undefined,
            productVariationOptionPrice: option?.price ?? 0,
            productVariationOptionDescription: option?.description ?? undefined,
            productVariationOptionPreviewUrl: option?.preview_url ?? undefined,
          },
          ...items[userPackage?.firstStage ?? 0].productVariationOptions,
        ],
        "productVariationId"
      ),
      ({ productVariationOptionId }) => {
        return productVariationOptionId !== undefined;
      }
    );

    setUserPackage({
      itemsPrice: sumBy(
        items[userPackage?.firstStage ?? 0].productVariationOptions,
        "productVariationOptionPrice"
      ),
      items,
    });
    handleCheckMandatory();
  };

  const handleUserPackageName = (name: string) => {
    const items = userPackage.items;
    items[userPackage?.firstStage ?? 0].name = name;
    setUserPackage({
      items,
    });
  };

  const handleSave = () => {
    const check = handleCheckMandatory();
    if (check) return;

    if (userPackage.packageId !== "none") {
      const expandedAlbums = [...userPackage.packageData.expandedAlbums];
      const matchIndex = findIndex(expandedAlbums, {
        id: userPackage.items[userPackage?.firstStage ?? 0].album.albumId,
      });

      const items = [
        ...expandedAlbums.map((album) => ({
          downloadUrl: "",
          photoUrl: "",
          name: userPackage?.items[userPackage?.firstStage ?? 0]?.name,
          photoName: "",
          photoId: "",
          album: {
            albumDescription: album.description,
            albumId: album.id,
            albumName: album.name,
            productType: album.product_type.type,
            productTypeId: album.product_type.id,
            productTypeName: album.product_type.name,
            productTypeDeliverable: album.product_type.is_deliverable,
            productTypeCurrency: album.product_type.currency,
            productTypePrice: album.product_type.price,
          },
          productVariationOptions: [],
        })),
      ];
      items[matchIndex] = userPackage.items[userPackage?.firstStage ?? 0];

      setUserPackage({
        firstStage: matchIndex,
        currentStage:
          findIndex(items, { photoId: "" }) < 0
            ? 0
            : findIndex(items, { photoId: "" }),
        items,
      });
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
          firstStage: 0,
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
        albumId: userPackage.items.map(({ album }) => {
          return album.albumId;
        }),
        price: userPackage.itemsPrice + userPackage.packagePrice,
        totalPrice: (userPackage.itemsPrice + userPackage.packagePrice) * 1,
      });
      setAddedToCart(true);
    }
  };

  const handleCheckMandatory = () => {
    const mandatoryProductVariations = filter(
      album.albumProductVariations,
      "mandatory"
    );
    const missingProductVariations = filter(
      mandatoryProductVariations,
      ({ productVariation }) => {
        return !find(
          userPackage.items[userPackage?.firstStage ?? 0]
            .productVariationOptions,
          {
            productVariationId: productVariation.id,
          }
        );
      }
    );

    setMandatoryField(
      missingProductVariations.map(
        ({ productVariation_id }) => productVariation_id
      )
    );

    if (missingProductVariations.length > 0) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!userPackage) {
      push(`/photos/${class_id}`);
    }
  }, [class_id, userPackage]);

  if (!userPackage) return <></>;

  return (
    <Container maxWidth="lg">
      <Page
        isLoading={status === "pending"}
        links={[
          { href: "/photos", title: "Class" },
          {
            href: `/photos/${class_id}`,
            title: "Albums",
          },
          {
            href: `/photos/${class_id}/${album_id}`,
            title: "Photos",
          },
          {
            href: `/photos/${class_id}/${album_id}/${photo_id}`,
            title: photo.name,
          },
        ]}
      >
        <Paper
          sx={{ p: { xs: 2, sm: 2, md: 4 }, height: "100%" }}
          elevation={0}
        >
          <Grid container>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
              sx={{
                justifyContent: "start",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {userPackage?.packageId === "none" ? (
                <Paper
                  variant="elevation"
                  elevation={0}
                  component="img"
                  src={photo.display_url}
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "contain",
                    backgroundColor: "#f2f2f2",
                  }}
                />
              ) : find(albumPackage, { id: userPackage?.packageId })
                  .preview_url ? (
                <Paper
                  variant="elevation"
                  elevation={0}
                  component="img"
                  src={
                    find(albumPackage, { id: userPackage?.packageId })
                      .preview_url
                  }
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "contain",
                    backgroundColor: "#f2f2f2",
                  }}
                />
              ) : (
                <Paper
                  variant="elevation"
                  elevation={0}
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "contain",
                    backgroundColor: "#f2f2f2",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h4">
                    {find(albumPackage, { id: userPackage?.packageId }).name}
                  </Typography>
                </Paper>
              )}
              <Box
                sx={{
                  backgroundColor: "#f2f2f2",
                  p: 2,
                  mt: 2,
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  Description
                </Typography>
                <Typography
                  component={"span"}
                  sx={{ whiteSpace: "break-spaces" }}
                  variant="body2"
                >
                  {album.description}
                </Typography>
              </Box>
              <Stack sx={{ pt: 2 }} direction={"row"} gap={2} flexWrap={"wrap"}>
                {albumPackage.map(({ preview_url, id, name }) => {
                  return (
                    <Button
                      variant="outlined"
                      key={id}
                      sx={{
                        p: 0,
                        border:
                          userPackage?.packageId === id
                            ? "2px solid #006DEE"
                            : "2px solid #f2f2f2",
                      }}
                      onClick={() => {
                        handlePackage(id);
                      }}
                    >
                      {id === "none" ? (
                        <Box
                          component="img"
                          sx={{
                            width: "100px",
                            height: "100px",
                            objectFit: "contain",
                            ":hover": { backgroundColor: "#d9d9d9" },
                            backgroundColor: "#f2f2f2",
                          }}
                          src={photo.display_url}
                        />
                      ) : preview_url ? (
                        <Box
                          component="img"
                          sx={{
                            width: "100px",
                            height: "100px",
                            objectFit: "contain",
                            ":hover": { backgroundColor: "#d9d9d9" },
                            backgroundColor: "#f2f2f2",
                          }}
                          src={preview_url}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100px",
                            height: "100px",
                            ":hover": { backgroundColor: "#d9d9d9" },
                            backgroundColor: "#f2f2f2",
                            alignContent: "center",
                          }}
                        >
                          <Typography color="black" variant="caption">
                            {name}
                          </Typography>
                        </Box>
                      )}
                    </Button>
                  );
                })}
              </Stack>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
              sx={{ wordBreak: "break-word" }}
            >
              <Stack
                sx={{
                  px: { xs: 0, sm: 0, md: 4 },
                  pt: { xs: 2, sm: 2, md: 0 },
                }}
                spacing={2}
              >
                <Box>
                  <Typography variant="body2">{album.name}</Typography>
                  <Typography
                    sx={{ fontSize: "28px", overflowWrap: "break-word" }}
                  >
                    <b>{photo.name}</b>
                  </Typography>
                  <Typography variant="h6" color="primary">
                    RM{" "}
                    {(
                      userPackage.packagePrice + userPackage.itemsPrice
                    ).toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    Available until{" "}
                    {formatDate(userCourseData.course.end_date, "dd MMM yyyy")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1" gutterBottom>
                    {"Child's Name"}
                  </Typography>
                  <TextField
                    value={
                      userPackage.items[userPackage?.firstStage ?? 0]?.name
                    }
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
                  (
                    {
                      productVariation,
                      mandatory,
                      productVariation_id,
                      disabled_options,
                    },
                    index
                  ) => {
                    return (
                      <Box key={index}>
                        <ListItemText
                          primary={
                            productVariation.name +
                            `${
                              productVariation.is_downloadable
                                ? " (Includes Soft Copy)"
                                : ""
                            }` +
                            (mandatory ? " *" : "")
                          }
                          sx={
                            includes(mandatoryField, productVariation_id)
                              ? { color: "#E74D3C" }
                              : {}
                          }
                        />
                        <TextField
                          error={includes(mandatoryField, productVariation_id)}
                          helperText={
                            includes(mandatoryField, productVariation_id)
                              ? "Required"
                              : ""
                          }
                          value={
                            find(
                              userPackage.items[userPackage?.firstStage ?? 0]
                                .productVariationOptions,
                              {
                                productVariationId: productVariation.id,
                              }
                            )?.productVariationOptionId
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
                                productVariation,
                                null
                              );
                            }}
                          >
                            <ListItemText primary={`None`} />
                          </MenuItem>
                          {productVariation.options
                            .filter(({ id }) => {
                              return !includes(disabled_options, id);
                            })
                            .map((option) => {
                              const {
                                id,
                                name,
                                price_format,
                                description,
                                preview_url,
                              } = option;

                              return (
                                <MenuItem
                                  key={id}
                                  value={id}
                                  onClick={() => {
                                    handleProductVariationOption(
                                      productVariation,
                                      option
                                    );
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    sx={{ alignItems: "center" }}
                                    spacing={2}
                                  >
                                    {preview_url && (
                                      <Box
                                        component="img"
                                        src={preview_url}
                                        height={40}
                                      />
                                    )}
                                    <ListItemText
                                      primary={`${name} - ${price_format}`}
                                      secondary={description}
                                    />
                                  </Stack>
                                </MenuItem>
                              );
                            })}
                        </TextField>
                      </Box>
                    );
                  }
                )}
                <Box sx={{ width: "100%" }}>
                  <Typography variant="body1" gutterBottom>
                    {"Packages"}
                  </Typography>
                  <Stack direction={"column"} spacing={2}>
                    {albumPackage.map(
                      ({
                        id,
                        name,
                        price_format,
                        package_type_format,
                        is_downloadable,
                      }) => {
                        return (
                          <Button
                            key={id}
                            fullWidth
                            variant="outlined"
                            sx={{
                              p: 2,
                              justifyContent: "space-between",
                              textAlign: "start",
                              border:
                                userPackage?.packageId === id
                                  ? "2px solid #006DEE"
                                  : "2px solid #E0E0E0",

                              color:
                                userPackage?.packageId === id
                                  ? "#006DEE"
                                  : "black",
                            }}
                            onClick={() => {
                              handlePackage(id);
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ alignItems: "center" }}
                            >
                              <CustomIcon icon="check_circle" />
                              <ListItemText
                                sx={{ justifyItems: "start" }}
                                primary={
                                  name +
                                  (is_downloadable
                                    ? " (Includes Soft Copy)"
                                    : "")
                                }
                                secondary={package_type_format}
                              />
                            </Stack>
                            <Typography
                              variant="body1"
                              sx={{ whiteSpace: "nowrap" }}
                            >
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
                    backgroundColor: "white",
                  }}
                  direction="row"
                >
                  <Button variant="contained" onClick={handleSave} fullWidth>
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
        </Paper>
      </Page>
      <AddCartSuccessDialog open={addedToCart} />
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
