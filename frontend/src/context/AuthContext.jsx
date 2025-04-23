import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCustomer = localStorage.getItem("customer");
    const storedToken = localStorage.getItem("token");

    if (storedCustomer && storedToken) {
      setCustomer(JSON.parse(storedCustomer));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);


  const login = ({ customer, token }) => {
    const fullCustomer = {
      customerId: customer.customerId || customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      profileImg: customer.profileImg,
      role: customer.role,
      gender : customer.gender,
    };

    localStorage.setItem("customer", JSON.stringify(fullCustomer));
    localStorage.setItem("token", token);
    setCustomer(fullCustomer);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("customer");
    localStorage.removeItem("token");
    setCustomer(null);
    setToken(null);
  };

  
  const updateCustomer = (newData) => {
    setCustomer((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("customer", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ customer, token, login, logout, updateCustomer, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
