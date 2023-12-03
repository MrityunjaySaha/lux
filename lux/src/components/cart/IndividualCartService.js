import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './individualcartservices.css';
import { db, auth } from '../../firebase';

const IndividualCartService = ({ cartService }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false); // State to toggle details
  
  const handleBuy = () => {
    // Navigate to the product details page when "View Details" is clicked
    navigate(`/service/${cartService.ID}`);
  };

  const removeFromCartAndDatabase = (serviceID) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        db.collection(`Cart ${user.uid}`)
          .doc('Services')
          .collection('items')
          .doc(serviceID) // Ensure productID is correct
          .delete()
          .then(() => {
            console.log('Successfully deleted the service item');
          })
          .catch((error) => {
            console.error('Error deleting the service item:', error);
          });
      }
    });
  };

  const barterCurrency = cartService.currencies?.find((currency) => currency.currency === 'Barter');
  const barterProducts = barterCurrency?.items?.filter((item) => item.type === 'Product') || [];
  const barterServices = barterCurrency?.items?.filter((item) => item.type === 'Service') || [];

  const totalQuantity = cartService.currencies.reduce((total, currency) => total + currency.quantity, 0);

  return (
    <div className="product">
      <div>
        <span>Service</span>
      </div>
      <div className="product-img">
        <img src={cartService.image} alt="product-img" />
      </div>
      <div className="product-text title">{cartService.title}</div>

      {/* Conditionally render the description and other details */}
      {showDetails && (
        <div>
          <div className="product-text description">{cartService.description}</div>

          <div className="product-text price">
            {cartService.currencies &&
              cartService.currencies.map((currency) => (
                <div key={currency.currency}>
                  {currency.currency}: (
                  <span className="math-inline">
                    Price: {currency.price}
                    {currency.quantity !== 1 && `, Quantity: ${currency.quantity}`}
                  </span>
                  )
                  {currency.currency === 'LocalCurrency' && (
                    <div>Selected Option: {currency.selectedOptions[0].value}</div>
                  )}
                </div>
              ))}
          </div>

          <div className="product-text total-quantity">
            <strong>Total Quantity:</strong> {totalQuantity}
          </div>

          {/* Display barter information */}
          {barterCurrency && (
            <div className="barter-info">
              <strong>Barter:</strong>
              <div>
                <strong>Barter Products:</strong>
                {barterProducts.map((product, index) => (
                  <div key={index}>
                    Product: {product.title} - Description: {product.description}
                  </div>
                ))}
                <strong>Product Count:</strong> {barterProducts.length}
              </div>
              <div>
                <strong>Barter Services:</strong>
                {barterServices.map((service, index) => (
                  <div key={index}>
                    Service: {service.title} - Description: {service.description}
                  </div>
                ))}
                <strong>Service Count:</strong> {barterServices.length}
              </div>
            </div>
          )}

          {/* Display uploader's information */}
          <div className="product-text uploader-info">
            <strong>Uploader:</strong> {cartService.username}
            <br />
            <strong>Display Name:</strong> {cartService.displayName}
            <br />
            <strong>Address:</strong> {cartService.address}
            <br />
            <strong>City:</strong> {cartService.city} {/* Display city */}
            <br />
            <strong>State/Union Territory:</strong> {cartService.stateOrTerritory}{' '}
            {/* Display state/union territory */}
            <br />
            <strong>Zip Code:</strong> {cartService.zipCode} {/* Display zip code */}
            <br />
            <strong>Country:</strong> {cartService.country}
            <br />
            <strong>Phone Number:</strong> {cartService.phoneNumber}
            <br />
            <strong>Email:</strong> {cartService.email}
          </div>
        </div>
      )}

      {/* Toggle the details visibility */}
      <button
        className="btn btn-primary btn-md cart-btn"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide Details' : 'View Details'}
      </button><br></br>

      <button
        className="btn btn-danger btn-md cart-btn"
        onClick={() => removeFromCartAndDatabase(cartService.ID)}
      >
        DELETE
      </button><br></br>

      <Link to={`/service/${cartService.ID}`} className="btn btn-primary btn-md cart-btn" onClick={handleBuy}>
        Buy
      </Link>
    </div>
  );
};

export default IndividualCartService;
