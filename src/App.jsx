import { Route, Routes } from "react-router-dom";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import Checkout from "./components/Checkout/Checkout";
import Products from "./components/Products/Products";
import Thanks from "./components/Thanks/Thanks";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="/" element={<Products />} />
      </Routes>
    </div>
  );
};

export default App;
