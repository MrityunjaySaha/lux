import React from 'react';
import IndividualCartService from './IndividualCartService';
import './cartservices.css';

export const CartServices = ({ cartServices, onViewDetails }) => {
  return (
    <div>
      {cartServices.map((cartService) => (
        <div key={cartService.ID}>
          <IndividualCartService
            cartService={cartService}
            onViewDetails={onViewDetails}
          />
        </div>
      ))}
    </div>
  );
};