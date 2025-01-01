import { useEffect, useState } from "react";
import { useRouter } from "next/router";

//*material
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Paper, { PaperProps } from "@mui/material/Paper";
import { SxProps } from "@mui/material";

//*helpers
import { removeParamsFromString } from "@/helpers/stringHelpers";

//*interface
interface CustomTabsProps {
  id?: string;
  tabs: {
    value: string;
    label: string;
    render: React.ReactNode;
    disabled?: boolean;
  }[];
  defaultTab: string;
  variant?: "scrollable" | "standard" | "fullWidth";
  paperProps?: PaperProps;
  isPaper?: boolean;
  panelSxProps?: SxProps;
}

/**
 * useCustomTabs is a custom React hook for handling tab-based navigation.
 *
 * @remarks
 * The hook receives an object of configuration properties including an optional id, a list of tabs,
 * and a default tab value. Each tab in the list is an object with `value`, `label`, and `render` properties.
 * The hook manages the active tab state, handles tab changes, and synchronizes tab state with URL query parameters.
 * It returns the current tab value, a setter function for the tab value, and the tab components rendered
 * based on the passed configuration.
 *
 * @params
 * @param id - An optional identifier used when there are multiple tab groups on the page.
 * @param tabs - A list of tab configurations. Each configuration includes the tab value,
 * label (displayed on the tab), and render (content of the tab).
 * @param defaultTab - The value of the default active tab.
 *
 * @returns
 * @return value - The current active tab value.
 * @return setValue - Function to set the active tab value.
 * @return tabsComponent - The rendered tab components.
 *
 * @hook
 * @example
 * const { value, setValue, tabsComponent } = useCustomTabs({
 *   tabs: [
 *     { value: '1', label: 'Tab 1', render: <SomeComponent1 /> },
 *     { value: '2', label: 'Tab 2', render: <SomeComponent2 /> }
 *   ],
 *   defaultTab: '1'
 * });
 */

function useCustomTabs({
  tabs = [],
  id = "",
  variant = "scrollable",
  defaultTab,
  paperProps,
  isPaper = true,
  panelSxProps,
}: CustomTabsProps) {
  //*define
  const router = useRouter();
  const routerTab = router.query[`tab${id}`] as string;

  //*states
  const [value, setValue] = useState(routerTab || defaultTab);

  //*functions
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  //*useEffect
  useEffect(() => {
    router.push(removeParamsFromString(router.asPath, ["tab"]));
  }, []);

  return {
    value,
    setValue,
    tabsComponent: (
      <TabContext value={value}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            position: "sticky",
            zIndex: 2,
            top: 0,
            backgroundColor: "inherit",
          }}
        >
          <TabList
            textColor="inherit"
            indicatorColor="secondary"
            onChange={handleChange}
            scrollButtons="auto"
            variant={variant}
          >
            {tabs.map(({ label, value, disabled = false }) =>
              disabled ? <></> : <Tab label={label} value={value} key={value} />
            )}
          </TabList>
        </Box>
        {tabs.map(({ render, value, disabled = false }) =>
          disabled ? (
            <></>
          ) : (
            <TabPanel
              value={value}
              key={value}
              sx={panelSxProps ? panelSxProps : { p: 0, pt: 2 }}
            >
              {isPaper ? (
                <Paper
                  sx={{ overflow: "auto", height: "100%" }}
                  {...paperProps}
                >
                  {render}
                </Paper>
              ) : (
                <Box sx={{ overflow: "auto", height: "100%" }}>{render}</Box>
              )}
            </TabPanel>
          )
        )}
      </TabContext>
    ),
  };
}

export default useCustomTabs;
