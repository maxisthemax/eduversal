import { usePathname } from "next/navigation";

//*lodash
import includes from "lodash/includes";
import startsWith from "lodash/startsWith";

//*components
import AuthMain from "./AuthMain";
import Main from "./Main";
import AdminMain from "./AdminMain";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  if (
    includes(
      [
        "/signin",
        "/signup",
        "/verifyemail",
        "/forgotpassword",
        "/resetpassword",
      ],
      pathName
    )
  )
    return <AuthMain>{children}</AuthMain>;
  else if (startsWith(pathName, "/admin"))
    return <AdminMain>{children}</AdminMain>;
  else return <Main>{children}</Main>;
}

export default LayoutWrapper;
