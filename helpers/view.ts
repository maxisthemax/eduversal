//*material
import theme from "../theme";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * To get is mobile view
 */

export const useGetIsMobileSize = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return isMobile;
};
