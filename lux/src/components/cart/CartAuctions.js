import React from 'react';
import IndividualCartAuction from './IndividualCartAuction';
import './cartauctions.css';

const CartAuction = ({ cartAuctions}) => {
  return (
    <div>
      {cartAuctions.map((cartAuction) => (
        <div key={cartAuction.ID}>
          <IndividualCartAuction 
            cartAuction={cartAuction} />
          <hr />
        </div>
      ))}
    </div>
  );
};

export default CartAuction;