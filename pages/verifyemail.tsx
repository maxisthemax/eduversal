import VerifyEmailView from "@/views/VerifyEmail";
import axios from "axios";
import { GetServerSideProps } from "next";

function VerifyEmail({ message }) {
  return <VerifyEmailView message={message} />;
}

export default VerifyEmail;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token, email } = context.query;
  let message = "Verifying your email...";

  if (token && email) {
    try {
      const res = await axios.post("auth/verifyEmail", {
        token,
        email,
      });
    } catch (e) {
      message = "An error occurred during verification.";
    }
  }

  return {
    props: {
      message,
    },
  };
};
