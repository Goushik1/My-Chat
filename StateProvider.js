import React, { createContext, useContext, useState } from "react";
export const StateContext = createContext();
const StateProvider = ({ children }) => {
  const [userState, setUserState] = useState(null);
  return (
    <StateContext.Provider value={{ userState, setUserState }}>
      {children}
    </StateContext.Provider>
  );
};

export default StateProvider;
