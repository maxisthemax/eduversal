import { useState } from "react";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";

//*lodash
import sumBy from "lodash/sumBy";
import uniqBy from "lodash/uniqBy";
import find from "lodash/find";

//*material
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

//*data
import { useUserPackages } from ".";
import {
  UserCourseAlbumData,
  UserCoursePhotoData,
} from "@/data/userCourse/course";

function SelectPhotoDialog({
  album,
  photo,
}: {
  photo?: UserCoursePhotoData;
  album?: UserCourseAlbumData;
  children?: React.ReactNode;
}) {
  //*define
  const { userPackage } = useUserPackages();
  const popupState = usePopupState({ variant: "dialog" });
  const mode =
    userPackage.items[userPackage.currentStage].photoId === photo?.id
      ? "edit"
      : "add";

  return (
    <>
      <Button
        variant={mode === "edit" ? "contained" : "outlined"}
        {...bindTrigger(popupState)}
      >
        {mode === "edit" ? "Edit" : "Select"}
      </Button>
      <Dialog
        {...bindDialog(popupState)}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        disableEnforceFocus={true}
        onClose={() => {
          popupState.close();
        }}
      >
        <SelectPhotoDialogForm
          photo={photo}
          album={album}
          mode={mode}
          handleClose={() => popupState.close()}
        />
      </Dialog>
    </>
  );
}

export default SelectPhotoDialog;

function SelectPhotoDialogForm({
  album,
  photo,
  mode = "add",
  handleClose,
}: {
  mode?: "add" | "edit";
  photo?: UserCoursePhotoData;
  album?: UserCourseAlbumData;
  children?: React.ReactNode;
  handleClose: () => void;
}) {
  const { userPackage, setUserPackage } = useUserPackages();
  const item =
    mode === "edit"
      ? userPackage?.items[userPackage.currentStage]
      : {
          name: photo.name,
          photoId: photo.id,
          albumId: album.id,
          display_url: photo.display_url,
          productVariationOptions: [],
        };
  const [productVariationOptions, setProductVariationOptions] = useState<
    {
      productVariationId: string;
      productVariationOptionId: string;
      name: string;
      price: number;
    }[]
  >(item.productVariationOptions);

  const handleProductVariationOption = () => {
    const items = userPackage.items;

    items[userPackage.currentStage] = {
      ...item,
      productVariationOptions,
    };

    setUserPackage({
      currentStage:
        userPackage.items.length - 1 !== userPackage.currentStage &&
        items[userPackage.currentStage + 1].photoId === ""
          ? userPackage.currentStage + 1
          : userPackage.currentStage,
      itemsPrice: sumBy(items, (item) =>
        item.productVariationOptions.reduce(
          (acc, option) => acc + option.price,
          0
        )
      ),
      items,
    });
    handleClose();
  };

  return (
    <>
      <DialogContent>
        <Stack direction="row" spacing={2}>
          <Box
            component="img"
            src={item.display_url}
            sx={{
              backgroundColor: "grey.300",
              height: "200px",
              aspectRatio: "2/3",
              objectFit: "cover",
            }}
          />
          <Stack direction="column" spacing={1}>
            <Typography variant="body2">{album.name}</Typography>
            <Typography variant="body1">
              <b>{photo.name}</b>
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ mt: 3, mb: 3 }} />
        <Stack spacing={2}>
          {album.albumProductVariations.map(({ productVariation }, index) => {
            return (
              <Box key={index}>
                <ListItemText
                  primary={
                    productVariation.name +
                    `${
                      productVariation.is_downloadable ? " (Downloadable)" : ""
                    }`
                  }
                  secondary={productVariation.description}
                />
                <TextField
                  value={
                    find(productVariationOptions, {
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
                      setProductVariationOptions(
                        productVariationOptions.filter(
                          (option) =>
                            option.productVariationId !== productVariation.id
                        )
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
                            setProductVariationOptions(
                              uniqBy(
                                [
                                  ...productVariationOptions,
                                  {
                                    productVariationId: productVariation.id,
                                    productVariationOptionId: id,
                                    name,
                                    price,
                                  },
                                ],
                                "productVariationId"
                              )
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
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Back
        </Button>
        <Button variant="contained" onClick={handleProductVariationOption}>
          OK
        </Button>
      </DialogActions>
    </>
  );
}
