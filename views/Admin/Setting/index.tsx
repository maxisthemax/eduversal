//*components
import { Page, useCustomTabs } from "@/components/Box";
import Parameter from "./Parameter";

function Setting() {
  const { tabsComponent } = useCustomTabs({
    tabs: [
      {
        label: "Parameter",
        value: "parameter",
        render: <Parameter />,
      },
    ],
    defaultTab: "parameter",
    isPaper: false,
  });

  return <Page title="Global Setting">{tabsComponent}</Page>;
}

export default Setting;
