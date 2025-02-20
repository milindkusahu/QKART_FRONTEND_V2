import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  let username = localStorage.getItem("username");
  let history = useNavigate();
  let logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("balance");
    localStorage.removeItem("username");
    window.location.reload();
  };
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
        <div>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar className="profile-image" src="avatar.png" alt={username} />
            <div className="username-text">{username}</div>
            <Button
              onClick={() => {
                logout();
              }}
            >
              LOGOUT
            </Button>
          </Stack>
        </div>
      ) : (
        <Box>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={(e) => {
                history("/login");
              }}
            >
              LOGIN
            </Button>
            <Button
              className="button"
              variant="contained"
              onClick={() => {
                history("/register");
              }}
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
