import { Box } from "@mui/system";
import "./Footer.css";

const Footer = () => {
  return (
    <Box className="footer">
      <Box>
        <img src="logo_dark.svg" alt="QKart-icon"></img>
      </Box>
      <p className="footer-text">
        QKart is your one stop solution to the buy the latest trending items
        with India&apos;s Fastest Delivery to your doorstep
      </p>
    </Box>
  );
};

export default Footer;
