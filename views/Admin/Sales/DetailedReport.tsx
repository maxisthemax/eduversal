/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import qs from "querystring";
import { toast } from "react-toastify";

//*lodash
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import sumBy from "lodash/sumBy";
import isEmpty from "lodash/isEmpty";

//*components
import { CustomIcon } from "@/components/Icons";
import DataGrid from "@/components/Table/DataGrid";
import NoAccess from "@/components/Box/NoAccess";
import { OverlayBox } from "@/components/Box";

//*mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { GridColDef } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

//*data
import { useGetStaffAccess } from "@/data/admin/user/staff";

//*helpers
import { useQueryFetch } from "@/helpers/queryHelpers";

//*data
import { useInstitutions } from "@/data/admin/institution/institution";
import { useAcademicYears } from "@/data/admin/institution/academicYear";
import { useCourses } from "@/data/admin/institution/course";

interface Filter {
  institutionId: string;
  academicYearId: string;
  standardId: string;
  courseId: string;
  from_date: string;
  to_date: string;
  [string: string]: string;
}

const filter = {
  institutionId: "",
  academicYearId: "",
  standardId: "",
  courseId: "",
  from_date: "",
  to_date: "",
};

function DetailedReport() {
  const [schoolSummaryFilterQuery, setSchoolSummaryFilterQuery] =
    useState<Filter>(filter);

  const [schoolSummaryFilter, setSchoolSummaryFilter] =
    useState<Filter>(filter);

  const { institutionsData } = useInstitutions();
  const { academicYearsData } = useAcademicYears(undefined, {
    institutionId: schoolSummaryFilter?.institutionId ?? undefined,
  });
  const { coursesData } = useCourses(undefined, {
    institutionId: schoolSummaryFilter?.institutionId ?? undefined,
    academicYearId: schoolSummaryFilter?.academicYearId ?? undefined,
  });

  const access = useGetStaffAccess("sales_school_sales");

  const { data, isLoading, refetch } = useQueryFetch(
    [
      "admin",
      "sales",
      "school_summary",
      qs.stringify(schoolSummaryFilterQuery),
    ],
    `admin/sales/detailedreport?${qs.stringify(schoolSummaryFilterQuery)}`,
    {
      enabled: !isEmpty(schoolSummaryFilterQuery),
    }
  );

  const detailedReportData: { result: any[]; columns: any; group: any } =
    useMemo(() => {
      if (!isLoading && data) {
        const result = [];
        const columns = [];
        const group = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.data.forEach((order: any) => {
          const { userPackage } = order;

          userPackage.items
            .filter(({ photoId }) => {
              return photoId !== "";
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .forEach((item: any, index: number) => {
              const productVariationOptionValue = {};
              let photoOnly = 0;
              if (item.productVariationOptions?.length === 0) {
                photoOnly = 1;
                productVariationOptionValue[`${item.photoName}`] = 0;
                columns.push({
                  field: `${item.photoName}•none•photoOnly`,
                  headerName: "Photo Only",
                  headerAlign: "center",
                  minWidth: 120,
                  align: "center",
                  valueFormatter: (value) => {
                    if (value > 0) return value;
                    else return "";
                  },
                  disableColumnMenu: true,
                  sortable: false,
                  disableReorder: true,
                  photoOnly,
                });
              } else {
                columns.push({
                  field: `${item.photoName}•none•photoOnly`,
                  headerName: "Photo Only",
                  headerAlign: "center",
                  minWidth: 120,
                  align: "center",
                  valueFormatter: (value) => {
                    if (value > 0) return value;
                    else return "";
                  },
                  disableColumnMenu: true,
                  sortable: false,
                  disableReorder: true,
                });
                item.productVariationOptions?.forEach(
                  (productVariationOption: any) => {
                    if (productVariationOption) {
                      productVariationOptionValue[
                        `${item.photoName}•${
                          productVariationOption.productVariationName
                        } (RM ${productVariationOption.productVariationOptionPrice.toFixed(
                          2
                        )})•${productVariationOption.productVariationOptionId}`
                      ] = 1;

                      columns.push({
                        field: `${item.photoName}•${
                          productVariationOption.productVariationName
                        } (RM ${productVariationOption.productVariationOptionPrice.toFixed(
                          2
                        )})•${productVariationOption.productVariationOptionId}`,
                        headerName:
                          productVariationOption.productVariationOptionName,
                        headerAlign: "center",
                        minWidth: 150,
                        align: "center",
                        valueFormatter: (value) => {
                          if (value > 0) return value;
                          else return "";
                        },
                        disableColumnMenu: true,
                        sortable: false,
                        disableReorder: true,
                      });
                    }
                  }
                );
              }
              const newOrder = {
                ...productVariationOptionValue,
                [`${item.photoName}•none•photoOnly`]: photoOnly,
                photoName: item.photoName,
                photoId: item.photoId,
                name: item.name,
                id: `${order.id}_${index}`,
              };
              result.push(newOrder);
            });
        });
        const newColumns = orderBy(
          uniqBy(columns, "field"),
          ["field"],
          ["desc"]
        );

        const firstGroup = groupBy(newColumns, (item) => {
          return item.field.split("•")[0];
        });

        Object.keys(firstGroup).forEach((key1) => {
          const secondGroup = groupBy(firstGroup[key1], (item) => {
            return item.field.split("•")[1];
          });
          group.push({
            groupId: key1,
            headerAlign: "center",
            children: Object.keys(secondGroup).map((key2) => {
              if (key2 === "none") {
                return { field: `${key1}•none•photoOnly` };
              } else
                return {
                  groupId: key2,
                  headerAlign: "center",
                  children: secondGroup[key2].map((item) => {
                    return {
                      field: item.field,
                      headerName: item.headerName,
                      headerAlign: "center",
                      align: "center",
                      disableColumnMenu: true,
                      sortable: true,
                      disableReorder: true,
                    };
                  }),
                };
            }),
          });
        });
        const resultGroup = groupBy(result, "name");
        const newResult = [];
        const price = calculateTotalPriceByName(data.data);
        Object.keys(resultGroup).forEach((key, index) => {
          const data = resultGroup[key];
          const newData = sumGroupedNumericFields(data);
          newResult.push({
            id: index,
            no: index + 1,
            name: key,
            ...newData,
            photoPrice: price[key],
          });
        });
        return { result: newResult, columns: newColumns, group };
      } else return { result: [], columns: [], group: [] };
    }, [data]);

  const summaryRow = useMemo(() => {
    if (detailedReportData?.result?.length > 0) {
      const { no, ...total } = sumGroupedNumericFields(
        detailedReportData.result
      );
      const totalPrice = calculateTotalPriceByName(data.data);
      const totalRow = {
        id: "total",
        name: "Total",
        no_1: no,
        ...total,
        totalPrice: totalPrice["Total"],
      };
      return totalRow;
    }
  }, [detailedReportData, data]);

  const columns: GridColDef<(typeof undefined)[number]>[] = [
    {
      field: "no",
      headerName: "No",
      headerAlign: "center",
      align: "center",
      minWidth: 80,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    },
    {
      field: "name",
      headerName: "Name",
      headerAlign: "center",
      align: "center",
      minWidth: 80,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
    },
    ...detailedReportData.columns,
    {
      field: "photoPrice",
      headerName: "Total Amount",
      headerAlign: "center",
      align: "center",
      minWidth: 120,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      valueFormatter: (value: number) => {
        if (value > 0) return value?.toFixed(2);
        else return "";
      },
    },
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

  const handleTextFieldClear = (name: string) => {
    setSchoolSummaryFilter((prev) => ({
      ...prev,
      [name]: undefined,
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
          <TextField
            name="academicYearId"
            select
            label="Academic Year"
            value={schoolSummaryFilter?.academicYearId}
            onChange={handleTextFieldChange}
            fullWidth={false}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                endAdornment: schoolSummaryFilter.academicYearId && (
                  <IconButton
                    sx={{ mr: 2 }}
                    size="small"
                    onClick={() => {
                      handleTextFieldClear("academicYearId");
                    }}
                  >
                    <CustomIcon icon="close" fontSizeSx="22px" />
                  </IconButton>
                ),
              },
            }}
          >
            {academicYearsData?.map((academicYear) => (
              <MenuItem key={academicYear.id} value={academicYear.id}>
                {academicYear.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="standardId"
            select
            label="Standard"
            value={schoolSummaryFilter?.standardId}
            onChange={handleTextFieldChange}
            fullWidth={false}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                endAdornment: schoolSummaryFilter.standardId && (
                  <IconButton
                    sx={{ mr: 2 }}
                    size="small"
                    onClick={() => {
                      handleTextFieldClear("standardId");
                    }}
                  >
                    <CustomIcon icon="close" fontSizeSx="22px" />
                  </IconButton>
                ),
              },
            }}
          >
            {orderBy(
              uniqBy(coursesData, "standard_id"),
              ["standard_name_format"],
              ["asc"]
            )?.map((course) => (
              <MenuItem key={course.standard_id} value={course.standard_id}>
                {course.standard_name_format}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="courseId"
            select
            label="Courses"
            value={schoolSummaryFilter?.courseId}
            onChange={handleTextFieldChange}
            fullWidth={false}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                endAdornment: schoolSummaryFilter.courseId && (
                  <IconButton
                    sx={{ mr: 2 }}
                    size="small"
                    onClick={() => {
                      handleTextFieldClear("courseId");
                    }}
                  >
                    <CustomIcon icon="close" fontSizeSx="22px" />
                  </IconButton>
                ),
              },
            }}
          >
            {coursesData
              .filter(({ standard_id }) => {
                if (!schoolSummaryFilter?.standardId) return true;
                return standard_id === schoolSummaryFilter?.standardId;
              })
              ?.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
          </TextField>
          <Button
            variant="contained"
            onClick={() => {
              if (
                !schoolSummaryFilter?.institutionId ||
                !schoolSummaryFilter?.academicYearId ||
                !schoolSummaryFilter?.standardId ||
                !schoolSummaryFilter?.courseId
              ) {
                toast.error("Please fill in all the fields", {
                  position: "top-right",
                });
                return;
              } else {
                setSchoolSummaryFilterQuery(schoolSummaryFilter);
                refetch();
              }
            }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSchoolSummaryFilterQuery(filter);
              setSchoolSummaryFilter(filter);
            }}
          >
            Reset
          </Button>
        </Stack>
        <DataGrid
          showCellVerticalBorder={true}
          density="compact"
          columnGroupingModel={detailedReportData.group}
          height="maxHeight"
          data={[...detailedReportData?.result, summaryRow]}
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
          fileName="Summary_Report"
        />
      </OverlayBox>
    </Box>
  );
}

export default DetailedReport;

type AnyObject = Record<string, any>;

function sumGroupedNumericFields(data: AnyObject[]): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const item of data) {
    for (const key in item) {
      const value = item[key];
      if (typeof value === "number") {
        if (!totals[key]) {
          totals[key] = 0;
        }
        totals[key] += value;
      }
    }
  }

  return totals;
}

function calculateTotalPriceByName(data: any[]): Record<string, number> {
  const names = uniqBy(data, (item) => {
    return item.userPackage.items[0].name;
  }).map((item) => {
    return item.userPackage.items[0].name;
  });
  const result: Record<string, number> = {};
  names.forEach((name) => {
    const sum = sumBy(data, (item) => {
      const userPackage = item.userPackage.items.find(
        (item) => item.name === name
      );
      if (userPackage) {
        return item.totalPrice;
      }
      return 0;
    });

    result[name] = sum;
  });

  return result;
}
