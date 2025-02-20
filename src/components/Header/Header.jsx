import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Avatar, Button, Stack, Badge } from "@mui/material";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons, cartItems = [] }) => {
  let username = localStorage.getItem("username");
  let history = useNavigate();

  let logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("balance");
    localStorage.removeItem("username");
    window.location.reload();
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Box className="header">
      <Box className="header-title">
        <img
          src="logo_light.svg"
          alt="QKart-icon"
          onClick={() => {
            history("/");
          }}
        ></img>
      </Box>
      {children}
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => {
            history("/");
          }}
        >
          Back to explore
        </Button>
      ) : username ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <Badge badgeContent={cartCount} color="primary" showZero>
            <ShoppingCartIcon
              color="action"
              onClick={() => history("/checkout")}
              style={{ cursor: "pointer" }}
            />
          </Badge>
          <Avatar className="profile-image" src="avatar.png" alt={username} />
          <div className="username-text">{username}</div>
          <Button onClick={logout}>LOGOUT</Button>
        </Stack>
      ) : (
        <Box>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => history("/login")}>LOGIN</Button>
            <Button
              className="button"
              variant="contained"
              onClick={() => history("/register")}
            >
              REGISTER
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Header;
