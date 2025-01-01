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
import { useStandard } from "@/data/admin/setting/standard";

export default function ChipsArray() {
  const {
    institutionTypesData,
    status: institutionTypesStatus,
    addInstitutionType,
    updateInstitutionType,
  } = useInstitutionTypes();
  const {
    standardsData,
    status: standardStatus,
    addStandard,
    updateStandard,
  } = useStandard();
  const { handleOpenDialog } = useCustomDialog();

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography>Institution Type</Typography>
        {institutionTypesStatus === "pending" && <LinearProgress />}
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
      <Stack spacing={1}>
        <Typography>Standard</Typography>
        {standardStatus === "pending" && <LinearProgress />}
        <Stack direction={"row"} gap={1} flexWrap={"wrap"}>
          <Chip
            label={"+ Add"}
            color="primary"
            onClick={() => {
              handleOpenDialog({
                allowOutsideClose: false,
                title: "Add Standard",
                textField: { id: "text", defaultValue: "" },
                onConfirm: async (name: string) => {
                  await addStandard({ name });
                },
                placeholder: "Standard",
              });
            }}
          />
          {standardsData.map(({ id, name }) => {
            return (
              <Chip
                key={id}
                label={name}
                onClick={() => {
                  handleOpenDialog({
                    allowOutsideClose: false,
                    title: "Update Standard",
                    textField: { id: "text", defaultValue: name },
                    onConfirm: async (name: string) => {
                      await updateStandard(id, { name });
                    },
                    placeholder: "Standard",
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
