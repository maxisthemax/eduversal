//*components
import useUpload from "@/components/useUpload";
import NoAccess from "@/components/Box/NoAccess";

//*mui
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";
import { useGetStaffAccess } from "@/data/admin/user/staff";

function Banner() {
  const access = useGetStaffAccess("setting_banner");
  const image = `https://${process.env.NEXT_PUBLIC_DO_SPACES_URL}/banner/banner_img`;

  const { getRootProps, getInputProps, handleUpload, files, setFiles } =
    useUpload("banner");

  if (!access.view) return <NoAccess />;

  return (
    <Box sx={{ height: getFullHeightSize(22), p: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, height: "inherit" }}>
        <Box
          component="img"
          draggable={false}
          src={files.length > 0 ? URL.createObjectURL(files[0]) : image}
          alt={files[0]?.name}
          sx={{
            display: "block",
            width: "100%",
            height: "inherit",
            objectFit: "contain",
          }}
        />
      </Paper>
      <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
        {access.edit && (
          <Box
            {...getRootProps()}
            sx={{
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            {files.length > 0 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setFiles([])}
              >
                Re-Select
              </Button>
            ) : (
              <Button variant="contained" color="primary">
                Select Files
              </Button>
            )}
          </Box>
        )}
        {files.length > 0 && (
          <Button
            onClick={async () => {
              await handleUpload("banner_img");
              window.location.reload();
            }}
          >
            Upload
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default Banner;
