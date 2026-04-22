import Auth from "../Auth";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return <Auth onAuthSuccess={handleAuthSuccess} />;
}
