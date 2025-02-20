import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useState, useCallback } from "react";
import { config } from "../../config/config";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import "./Products.css";
import ProductCard from "../ProductCard/ProductCard";
import Cart from "../Cart/Cart";
import { generateCartItemsFrom } from "../../utils/cartUtils";

const DEBOUNCE_TIMEOUT = 500;
const GRID_SPACING = { xs: 2, md: 3, lg: 1 };
const ERROR_MESSAGES = {
  LOGIN_REQUIRED: "Login to add an item to the Cart",
  ITEM_IN_CART:
    "Item already in cart. Use the cart sidebar to update quantity or remove item.",
  FETCH_ERROR: "Could not fetch products. Check your internet connection.",
  CART_FETCH_ERROR:
    "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
};

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [userCartItems, setUserCartItems] = useState([]);
  const [token, setToken] = useState("");

  const performAPICall = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data;
    } catch (error) {
      enqueueSnackbar(ERROR_MESSAGES.FETCH_ERROR, { variant: "error" });
      return [];
    } finally {
      setIsFetching(false);
    }
  };

  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setProducts(response.data);
      setProductNotFound(false);
    } catch (error) {
      setProductNotFound(true);
      setProducts([]);
    }
  };

  const debounceSearch = useCallback(
    (searchText) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      const newTimerId = setTimeout(
        () => performSearch(searchText),
        DEBOUNCE_TIMEOUT
      );
      setTimerId(newTimerId);
    },
    [timerId]
  );

  const fetchCart = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(ERROR_MESSAGES.CART_FETCH_ERROR, { variant: "error" });
      }
      return null;
    }
  };

  const isItemInCart = useCallback(
    (items, productId) => {
      const exists = items.some((item) => item._id === productId);
      if (exists) {
        enqueueSnackbar(ERROR_MESSAGES.ITEM_IN_CART, { variant: "warning" });
      }
      return exists;
    },
    [enqueueSnackbar]
  );

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    try {
      const url = `${config.endpoint}/cart`;
      const payload = { productId, qty: qty ?? 1 };

      if (options.preventDuplicate === true) {
        const response = await axios.post(url, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedCartData = await generateCartItemsFrom(
          response.data,
          products
        );
        setCartData(updatedCartData);
      } else {
        const existingItem = items.find((item) => item.productId === productId);
        if (existingItem) {
          const updatedQty =
            options.preventDuplicate === "handleAdd"
              ? existingItem.qty + 1
              : existingItem.qty - 1;

          const response = await axios.post(
            url,
            { productId, qty: updatedQty },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const updatedCartData = await generateCartItemsFrom(
            response.data,
            products
          );
          setCartData(updatedCartData);
        }
      }
    } catch (error) {
      enqueueSnackbar("Failed to update cart", { variant: "error" });
    }
  };

  const handleAddToCart = useCallback(
    (e) => {
      if (!isLoggedIn) {
        enqueueSnackbar(ERROR_MESSAGES.LOGIN_REQUIRED, { variant: "warning" });
        return;
      }

      const productId = e.target.value;
      if (!isItemInCart(cartData, productId)) {
        addToCart(token, userCartItems, products, productId, 1, {
          preventDuplicate: true,
        });
      }
    },
    [
      isLoggedIn,
      cartData,
      token,
      userCartItems,
      products,
      isItemInCart,
      enqueueSnackbar,
    ]
  );

  const handleQuantityUpdate = async (productId, action) => {
    try {
      const currentItem = cartData.find((item) => item._id === productId);
      let newQty = currentItem ? currentItem.quantity : 0;

      if (action === "increment") {
        newQty += 1;
      } else if (action === "decrement") {
        newQty = Math.max(0, newQty - 1);
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
      setUserCartItems(cartItems);
      const updatedCartData = await generateCartItemsFrom(cartItems, products);
      setCartData(updatedCartData);
    } catch (error) {
      enqueueSnackbar("Failed to update cart quantity. Please try again.", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const initializeProducts = async () => {
      try {
        const fetchedProducts = await performAPICall();
        if (!isSubscribed) return;

        const username = localStorage.getItem("username");
        const storedToken = localStorage.getItem("token");

        if (username && isSubscribed) {
          setIsLoggedIn(true);
        }

        if (storedToken && isSubscribed) {
          setToken(storedToken);
          const cartItems = await fetchCart(storedToken);
          if (cartItems && isSubscribed) {
            setUserCartItems(cartItems);
            const cartData = await generateCartItemsFrom(
              cartItems,
              fetchedProducts
            );
            setCartData(cartData);
          }
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };

    initializeProducts();

    return () => {
      isSubscribed = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const renderProducts = () => {
    if (isFetching) {
      return (
        <div className="loading">
          <CircularProgress />
          <h3>Loading Products</h3>
        </div>
      );
    }

    if (productNotFound) {
      return (
        <div className="loading">
          <SentimentDissatisfied />
          <h3>No products found</h3>
        </div>
      );
    }

    return (
      <Grid container>
        <Grid container spacing={GRID_SPACING} md={isLoggedIn ? 9 : 12}>
          {products.map((product) => (
            <Grid
              item
              key={product._id}
              lg={isLoggedIn ? 4 : 3}
              md={isLoggedIn ? 4 : 6}
              sm={6}
              xs={6}
              mt={2}
              mb={2}
            >
              <ProductCard
                product={product}
                handleAddToCart={handleAddToCart}
              />
            </Grid>
          ))}
        </Grid>

        {isLoggedIn && (
          <Grid md={3} sm={12} xs={12} sx={{ backgroundColor: "#E9F5E1" }}>
            <Cart
              products={products}
              items={cartData}
              handleQuantityUpdate={handleQuantityUpdate}
              isReadOnly={false}
            />
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <div>
      <Header hasHiddenAuthButtons={false} cartItems={cartData}>
        <TextField
          className="search-desktop"
          size="small"
          onChange={(e) => debounceSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
        />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        onChange={(e) => debounceSearch(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />

      <Grid container justifyContent="center">
        <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India's <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        </Grid>
      </Grid>

      {renderProducts()}

      <Footer />
    </div>
  );
};

export default Products;
