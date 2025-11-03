/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useState, useMemo, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [pngFiles, setPngFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("gerber");
  const [ machineConf, setMachineConf ] = useState([
    {
      machine: 'carvera',
      image: 'https://www.makera.com/cdn/shop/files/Makera_Carvera_1.jpg',
      width: 300,
      height: 250
    },
    {
      machine: 'Roland MDX-20',
      image: 'https://image.rolanddga.com/-/media/roland/images/support/product_shots/mdx20.jpg',
      width: 300,
      height: 300
    },
    {
      machine: 'LPKF ProtoMat',
      image: 'https://www.lpkfusa.com/fileadmin/mediafiles/_processed_/c/5/csm_Produkt_ProtoMat_S104_schraeg_e9179d0b21.png',
      width: 300,
      height: 250
    }, 
  ]);
  const [ selectedMachine, setSelectedMachine ] = useState('Choose Your Machine');

  const value = useMemo(() => ({
    pngFiles, 
    setPngFiles,
    activeTab,
    setActiveTab,
    machineConf,
    selectedMachine,
    setSelectedMachine
  }), [pngFiles, activeTab, machineConf, selectedMachine]);

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