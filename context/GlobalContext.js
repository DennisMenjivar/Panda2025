import React, { createContext, useState } from 'react';
export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [countTicketDetail, setCountTicketDetail] = useState(0);

  return (
    <GlobalContext.Provider value={{ countTicketDetail, setCountTicketDetail }}>
      {children}
    </GlobalContext.Provider>
  );
};
