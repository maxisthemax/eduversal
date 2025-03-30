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

export interface PermissionsData {
  dashboard: Permission;
  product_type: Permission;
  product_variation: Permission;
  album_package: Permission;
  restrict_content_institution: Permission;
  restrict_content_year: Permission;
  restrict_content_class_club: Permission;
  restrict_content_album: Permission;
  sales_order_details: Permission;
  sales_school_sales: Permission;
  sales_over_time: Permission;
  account_parent: Permission;
  account_staff: Permission;
  setting_banner: Permission;
}

interface Permission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}
interface UserData {
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
}

type UpdateUserData = Partial<UserData>;

export const useUser = () => {
  const { push } = useRouter();
  const queryClient = useQueryClient();
  const { data, status, refetch } = useQueryFetch(["user"], "user");

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
