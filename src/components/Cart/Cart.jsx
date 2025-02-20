import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { getTotalCartValue } from "../../utils/cartUtils";

const ItemQuantity = ({ value, handleAdd, handleDelete, productId }) => {
  return (
    <Stack direction="row" alignItems="center">
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleDelete(productId, "decrement")}
      >
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleAdd(productId, "increment")}
      >
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

function DisplayCartItems({ items, buttonClick, isReadOnly }) {
  const { image, name, cost, quantity, _id: id } = items;

  return (
    <Box display="flex" alignItems="flex-start" padding="1rem">
      <Box className="image-container">
        <img src={image} alt={name} width="100%" height="100%" />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="6rem"
        paddingX="1rem"
      >
        <div>{name}</div>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {!isReadOnly ? (
            <ItemQuantity
              value={quantity}
              handleAdd={buttonClick}
              handleDelete={buttonClick}
              productId={id}
            />
          ) : (
            <Box>Qty:{quantity}</Box>
          )}

          <Box padding="0.5rem" fontWeight="700">
            ${cost}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const Cart = ({ products, items = [], handleQuantityUpdate, isReadOnly }) => {
  let history = useNavigate();
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        {items.map((values) => (
          <DisplayCartItems
            isReadOnly={isReadOnly}
            items={values}
            buttonClick={handleQuantityUpdate}
            key={values["_id"]}
          />
        ))}

        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" className="cart-footer">
          {window.location.pathname === "/checkout" ? (
            <></>
          ) : (
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                history("/checkout");
              }}
              className="checkout-btn"
            >
              Checkout
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Cart;
