import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  // TODO: Replace with real auth state from context/store
  const isLoggedIn = false;

  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={isLoggedIn} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
