import React from 'react';
import IndividualAuction from './IndividualAuction';

const Auction = ({ auctions, addToCart }) => {
  return (
    <div>
      {auctions.map((individualAuction) => (
        <div key={individualAuction.ID}>
          <IndividualAuction individualAuction={individualAuction} addToCart={addToCart} />
          <hr />
        </div>
      ))}
    </div>
  );
};

export default Auction;
