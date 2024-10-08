import Register from "./components/Register";
import Login from "./components/Login";
import { Route, Switch } from "react-router-dom";
import Products from "./components/Products";

export const config = {
  endpoint: `https://qkart-frontend-4ye3.onrender.com/api/v1`,
};

function App() {
  return (
    <div className="App">
      {/* <Register /> */}
      <Switch>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/">
          <Products />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
