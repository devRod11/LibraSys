import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type UserRole =
  | "admin"
  | "student"
  | null;

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
}

const AppContext =
  createContext<AppContextType>(
    {} as AppContextType
  );

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const initAuth = async () => {

      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {

        const savedUser =
          localStorage.getItem("user");

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

      } catch (err) {

        logout();

      } finally {

        setLoading(false);

      }
    };

    initAuth();

  }, []);

  // ✅ Login
  const login = ({
    token,
    user,
  }: {
    token: string;
    user: User;
  }) => {

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setUser(user);
  };

  // ✅ Logout
  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () =>
  useContext(AppContext);