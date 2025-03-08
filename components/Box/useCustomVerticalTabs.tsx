import { useState } from "react";

//*material
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";

//*interface
interface CustomTabsProps {
  id?: string;
  tabs: { value: string; label: string; render: React.ReactNode }[];
  defaultTab: string;
}

function useCustomVerticalTabs({ tabs = [], defaultTab }: CustomTabsProps) {
  //*states
  const [tableValue, setTabValue] = useState(defaultTab);

  //*functions
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return {
    tableValue,
    setTabValue,
    tabsComponent: (
      <TabContext value={tableValue}>
        <Box sx={{ display: "flex" }}>
          <TabList
            sx={{
              borderRight: 1,
              borderColor: "divider",
              backgroundColor: "#F9EDED",
            }}
            onChange={handleChange}
            scrollButtons="auto"
            variant={"scrollable"}
            orientation={"vertical"}
          >
            {tabs.map(({ value, label }) => (
              <Tab
                key={value}
                sx={
                  value === tableValue
                    ? { backgroundColor: "#EE484740", color: "#3A0000" }
                    : {}
                }
                label={label}
                value={value}
              />
            ))}
          </TabList>
          {tabs.map(({ render, value }) => (
            <TabPanel
              value={value}
              key={value}
              sx={{ width: "100%", padding: 0 }}
            >
              {render}
            </TabPanel>
          ))}
        </Box>
      </TabContext>
    ),
  };
}

export default useCustomVerticalTabs;
