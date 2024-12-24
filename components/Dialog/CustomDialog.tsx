import { useEffect, useState } from "react";
import { create } from "zustand";

//*mui
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import MenuItem from "@mui/material/MenuItem";

//*interface
interface DialogProps {
  textField?:
    | { id: "text"; defaultValue?: string }
    | { id: "number"; defaultValue?: number }
    | {
        id: "select";
        selectField?: { name: string; value: string }[];
        defaultValue?: string;
      };
  placeholder?: string;
  allowClose?: boolean;
  allowOutsideClose?: boolean;
  title?: string;
  description?: string;
  onConfirm?:
    | ((
        value: string | number | undefined
      ) => Promise<void | boolean> | (void | boolean))
    | undefined;
  content?: React.ReactNode | React.ReactNode[];
  fieldValue?: string;
}

interface DialogState {
  open: boolean;
  dialogProps: DialogProps;
  handleOpenDialog: (dialogProps: DialogProps) => void;
  handleCloseDialog: () => void;
}

function CustomDialog() {
  const textField = useCustomDialog((state) => state.dialogProps.textField);
  const allowClose = useCustomDialog((state) => state.dialogProps.allowClose);
  const allowOutsideClose = useCustomDialog(
    (state) => state.dialogProps.allowOutsideClose
  );
  const placeholder = useCustomDialog((state) => state.dialogProps.placeholder);
  const open = useCustomDialog((state) => state.open);
  const title = useCustomDialog((state) => state.dialogProps.title);
  const content = useCustomDialog((state) => state.dialogProps.content);
  const description = useCustomDialog((state) => state.dialogProps.description);
  const onConfirm = useCustomDialog((state) => state.dialogProps.onConfirm);
  const handleCloseDialog = useCustomDialog((state) => state.handleCloseDialog);
  const fieldValue = useCustomDialog((state) => state.dialogProps.fieldValue);

  //*states
  const [isConfirming, setIsConfirming] = useState(false);
  const [value, setValue] = useState<string | number | undefined>();

  //*useEffect
  useEffect(() => {
    if (fieldValue) setValue(fieldValue);
  }, [fieldValue]);

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={() => {
        if (isConfirming) return;
        if (allowOutsideClose) {
          setValue(undefined);
          handleCloseDialog();
        }
      }}
      keepMounted={false}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && <DialogContentText>{description}</DialogContentText>}
        {content ? content : <></>}

        {textField?.id === "text" && (
          <>
            <Box p={1} />
            <TextField
              disabled={isConfirming}
              type="string"
              defaultValue={textField.defaultValue}
              placeholder={placeholder}
              variant="standard"
              onChange={(e) => {
                if (e.target.value !== "") setValue(e.target.value);
                else setValue(undefined);
              }}
            />
          </>
        )}

        {textField?.id === "number" && (
          <>
            <Box p={1} />
            <TextField
              disabled={isConfirming}
              type="number"
              defaultValue={textField.defaultValue}
              placeholder={placeholder}
              variant="standard"
              onChange={(e) => {
                if (e.target.value !== "") setValue(e.target.value);
                else setValue(undefined);
              }}
            />
          </>
        )}

        {textField?.id === "select" && (
          <>
            <Box p={1} />
            <TextField
              select={true}
              disabled={isConfirming}
              placeholder={placeholder}
              variant="standard"
              onChange={(e) => {
                setValue(e.target.value);
              }}
              defaultValue={textField.defaultValue}
            >
              {textField.selectField.map(({ value, name }) => {
                return (
                  <MenuItem key={value} value={value}>
                    {name}
                  </MenuItem>
                );
              })}
            </TextField>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {allowClose && (
          <Button
            disabled={isConfirming}
            onClick={() => {
              handleCloseDialog();
              setValue(undefined);
            }}
          >
            Cancel
          </Button>
        )}
        <LoadingButton
          disabled={
            (textField ||
              (textField?.id === "select" &&
                textField.selectField &&
                textField.selectField?.length > 0)) &&
            value === undefined
          }
          variant="contained"
          loading={isConfirming}
          onClick={async () => {
            if (onConfirm) {
              try {
                setIsConfirming(true);
                const res = await onConfirm(value);
                setIsConfirming(false);
                if (res === undefined || res) {
                  handleCloseDialog();
                  setValue(undefined);
                }
              } catch (error) {
                console.error("Confirmation failed:", error);
                setIsConfirming(false);
              }
            }
          }}
        >
          OK
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

const defaultValue = {
  title: "Are you sure?",
  description: "",
  placeholder: "",
  textField: undefined,
  allowClose: true,
  allowOutsideClose: true,
};

export const useCustomDialog = create<DialogState>((set) => ({
  open: false,
  dialogProps: defaultValue,
  handleOpenDialog: (dialogProps: DialogProps) =>
    set((state) => ({
      ...state,
      open: true,
      dialogProps: { ...state.dialogProps, ...dialogProps },
    })),
  handleCloseDialog: () =>
    set(() => ({
      ...defaultValue,
      dialogProps: defaultValue,
      open: false,
    })),
}));

export default CustomDialog;
