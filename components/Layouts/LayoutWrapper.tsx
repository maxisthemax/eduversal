import { usePathname } from "next/navigation";

//*lodash
import includes from "lodash/includes";

//*components
import Minimal from "./Minimal";
import Main from "./Main";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  if (includes(["/signin", "/signup"], pathName))
    return <Minimal>{children}</Minimal>;
  else return <Main>{children}</Main>;
}

export default LayoutWrapper;
