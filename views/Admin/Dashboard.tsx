import { useState } from "react";
import {
  endOfMonth,
  endOfYear,
  getMonth,
  getYear,
  startOfMonth,
  startOfYear,
} from "date-fns";

//*lodash
import startCase from "lodash/startCase";

//*components
import { FlexBox, Page } from "@/components/Box";
import YearAndMonthPopover from "@/components/YearAndMonthPopover";
import YearPopover from "@/components/YearPopover";

//*mui
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

function Dashboard() {
  const [dateType, setDateType] = useState({
    sales: "month",
    institutions: "month",
    users: "month",
  });

  const [totalSaleDate, setTotalSaleDate] = useState(new Date());
  const [totalInstitutionDate, setTotalInstitutionDate] = useState(new Date());
  const [totalUsersDate, setTotalUsersDate] = useState(new Date());

  const getTotalSale = useQueryFetch(
    dateType.sales === "month"
      ? [
          "dashboard",
          "getTotalSale",
          getYear(totalSaleDate),
          getMonth(totalSaleDate),
        ]
      : ["dashboard", "getTotalSale", getYear(totalSaleDate)],
    dateType.sales === "month"
      ? `admin/dashboard/getTotalSale?from_date=${startOfMonth(
          totalSaleDate
        )}&to_date=${endOfMonth(totalSaleDate)}`
      : `admin/dashboard/getTotalSale?from_date=${startOfYear(
          totalSaleDate
        )}&to_date=${endOfYear(totalSaleDate)}`
  );

  const getTotalInstitution = useQueryFetch(
    dateType.institutions === "month"
      ? [
          "dashboard",
          "getTotalInstitution",
          getYear(totalInstitutionDate),
          getMonth(totalInstitutionDate),
        ]
      : ["dashboard", "getTotalInstitution", getYear(totalInstitutionDate)],
    dateType.institutions === "month"
      ? `admin/dashboard/getTotalInstitution?from_date=${startOfMonth(
          totalInstitutionDate
        )}&to_date=${endOfMonth(totalInstitutionDate)}`
      : `admin/dashboard/getTotalInstitution?from_date=${startOfYear(
          totalInstitutionDate
        )}&to_date=${endOfYear(totalInstitutionDate)}`
  );

  const getTotalUsers = useQueryFetch(
    dateType.users === "month"
      ? [
          "dashboard",
          "getTotalUsers",
          getYear(totalUsersDate),
          getMonth(totalUsersDate),
        ]
      : ["dashboard", "getTotalUsers", getYear(totalUsersDate)],
    dateType.users === "month"
      ? `admin/dashboard/getTotalUsers?from_date=${startOfMonth(
          totalUsersDate
        )}&to_date=${endOfMonth(totalUsersDate)}`
      : `admin/dashboard/getTotalUsers?from_date=${startOfYear(
          totalUsersDate
        )}&to_date=${endOfYear(totalUsersDate)}`
  );

  return (
    <Page title="Dashboard">
      <Box sx={{ pt: 2 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "140px" }}>
              <Stack sx={{ justifyContent: "space-between", height: "100%" }}>
                <Stack spacing={1}>
                  <Typography variant="h6" color={"textSecondary"}>
                    Total Sales
                  </Typography>
                  {getTotalSale?.status === "pending" ? (
                    <CircularProgress color="inherit" size="34px" />
                  ) : (
                    <Typography variant="h4">
                      RM{" "}
                      {(getTotalSale?.data?.data._sum?.price ?? 0).toFixed(2)}
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setDateType((prev) => {
                        return {
                          ...prev,
                          sales: prev.sales === "month" ? "year" : "month",
                        };
                      });
                    }}
                  >
                    {startCase(dateType.sales)}
                  </Button>
                  <FlexBox />
                  {dateType.sales === "month" ? (
                    <YearAndMonthPopover
                      date={totalSaleDate}
                      onChange={(date) => {
                        setTotalSaleDate(date);
                      }}
                    />
                  ) : (
                    <YearPopover
                      date={totalSaleDate}
                      onChange={(date) => {
                        setTotalSaleDate(date);
                      }}
                    />
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "140px" }}>
              <Stack sx={{ justifyContent: "space-between", height: "100%" }}>
                <Stack spacing={1}>
                  <Typography variant="h6" color={"textSecondary"}>
                    Total Institutions
                  </Typography>
                  {getTotalInstitution?.status === "pending" ? (
                    <CircularProgress color="inherit" size="34px" />
                  ) : (
                    <Typography variant="h4">
                      {getTotalInstitution?.data?.data ?? 0}
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setDateType((prev) => {
                        return {
                          ...prev,
                          institutions:
                            prev.institutions === "month" ? "year" : "month",
                        };
                      });
                    }}
                  >
                    {startCase(dateType.institutions)}
                  </Button>
                  <FlexBox />
                  {dateType.institutions === "month" ? (
                    <YearAndMonthPopover
                      date={totalInstitutionDate}
                      onChange={(date) => {
                        setTotalInstitutionDate(date);
                      }}
                    />
                  ) : (
                    <YearPopover
                      date={totalInstitutionDate}
                      onChange={(date) => {
                        setTotalInstitutionDate(date);
                      }}
                    />
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "140px" }}>
              <Stack sx={{ justifyContent: "space-between", height: "100%" }}>
                <Stack spacing={1}>
                  <Typography variant="h6" color={"textSecondary"}>
                    Total Users
                  </Typography>
                  {getTotalUsers?.status === "pending" ? (
                    <CircularProgress color="inherit" size="34px" />
                  ) : (
                    <Typography variant="h4">
                      {getTotalUsers?.data?.data ?? 0}
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setDateType((prev) => {
                        return {
                          ...prev,
                          users: prev.users === "month" ? "year" : "month",
                        };
                      });
                    }}
                  >
                    {startCase(dateType.users)}
                  </Button>
                  <FlexBox />
                  {dateType.users === "month" ? (
                    <YearAndMonthPopover
                      date={totalUsersDate}
                      onChange={(date) => {
                        setTotalUsersDate(date);
                      }}
                    />
                  ) : (
                    <YearPopover
                      date={totalUsersDate}
                      onChange={(date) => {
                        setTotalUsersDate(date);
                      }}
                    />
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
}

export default Dashboard;
