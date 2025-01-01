import * as React from "react";

//*components
import { useCustomDialog } from "@/components/Dialog";

//*mui
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

//*data
import { useInstitutionTypes } from "@/data/admin/setting/institutionType";

export default function ChipsArray() {
  const {
    institutionTypesData,
    status,
    addInstitutionType,
    updateInstitutionType,
  } = useInstitutionTypes();
  const { handleOpenDialog } = useCustomDialog();

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography>Institution Type</Typography>
        {status === "pending" && <LinearProgress />}
        <Stack direction={"row"} gap={1} flexWrap={"wrap"}>
          <Chip
            label={"+ Add"}
            color="primary"
            onClick={() => {
              handleOpenDialog({
                allowOutsideClose: false,
                title: "Add Institution Type",
                textField: { id: "text", defaultValue: "" },
                onConfirm: async (name: string) => {
                  await addInstitutionType({ name });
                },
                placeholder: "Institution Type",
              });
            }}
          />
          {institutionTypesData.map(({ id, name }) => {
            return (
              <Chip
                key={id}
                label={name}
                onClick={() => {
                  handleOpenDialog({
                    allowOutsideClose: false,
                    title: "Update Institution Type",
                    textField: { id: "text", defaultValue: name },
                    onConfirm: async (name: string) => {
                      await updateInstitutionType(id, { name });
                    },
                    placeholder: "Institution Type",
                    fieldValue: name,
                  });
                }}
              />
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}
