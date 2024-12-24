import { GetServerSideProps } from "next";

//*views
import VerifyEmailView from "@/views/VerifyEmail";

//*utils
import axios from "@/utils/axios";

function VerifyEmail({ message, type, is_verified = false }) {
  return (
    <VerifyEmailView message={message} isVerified={is_verified} type={type} />
  );
}

export default VerifyEmail;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token, email } = context.query;
  let message = "Verifying your email...";
  let is_verified = false;
  let type = "";

  if (token && email) {
    try {
      const res = await axios.get(`auth/verifyEmail`, {
        params: { token, email },
      });
      message = res?.message ?? "";
      is_verified = true;
      type = res?.type ?? "";
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        message = e.response.data.message;
        type = e.response.data.type;
      } else {
        message = "An error occurred during verification.";
      }
    }
  } else {
    message = "Invalid verification link.";
  }

  return {
    props: {
      message,
      is_verified,
      type,
    },
  };
};