import { useMemo, useState } from "react";
import { format, isValid } from "date-fns";
import qs from "querystring";
import { v4 as uuidv4 } from "uuid";

//*lodash
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";

//*components
import DataGrid from "@/components/Table/DataGrid";
import NoAccess from "@/components/Box/NoAccess";
import DatePicker from "@/components/Date/DatePicker";
import { OverlayBox } from "@/components/Box";

//*mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { GridColDef } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";

//*data
import { useGetStaffAccess } from "@/data/admin/user/staff";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";

function SchoolSummary() {
  const { institutionsData } = useInstitutions();
  const access = useGetStaffAccess("sales_school_sales");
  const [schoolSummaryFilter, setSchoolSummaryFilter] = useState<{
    institutionId: string;
    academicYearId: string;
    from_date: string;
    to_date: string;
  }>({
    institutionId: "",
    academicYearId: "",
    from_date: "",
    to_date: "",
  });
  const { data, isLoading } = useQueryFetch(
    ["admin", "sales", "school_summary", qs.stringify(schoolSummaryFilter)],
    `admin/sales/schoolsummary?${qs.stringify(schoolSummaryFilter)}`
  );

  // Group data by album name for packages with no associated package ID ("none")
  // This will be used to dynamically generate columns and row data
  const packageNoneGroupData = useMemo(() => {
    const schoolSummaryData = data?.data ?? [];
    const returnData = [];
    schoolSummaryData.forEach((data) => {
      if (data.userPackage.packageId === "none") {
        returnData.push({
          packageName: data?.userPackage.items[0].album.albumName,
          packageId: data?.userPackage.items[0].album.albumId,
          quantity: data.quantity,
          totalPrice: data.totalPrice,
          id: `${data?.standardId}-${data?.courseId}`,
        });
      }
    });
    return groupBy(returnData, "packageName");
  }, [data]);

  // Dynamically generate columns based on the keys of packageNoneGroupData
  // Each column represents a unique album name with its respective data
  const packageNoneColumns: GridColDef<(typeof undefined)[number]>[] = sortBy(
    Object.keys(packageNoneGroupData)
  ).reduce((temp, key) => {
    temp.push({
      key: key,
      field: `${key}_quantity`,
      headerName: "Quantity",
      headerAlign: "center",
      minWidth: 120,
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    });
    temp.push({
      key: key,
      field: `${key}_totalPrice`,
      headerName: "Total Price",
      headerAlign: "center",
      minWidth: 120,
      align: "right",
      valueFormatter: (value) => {
        if (value !== undefined) return `RM ${value}`;
      },
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    });

    return temp;
  }, []);

  const packageGroupData = useMemo(() => {
    const schoolSummaryData = data?.data ?? [];
    const returnData = [];
    schoolSummaryData.forEach((data) => {
      if (data.userPackage.packageId !== "none") {
        returnData.push({
          packageName: data?.userPackage?.packageData?.name,
          packageId: data?.userPackage?.packageData?.id,
          quantity: data.quantity,
          totalPrice: data.totalPrice,
          id: `${data?.standardId}-${data?.courseId}`,
        });
      }
    });
    return groupBy(returnData, "packageName");
  }, [data]);

  const packageColumns: GridColDef<(typeof undefined)[number]>[] = sortBy(
    Object.keys(packageGroupData)
  ).reduce((temp, key) => {
    temp.push({
      key: key,
      field: `${key}_quantity`,
      headerName: "Quantity",
      headerAlign: "center",
      minWidth: 120,
      align: "right",
      valueFormatter: (value) => {
        if (value > 0) return value;
        else return "";
      },
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    });
    temp.push({
      key: key,
      field: `${key}_totalPrice`,
      headerName: "Total Price",
      headerAlign: "center",
      minWidth: 120,
      align: "right",
      valueFormatter: (value) => {
        if (value !== undefined) return `RM ${value}`;
      },
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    });

    return temp;
  }, []);

  const dataMemo = useMemo(() => {
    // Process and transform the school summary data
    // Map the data to include standard, class, and dynamically generated packageNoneRowData
    const schoolSummaryData = data?.data ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapData = schoolSummaryData.map((data: any) => {
      return {
        id: `${data?.standardId}-${data?.courseId}`,
        standardId: data.standardId,
        standard: data.standardName,
        classId: data.courseId,
        class: data.courseName,
      };
    });

    // Sort and group the data by standard and class
    const sortedMapData = uniqBy(
      orderBy(mapData, ["standard", "class"], ["asc", "asc"]),
      "id"
    );
    const standardGroup = groupBy(sortedMapData, (data) => {
      return data.standardId;
    });

    const newStandardGroup = [];
    let no = 0;

    // Generate row data for each standard and class
    Object.keys(standardGroup).forEach((id, index) => {
      newStandardGroup.push(
        ...standardGroup[id].map((data) => {
          no += 1;

          // Calculate packageNoneRowData for each album
          const packageNoneRowData = {};
          Object.keys(packageNoneGroupData).forEach((key) => {
            const groupData = groupBy(packageNoneGroupData[key], "id")[data.id];
            packageNoneRowData[`${key}_quantity`] =
              sumBy(groupData, "quantity") > 0
                ? sumBy(groupData, "quantity")
                : undefined;
            packageNoneRowData[`${key}_totalPrice`] = sumBy(
              groupData,
              "totalPrice"
            ).toFixed(2);
          });

          const packageRowData = {};
          Object.keys(packageGroupData).forEach((key) => {
            const groupData = groupBy(packageGroupData[key], "id")[data.id];
            packageRowData[`${key}_quantity`] = sumBy(groupData, "quantity");
            packageRowData[`${key}_totalPrice`] = sumBy(
              groupData,
              "totalPrice"
            ).toFixed(2);
          });

          return { ...data, no, ...packageNoneRowData, ...packageRowData };
        })
      );

      // Add a blank row between groups for better readability
      if (Object.keys(standardGroup).length > index + 1) {
        newStandardGroup.push({ id: uuidv4(), no: "" });
      }
    });
    const sumDataRow = { id: "sum", class: "Total", no: "" };
    Object.keys(packageNoneGroupData).forEach((key) => {
      sumDataRow[`${key}_quantity`] = sumBy(
        packageNoneGroupData[key],
        "quantity"
      );
      sumDataRow[`${key}_totalPrice`] = sumBy(
        packageNoneGroupData[key],
        "totalPrice"
      ).toFixed(2);
    });

    Object.keys(packageGroupData).forEach((key) => {
      sumDataRow[`${key}_quantity`] = sumBy(packageGroupData[key], "quantity");
      sumDataRow[`${key}_totalPrice`] = sumBy(
        packageGroupData[key],
        "totalPrice"
      ).toFixed(2);
    });

    return [...newStandardGroup, sumDataRow];
  }, [data?.data, packageGroupData, packageNoneGroupData]);

  const columns: GridColDef<(typeof undefined)[number]>[] = [
    {
      field: "no",
      headerName: "No",
      headerAlign: "center",
      minWidth: 80,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    },
    {
      field: "standard",
      headerName: "Standard",
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    },
    {
      field: "class",
      headerName: "Class",
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    },
    ...packageNoneColumns,
    ...packageColumns,
  ];

  if (!access.view) return <NoAccess />;

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setSchoolSummaryFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <OverlayBox isLoading={isLoading}>
        <Stack direction={"row"} gap={2} flexWrap={"wrap"} sx={{ pb: 2 }}>
          <TextField
            name="institutionId"
            select
            label="Institution"
            value={schoolSummaryFilter?.institutionId}
            onChange={handleTextFieldChange}
            fullWidth={false}
            sx={{ minWidth: 200 }}
          >
            {institutionsData?.map((institution) => (
              <MenuItem key={institution.id} value={institution.id}>
                {institution.name}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            fullWidth={false}
            label="From Date"
            value={
              schoolSummaryFilter?.from_date !== ""
                ? new Date(schoolSummaryFilter?.from_date)
                : null
            }
            onChange={(newValue) => {
              setSchoolSummaryFilter((prev) => ({
                ...prev,
                from_date: isValid(newValue)
                  ? format(newValue, "yyyy-MM-dd")
                  : "",
              }));
            }}
            slotProps={{
              textField: {
                fullWidth: false,
                onKeyDown: (e) => {
                  if (e.key === "Backspace" || e.key === "Delete") {
                    e.preventDefault();
                  }
                },
              },
              field: {
                clearable: true,
                onClear: () => {
                  setSchoolSummaryFilter((prev) => ({
                    ...prev,
                    from_date: "",
                  }));
                },
              },
            }}
          />
          <DatePicker
            fullWidth={false}
            label="To Date"
            value={
              schoolSummaryFilter?.to_date !== ""
                ? new Date(schoolSummaryFilter?.to_date)
                : null
            }
            onChange={(newValue) => {
              setSchoolSummaryFilter((prev) => ({
                ...prev,
                to_date: isValid(newValue)
                  ? format(newValue, "yyyy-MM-dd")
                  : "",
              }));
            }}
            slotProps={{
              textField: {
                fullWidth: false,
                onKeyDown: (e) => {
                  if (e.key === "Backspace" || e.key === "Delete") {
                    e.preventDefault();
                  }
                },
              },
              field: {
                clearable: true,
                onClear: () => {
                  setSchoolSummaryFilter((prev) => ({
                    ...prev,
                    to_date: "",
                  }));
                },
              },
            }}
          />
          <Button variant="contained" onClick={() => {}}>
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSchoolSummaryFilter({
                institutionId: "",
                academicYearId: "",
                from_date: "",
                to_date: "",
              });
            }}
          >
            Reset
          </Button>
        </Stack>
        <DataGrid
          density="compact"
          columnGroupingModel={[
            ...Object.keys(groupBy(packageNoneColumns, "key")).map((key) => {
              const children = groupBy(packageNoneColumns, "key")[key];

              return {
                groupId: key,
                headerAlign: "center" as const,
                children: [
                  {
                    field: children[0].field,
                    headerAlign: "center" as const,
                    headerName: "Quantity",
                    minWidth: 150,
                  },
                  {
                    field: children[1].field,
                    headerAlign: "center" as const,
                    headerName: "Total Price",
                    minWidth: 150,
                  },
                ],
              };
            }),
            ...Object.keys(groupBy(packageColumns, "key")).map((key) => {
              const children = groupBy(packageColumns, "key")[key];

              return {
                groupId: key,
                headerAlign: "center" as const,
                children: [
                  {
                    field: children[0].field,
                    headerAlign: "center" as const,
                    headerName: "Quantity",
                    minWidth: 150,
                  },
                  {
                    field: children[1].field,
                    headerAlign: "center" as const,
                    headerName: "Total Price",
                    minWidth: 150,
                  },
                ],
              };
            }),
          ]}
          //loading={status === "pending"}
          height="maxHeight"
          data={dataMemo}
          columns={
            columns.length > 0
              ? [
                  ...columns.slice(0, columns.length - 1),
                  { ...columns[columns.length - 1], flex: 1 },
                ]
              : columns
          }
          gap={18.7}
          showQuickFilter={false}
          disableFilter={true}
        />
      </OverlayBox>
    </Box>
  );
}

export default SchoolSummary;
