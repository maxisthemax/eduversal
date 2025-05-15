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
  const [detailedReportFilterQuery, setDetailedReportFilterQuery] =
    useState<Filter>(filter);

  const [detailedReportFilter, setDetailedReportFilter] =
    useState<Filter>(filter);

  const { institutionsData } = useInstitutions();
  const { academicYearsData } = useAcademicYears(undefined, {
    institutionId: detailedReportFilter?.institutionId ?? undefined,
  });
  const { coursesData } = useCourses(undefined, {
    institutionId: detailedReportFilter?.institutionId ?? undefined,
    academicYearId: detailedReportFilter?.academicYearId ?? undefined,
  });

  const access = useGetStaffAccess("sales_school_sales");

  const { data, isLoading, refetch } = useQueryFetch(
    [
      "admin",
      "sales",
      "detailed_report",
      qs.stringify(detailedReportFilterQuery),
    ],
    `admin/sales/detailedreport?${qs.stringify(detailedReportFilterQuery)}`,
    {
      enabled: !isEmpty(detailedReportFilterQuery),
    }
  );

  const detailedReportData: { result: any[]; columns: any; group: any } =
    useMemo(() => {
      if (!isLoading && data) {
        const result = [];
        const columns = [];
        const group = [];
        data?.data.forEach((order: any) => {
          const { userPackage } = order;

          userPackage.items
            .filter(({ photoId }) => {
              return photoId !== "";
            })
            .forEach((item: any, index: number) => {
              const productVariationOptionValue = {};
              let photoOnly = 0;
              if (item.productVariationOptions?.length === 0) {
                photoOnly = 1 * order.quantity;
                productVariationOptionValue[`${item.photoName}`] = 0;
                columns.push({
                  field: `${item.photoName}•none•photoOnly`,
                  headerName: `Photo Only (RM ${item.album.productTypePrice.toFixed(
                    2
                  )})`,
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
                  headerName: `Photo Only (RM ${item.album.productTypePrice.toFixed(
                    2
                  )})`,
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
                        `${item.photoName}•${productVariationOption.productVariationName}•${productVariationOption.productVariationOptionId}`
                      ] = 1 * order.quantity;

                      columns.push({
                        field: `${item.photoName}•${productVariationOption.productVariationName}•${productVariationOption.productVariationOptionId}`,
                        headerName: `${
                          productVariationOption.productVariationOptionName
                        } (RM ${productVariationOption.productVariationOptionPrice.toFixed(
                          2
                        )})`,
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
        const shippingPrice = calculateTotalShippingByName(data.data);
        Object.keys(resultGroup).forEach((key, index) => {
          const data = resultGroup[key];
          const newData = sumGroupedNumericFields(data);
          newResult.push({
            id: index,
            no: index + 1,
            name: key,
            ...newData,
            photoPrice: price[key],
            shippingPrice: shippingPrice[key],
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
      const totalRow = {
        ...total,
        id: "total",
        name: "Total",
        no_1: no,
      };
      console.log("🚀 ~ summaryRow ~ totalRow:", totalRow);
      return totalRow;
    } else return {};
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
      field: "shippingPrice",
      headerName: "Total Shipping Fee",
      headerAlign: "center",
      align: "center",
      minWidth: 140,
      disableColumnMenu: true,
      sortable: false,
      disableReorder: true,
      valueFormatter: (value: number) => {
        if (value && value > 0) return Number(value)?.toFixed(2);
        else return "0.00";
      },
    },
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
        if (value && value > 0) return Number(value)?.toFixed(2);
        else return "";
      },
    },
  ];
  if (!access.view) return <NoAccess />;

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setDetailedReportFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextFieldClear = (name: string) => {
    setDetailedReportFilter((prev) => ({
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
            value={detailedReportFilter?.institutionId}
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
            value={detailedReportFilter?.academicYearId}
            onChange={handleTextFieldChange}
            fullWidth={false}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                endAdornment: detailedReportFilter.academicYearId && (
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
            value={detailedReportFilter?.standardId}
            onChange={handleTextFieldChange}
            fullWidth={false}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                endAdornment: detailedReportFilter.standardId && (
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
            value={detailedReportFilter?.courseId}
            onChange={handleTextFieldChange}
            fullWidth={false}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                endAdornment: detailedReportFilter.courseId && (
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
                if (!detailedReportFilter?.standardId) return true;
                return standard_id === detailedReportFilter?.standardId;
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
                !detailedReportFilter?.institutionId ||
                !detailedReportFilter?.academicYearId ||
                !detailedReportFilter?.standardId ||
                !detailedReportFilter?.courseId
              ) {
                toast.error("Please fill in all the fields", {
                  position: "top-right",
                });
                return;
              } else {
                setDetailedReportFilterQuery(detailedReportFilter);
                refetch();
              }
            }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setDetailedReportFilterQuery(filter);
              setDetailedReportFilter(filter);
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
          data={
            detailedReportData?.result.length > 0
              ? [...detailedReportData?.result, summaryRow]
              : []
          }
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
          fileName="Detailed_Report"
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

function calculateTotalShippingByName(data: any[]): Record<string, number> {
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
        return item.shippingFee;
      }
      return 0;
    });

    result[name] = sum;
  });

  return result;
}
