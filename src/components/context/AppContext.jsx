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
  const [ toolLib, setToolLib ] = useState([
    {
      name: '1/64 Mill',
      toolNo: 1,
      type: 'normal',
      angle: null,
      diameter: 0.4,
      feedRate: 4,
      plungeRate: 4,
      rpm: 600,
      maxCutDepth: 0.1,
      offsetStepOver: 0.5,
      offsetNum: 1
    },
    {
      name: '1/32 Mill',
      toolNo: 2,
      type: 'normal',
      angle: null,
      diameter: 0.8,
      feedRate: 4,
      plungeRate: 4,
      rpm: 600,
      maxCutDepth: 0.6,
      offsetStepOver: 0.5,
      offsetNum: 1
    },
    {
      name: '1/100 Mill',
      toolNo: 3,
      type: 'normal',
      angle: null,
      diameter: 0.254,
      feedRate: 2,
      plungeRate: 2,
      rpm: 600,
      maxCutDepth: 0.1,
      offsetStepOver: 0.5,
      offsetNum: 4
    },
    {
      name: 'V-Bit 15deg',
      toolNo: 4,
      type: 'vbit',
      angle: 15,
      diameter: 0.1,
      feedRate: 4,
      plungeRate: 4,
      rpm: 600,
      maxCutDepth: 1.14,
      offsetStepOver: 0.2,
      offsetNum: 4
    },
  ])

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
    setToolLib
  }), [pngFiles, activeTab, machineConf, pcbConf, toolLib]);

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