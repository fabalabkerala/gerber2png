/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useState, useMemo, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [pngFiles, setPngFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("gerber");
  const [ machineConf, setMachineConf ] = useState('Choose Your Machine');
  const [ pcbConf, setPCBConf ] = useState({
    type: 'single',
    length: { value: 100, maxValue: 400 },
    width: { value: 100, maxValue: 400 },
    thickness: { value: 2, maxValue: 4 },
    copperThickness: { value: 0.03, maxValue: 0.1 },
    cutOffset: { value: 0.5, maxValue: 1 },
  });

  const value = useMemo(() => ({
    pngFiles, 
    setPngFiles,
    activeTab,
    setActiveTab,
    machineConf,
    setMachineConf,
    pcbConf, 
    setPCBConf
  }), [pngFiles, activeTab, machineConf, pcbConf]);

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