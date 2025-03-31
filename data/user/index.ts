import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

//*utils
import { useQueryFetch } from "@/helpers/queryHelpers";
import axios from "@/utils/axios";

//*interface

export interface DownloadImageData {
  photoId: string;
  photoUrl: string;
  downloadUrl: string;
  photoName: string;
}

interface PermissionAccess {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface PermissionsData {
  dashboard: PermissionAccess;
  product_type: PermissionAccess;
  product_variation: PermissionAccess;
  album_package: PermissionAccess;
  restrict_content_institution: PermissionAccess;
  restrict_content_year: PermissionAccess;
  restrict_content_class_club: PermissionAccess;
  restrict_content_album: PermissionAccess;
  sales_order_details: PermissionAccess;
  sales_school_sales: PermissionAccess;
  sales_over_time: PermissionAccess;
  account_parent: PermissionAccess;
  account_staff: PermissionAccess;
  setting_banner: PermissionAccess;
}
export interface UserData {
  id: number;
  name: string;
  email: string;
  address_1: string;
  address_2: string | null;
  city: string;
  country_code: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  postcode: string;
  role: string;
  state: string;
  permissions: PermissionsData;
  download_images?: DownloadImageData[];
  is_disabled: boolean;

  created_at: Date;
  updated_at: Date;
  address_format: string;
  contact_number_format: string;
}

type UpdateUserData = Partial<UserData>;

export const useUser = () => {
  const { push } = useRouter();
  const queryClient = useQueryClient();
  const { data, status, refetch } = useQueryFetch(["user"], "user", {
    refetchOnMount: true,
  });

  const userData = data?.data as UserData;

  useEffect(() => {
    if (
      status === "success" &&
      data?.response?.data?.type === "FAILED_TO_FETCH_USER_DATA"
    ) {
      queryClient.clear();
      push("/signin");
    }
  }, [data, status]);

  const updateUserDownloadImages = async (
    downloadImages: { photoId: string; photoUrl: string; downloadUrl: string }[]
  ) => {
    const resData = await axios.post("user/addDownloadPhoto", {
      download_images: downloadImages,
    });
    refetch();
    return resData;
  };

  const updateUserData = async (userData: UpdateUserData) => {
    const resData = await axios.post("user", {
      ...userData,
    });
    refetch();
    return resData;
  };

  const changePassword = async (
    password: string,
    new_password: string,
    confirm_password: string
  ) => {
    const resData = await axios.post("user/changePassword", {
      password,
      new_password,
      confirm_password,
    });
    refetch();
    return resData;
  };

  return {
    data: userData,
    status,
    updateUserDownloadImages,
    updateUserData,
    changePassword,
  };
};
