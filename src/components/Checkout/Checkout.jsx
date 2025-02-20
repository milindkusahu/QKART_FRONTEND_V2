import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../../config/config";
import Cart from "../Cart/Cart";
import {
  getTotalCartValue,
  generateCartItemsFrom,
  getTotalItems,
} from "../../utils/cartUtils";
import "./Checkout.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        onChange={(e) => {
          handleNewAddress({ value: e.target.value });
        }}
        placeholder="Enter your complete address"
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={(e) => {
            addAddress(token, newAddress.value);
            handleNewAddress({ isAddingNewAddress: false, value: "" });
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={(e) => {
            handleNewAddress((curr) => ({
              ...curr,
              isAddingNewAddress: false,
              value: "",
            }));
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  let classname = "address-item ";
  const history = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  const handleQuantityUpdate = async (productId, action) => {
    try {
      let newQty = 1;

      if (items.length > 0) {
        const currentItem = items.find((item) => item._id === productId);
        if (currentItem) {
          newQty = currentItem.quantity;
          if (action === "increment") {
            newQty += 1;
          } else if (action === "decrement") {
            newQty = Math.max(0, newQty - 1);
          }
        }
      }

      const response = await axios.post(
        `${config.endpoint}/cart`,
        {
          productId: productId,
          qty: newQty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const cartItems = response.data;
      const updatedCartData = await generateCartItemsFrom(cartItems, products);
      setItems(updatedCartData);
    } catch (error) {
      console.error("Cart update error:", error);
      enqueueSnackbar("Failed to update cart quantity. Please try again.", {
        variant: "error",
      });
    }
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      let url = config.endpoint + "/user/addresses";
      let res = await axios.post(
        url,
        { address: newAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses({ all: res.data, isAddingNewAddress: false });
      return res.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      let url = config.endpoint + "/user/addresses/" + addressId;
      let res = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses({ ...addresses, all: res.data });
      return res.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const validateRequest = (items, addresses) => {
    if (getTotalCartValue(items) > localStorage.getItem("balance")) {
      enqueueSnackbar(
        `You do not have enough balance in your wallet for this purchase`,
        { variant: "warning" }
      );
      return false;
    } else if (addresses.all.length === 0) {
      enqueueSnackbar(`Please add a new address before proceeding.`, {
        variant: "warning",
      });
      return false;
    } else if (!addresses.selected) {
      enqueueSnackbar(`Please select one shipping address to proceed.`, {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  const performCheckout = async (token, items, addresses) => {
    let isValid = validateRequest(items, addresses);
    if (isValid) {
      try {
        let url = config.endpoint + "/cart/checkout";
        let res = await axios.post(
          url,
          { addressId: addresses.selected },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data) {
          let wallet = localStorage.getItem("balance");
          let remain = wallet - getTotalCartValue(items);
          localStorage.setItem("balance", remain);
          history("/thanks");
        }
      } catch (e) {
        if (e.response) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      }
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      try {
        const productsData = await getProducts();
        if (!productsData) return;

        const cartData = await fetchCart(token);
        if (!cartData) return;

        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      } catch (error) {
        console.error("Initialization error:", error);
        enqueueSnackbar(
          "Could not initialize checkout page. Please try again.",
          { variant: "error" }
        );
      }
    };

    if (token) {
      onLoadHandler();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getAddresses(token);
    } else {
      enqueueSnackbar("You must be logged in to access checkout page", {
        variant: "info",
      });
      history("/");
    }
  }, [token]);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {addresses.all.length !== 0 ? (
                addresses.all.map((add) => {
                  if (addresses.selected === add["_id"])
                    classname = "address-item selected";
                  else classname = "address-item not-selected";
                  return (
                    <div
                      className={classname}
                      onClick={(e) => {
                        setAddresses({ ...addresses, selected: add["_id"] });
                      }}
                      key={add["_id"]}
                    >
                      <p>{add["address"]}</p>
                      <Button
                        startIcon={<Delete />}
                        id={add["_id"]}
                        onClick={(e) => {
                          deleteAddress(token, e.target.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  );
                })
              ) : (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              )}
            </Box>

            {newAddress.isAddingNewAddress === false ? (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
              </Button>
            ) : (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            )}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={(e) => {
                performCheckout(token, items, addresses);
              }}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          {/* <Cart isReadOnly products={products} items={items} /> */}
          <Cart
            isReadOnly={false}
            products={products}
            items={items}
            handleQuantityUpdate={handleQuantityUpdate}
          />
          <Box className="cart" mt={1} pb={2}>
            <Typography
              variant="h6"
              pt={3}
              pl={2}
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Order Details
            </Typography>
            <Stack direction="row" justifyContent="space-between" px={2}>
              <Typography variant="subtitle2" gutterBottom>
                Products
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                {getTotalItems(items)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" px={2}>
              <Typography variant="subtitle2" gutterBottom>
                Subtotal
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                $ {getTotalCartValue(items)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" px={2}>
              <Typography variant="subtitle2" gutterBottom>
                Shipping Charges
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                $ 0
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" px={2}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Total
              </Typography>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                $ {getTotalCartValue(items)}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
