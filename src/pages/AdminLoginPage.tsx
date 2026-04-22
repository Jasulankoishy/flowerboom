import AdminLogin from "../AdminLogin";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/admin");
  };

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}
