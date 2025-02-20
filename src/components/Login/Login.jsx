import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { config } from "../../config/config";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import "./Login.css";

const Login = () => {
  const history = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const [showLoader, setshowLoader] = useState(false);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const login = async (formData) => {
    try {
      if (validateInput(formData)) {
        setshowLoader(true);
        let res = await axios.post(`${config.endpoint}/auth/login`, {
          username: formData.username,
          password: formData.password,
        });
        enqueueSnackbar("Logged In Successfully", {
          variant: "success",
        });
        persistLogin(res.data.token, res.data.username, res.data.balance);
        history("/");
      }
    } catch (e) {
      if (e.response && e.response.data) {
        enqueueSnackbar(e.response.data.message, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Something went wrong", {
          variant: "error",
        });
      }
    } finally {
      setshowLoader(false);
    }
  };

  const validateInput = (data) => {
    if (data.username === "") {
      enqueueSnackbar("Username is a required field", {
        variant: "warning",
      });
      return false;
    }
    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }
    if (data.password === "") {
      enqueueSnackbar("Password is a required field", {
        variant: "warning",
      });
      return false;
    }
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={loginForm.username}
            onChange={handleChange}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={loginForm.password}
            onChange={handleChange}
          />
          {showLoader ? (
            <Box textAlign="center">
              <CircularProgress />
            </Box>
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={() => {
                login(loginForm);
              }}
            >
              LOGIN TO QKART
            </Button>
          )}

          <p className="secondary-action">
            Don’t have an account?{" "}
            <Link to="/register" className="link">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
