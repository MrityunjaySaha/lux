import React from 'react';
import IndividualCartProduct from './IndividualCartProduct';
import './cartproducts.css';

export const CartProducts = ({ cartProducts, onViewDetails }) => {
  return (
    <div>
      {cartProducts.map((cartProduct) => (
        <div key={cartProduct.ID}>
          <IndividualCartProduct
            cartProduct={cartProduct}
            onViewDetails={onViewDetails}
          />
        </div>
      ))}
    </div>
  );
};
