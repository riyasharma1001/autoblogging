// components/AuthWrapper.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "./AdminLayout";

export default function AuthWrapper({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    authCheck();
  }, []);

  const authCheck = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthorized(false);
      router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  };

  if (!authorized) {
    return null;
  }

  // Wrap children with AdminLayout except for login page
  if (router.pathname === "/admin/login") {
    return children;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
