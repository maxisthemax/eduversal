import { Form, Formik } from "formik";

//*components
import { OverlayBox } from "@/components/Box";
import { CheckboxForm } from "@/components/Form";

//*lodash
import chunk from "lodash/chunk";
import startCase from "lodash/startCase";
import includes from "lodash/includes";

//*mui
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import DialogTitle from "@mui/material/DialogTitle";

//*helpers
import { getFullHeightSize } from "@/helpers/stringHelpers";

//*data
import { PermissionsData } from "@/data/user";
import { useStaff } from "@/data/admin/user/staff";

const defaultPermissionAccess = {
  view: false,
  add: false,
  edit: false,
  delete: false,
};

type PermissionKey =
  | "dashboard"
  | "product_type"
  | "product_variation"
  | "album_package"
  | "restrict_content_institution"
  | "restrict_content_year"
  | "restrict_content_class_club"
  | "restrict_content_album"
  | "sales_order_details"
  | "sales_school_sales"
  | "sales_over_time"
  | "account_parent"
  | "account_staff"
  | "setting_banner";

const permissions: PermissionKey[] = [
  "dashboard",
  "product_type",
  "product_variation",
  "album_package",
  "restrict_content_institution",
  "restrict_content_year",
  "restrict_content_class_club",
  "restrict_content_album",
  "sales_order_details",
  "sales_school_sales",
  "sales_over_time",
  "account_parent",
  "account_staff",
  "setting_banner",
];

const disabledView: PermissionKey[] = [];
const disabledAdd: PermissionKey[] = ["setting_banner", "account_parent"];
const disabledEdit: PermissionKey[] = [];
const disabledDelete: PermissionKey[] = ["setting_banner", "account_parent"];

function PermissionDialog({
  staffId,
  handleClose,
}: {
  staffId: string;
  handleClose: () => void;
}) {
  const { updateUserPermissions, staffDataById } = useStaff();
  const staffData = staffDataById[staffId];

  return (
    <Dialog
      open={staffId !== ""}
      maxWidth="md"
      fullWidth
      keepMounted={false}
      onClose={() => {}}
    >
      <Formik
        initialValues={
          permissions.reduce((acc, permission) => {
            acc[permission] =
              staffData?.permissions?.[permission] ?? defaultPermissionAccess;
            return acc;
          }, {}) as PermissionsData
        }
        onSubmit={async (values) => {
          await updateUserPermissions(staffId, values);
        }}
      >
        {({
          values,
          errors,
          handleChange,
          touched,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => {
          const formProps = {
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
          };
          return (
            <OverlayBox isLoading={isSubmitting}>
              <Form onSubmit={handleSubmit}>
                <DialogTitle>Update Permissions</DialogTitle>
                <DialogContent>
                  <Grid
                    container
                    sx={{
                      maxHeight: getFullHeightSize(20),
                      borderTop: "1px solid lightGrey",
                      borderRight: "1px solid lightGrey",
                    }}
                  >
                    {chunk(permissions, 7).map((chunk, index) => {
                      return (
                        <Grid
                          size={{ xs: 6 }}
                          key={index}
                          sx={{ borderLeft: "1px solid lightGrey" }}
                        >
                          <Grid
                            container
                            sx={{
                              borderBottom: "1px solid lightGrey",
                              pb: 1,
                              pt: 1,
                            }}
                          >
                            <Grid size={{ xs: 6 }} sx={{ pl: 2 }}>
                              <Typography variant="body2">Role</Typography>
                            </Grid>
                            <Grid
                              size={{ xs: 1.5 }}
                              sx={{ textAlign: "center" }}
                            >
                              <Typography variant="body2">View</Typography>
                            </Grid>
                            <Grid
                              size={{ xs: 1.5 }}
                              sx={{ textAlign: "center" }}
                            >
                              <Typography variant="body2">Add</Typography>
                            </Grid>
                            <Grid
                              size={{ xs: 1.5 }}
                              sx={{ textAlign: "center" }}
                            >
                              <Typography variant="body2">Edit</Typography>
                            </Grid>
                            <Grid
                              size={{ xs: 1.5 }}
                              sx={{ textAlign: "center" }}
                            >
                              <Typography variant="body2">Delete</Typography>
                            </Grid>
                          </Grid>
                          {chunk.map((id) => {
                            return (
                              <Grid
                                container
                                key={id}
                                sx={{ borderBottom: "1px solid lightGrey" }}
                              >
                                <Grid
                                  size={{ xs: 6 }}
                                  sx={{ alignContent: "center", pl: 2 }}
                                >
                                  <Typography variant="body2">
                                    {startCase(id)}
                                  </Typography>
                                </Grid>

                                <Grid
                                  size={{ xs: 1.5 }}
                                  sx={{ textAlign: "center" }}
                                >
                                  {!includes(disabledView, id) && (
                                    <CheckboxForm
                                      size="small"
                                      name={`${id}.view`}
                                      formProps={formProps}
                                    />
                                  )}
                                </Grid>

                                <Grid
                                  size={{ xs: 1.5 }}
                                  sx={{ textAlign: "center" }}
                                >
                                  {!includes(disabledAdd, id) && (
                                    <CheckboxForm
                                      size="small"
                                      name={`${id}.add`}
                                      formProps={formProps}
                                    />
                                  )}
                                </Grid>
                                <Grid
                                  size={{ xs: 1.5 }}
                                  sx={{ textAlign: "center" }}
                                >
                                  {!includes(disabledEdit, id) && (
                                    <CheckboxForm
                                      size="small"
                                      name={`${id}.edit`}
                                      formProps={formProps}
                                    />
                                  )}
                                </Grid>
                                <Grid
                                  size={{ xs: 1.5 }}
                                  sx={{ textAlign: "center" }}
                                >
                                  {!includes(disabledDelete, id) && (
                                    <CheckboxForm
                                      size="small"
                                      name={`${id}.delete`}
                                      formProps={formProps}
                                    />
                                  )}
                                </Grid>
                              </Grid>
                            );
                          })}
                        </Grid>
                      );
                    })}
                  </Grid>
                </DialogContent>
                <DialogActions>
                  {staffData?.permissions && (
                    <Button onClick={handleClose}>Cancel</Button>
                  )}
                  <Button variant="contained" type="submit">
                    Save
                  </Button>
                </DialogActions>
              </Form>
            </OverlayBox>
          );
        }}
      </Formik>
    </Dialog>
  );
}

export default PermissionDialog;
