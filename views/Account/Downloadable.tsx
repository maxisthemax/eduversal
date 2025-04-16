import { useState } from "react";

//*components
import { OverlayBox, Page } from "@/components/Box";
import { CustomIcon } from "@/components/Icons";

//*mui
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

//*utils
import { useUser } from "@/data/user";

//*utils
import axios from "@/utils/axios";

function Downloadable() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { data } = useUser();

  return (
    <Page
      title="Downloadable Content"
      subtitle="Access and Manage Your Resources"
    >
      <OverlayBox isLoading={isDownloading}>
        <Grid container spacing={2}>
          {data.download_images?.map((item, index) => (
            <Grid
              size={{
                xs: 2.5,
              }}
              key={index}
              sx={{
                textAlign: "center",
              }}
            >
              <Stack
                spacing={1}
                sx={{ justifyContent: "space-between", height: "100%" }}
              >
                <Box
                  component="img"
                  src={`${item.photoUrl}`}
                  alt={item.photoUrl}
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "contain",
                    backgroundColor: "#f2f2f2",
                  }}
                />
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <b>{item.photoName}</b>
                  </Typography>
                  <Button
                    startIcon={<CustomIcon icon="download" />}
                    size="large"
                    variant="outlined"
                    onClick={async () => {
                      setIsDownloading(true);
                      try {
                        const res = await axios.get(
                          `user/downloadPhoto?fileKey=${item.downloadUrl}`
                        );
                        const link = document.createElement("a");
                        link.href = res.data.url;
                        link.download = item.photoName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setIsDownloading(false);
                      } catch (error) {
                        console.error(error);
                        setIsDownloading(false);
                      }
                    }}
                  >
                    Download
                  </Button>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </OverlayBox>
    </Page>
  );
}
export default Downloadable;
