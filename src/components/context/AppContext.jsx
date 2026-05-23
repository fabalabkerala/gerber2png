/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { 
  createContext, 
  useState, 
  useMemo, 
  useContext, 
  useEffect 
} from "react";
import { DEFAULT_TOOL_LIB, DEFAULT_MACHINE_CONF, DEFAULT_PCB_CONF, CARVERA_TOOL_LIB } from "../../config/defaults";
const AppContext = createContext();
const OUTLINE_TAB_PRESET_STORAGE_KEY = "outlineTabPreset";

export const AppProvider = ({ children }) => {
  const [pngFiles, setPngFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("gerber");
  const [setupCompleted, setSetupCompleted] = useState(() => {
    // return localStorage.getItem("gcodeSetupCompleted") === "true";
    return false
  });
  const [ machineConf, setMachineConf ] = useState(DEFAULT_MACHINE_CONF[0]);
  const [ pcbConf, setPCBConf ] = useState(DEFAULT_PCB_CONF);
  const [toolLib, setToolLib] = useState(CARVERA_TOOL_LIB);
  const [outlineTabPreset, setOutlineTabPreset] = useState(() => {
    if (typeof window === "undefined") return null;

    try {
      const storedPreset = window.localStorage.getItem(OUTLINE_TAB_PRESET_STORAGE_KEY);
      return storedPreset ? JSON.parse(storedPreset) : null;
    } catch (error) {
      console.error("Failed to load outline tab preset", error);
      return null;
    }
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";

    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!outlineTabPreset) {
      window.localStorage.removeItem(OUTLINE_TAB_PRESET_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      OUTLINE_TAB_PRESET_STORAGE_KEY,
      JSON.stringify(outlineTabPreset)
    );
  }, [outlineTabPreset]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  
  const markSetupComplete = () => {
    // localStorage.setItem("gcodeSetupCompleted", "true");
    setSetupCompleted(true);
  };

  const resetSetup = () => {
    setMachineConf(DEFAULT_MACHINE_CONF[0]);
    setPCBConf(DEFAULT_PCB_CONF);
    setToolLib(DEFAULT_TOOL_LIB);
    setOutlineTabPreset(null);
    // localStorage.removeItem("machineConf");
    // localStorage.removeItem("pcbConf");
    // localStorage.removeItem("toolLib");
    // localStorage.removeItem("gcodeSetupCompleted");
  };
  
  // useEffect(() => {
  //   // Load stored data
  //   const storedMachine = localStorage.getItem("machineConf");
  //   const storedPCB = localStorage.getItem("pcbConf");
  //   const storedToolLib = localStorage.getItem("toolLib");

  //   if (storedMachine) setMachineConf(JSON.parse(storedMachine));
  //   if (storedPCB) setPCBConf(JSON.parse(storedPCB));
  //   if (storedToolLib) setToolLib(JSON.parse(storedToolLib));
  // }, []);

  // useEffect(() => {
  //   // Save whenever configs change
  //   localStorage.setItem("machineConf", JSON.stringify(machineConf));
  // }, [machineConf]);

  // useEffect(() => {
  //   localStorage.setItem("pcbConf", JSON.stringify(pcbConf));
  // }, [pcbConf]);

  // useEffect(() => {
  //   localStorage.setItem("toolLib", JSON.stringify(toolLib));
  // }, [toolLib]);

  const value = useMemo(() => ({
    pngFiles, 
    setPngFiles,
    activeTab,
    setActiveTab,
    machineConf,
    setMachineConf,
    pcbConf, 
    setPCBConf,
    toolLib, 
    setToolLib,
    outlineTabPreset,
    setOutlineTabPreset,
    theme,
    setTheme,
    toggleTheme,
    markSetupComplete,
    setupCompleted,
    resetSetup
  }), [pngFiles, activeTab, machineConf, pcbConf, toolLib, outlineTabPreset, theme, setupCompleted]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
}
