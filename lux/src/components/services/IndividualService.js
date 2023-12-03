import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';

const IndividualService = ({ individualService, addToCart }) => {
  const [showDetails, setShowDetails] = useState(false); // State to toggle details

  // getting current user function
  function GetCurrentUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged((authUser) => {
        if (authUser) {
          db.collection('Users')
            .doc(authUser.uid)
            .get()
            .then((snapshot) => {
              setUser(authUser); // Pass authUser, not an empty value
            });
        } else {
          setUser(null);
        }
      });
    }, []);
    return user;
  }

  const user = GetCurrentUser();

  const handleAddToCart = (currencyType) => {
    addToCart(individualService, currencyType);
  };

  // Modify the handleDeleteProduct function to return a promise
  const handleDeleteService = () => {
    return new Promise((resolve, reject) => {
      // Delete the product from the database
      db.collection('Services')
        .doc(individualService.ID)
        .delete()
        .then(() => {
          console.log('Service deleted successfully from the database');
          // You can also remove the product from the user's cart here if needed
          resolve(); // Resolve the promise if deletion is successful
        })
        .catch((error) => {
          console.error('Error deleting the service:', error);
          reject(error); // Reject the promise if there's an error
        });
    });
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

  // Create a function to handle the deletion and page reload
  const handleDeleteAndReload = () => {
    handleDeleteService()
      .then(() => {
        removeFromCartAndDatabase(individualService.ID);
        // Reload the page after both deletion and removal from cart
        window.location.reload();
      })
      .catch((error) => {
        // Handle errors if necessary
        console.error('Error during deletion:', error);
      });
  };

  const barterCurrency = individualService.currencies?.find((currency) => currency.currency === 'Barter');
  const barterProducts = barterCurrency?.items?.filter((item) => item.type === 'Product') || [];
  const barterServices = barterCurrency?.items?.filter((item) => item.type === 'Service') || [];
  const localCurrency = individualService.currencies?.find((currency) => currency.currency === 'LocalCurrency');

  return (
    <div className="product">
      <div className="product-img">
        <img src={individualService.image} alt="product-img" />
      </div>
      <div className="product-text title">{individualService.title}</div>
      
      {/* Conditionally render the description and other details */}
      {showDetails && (
        <div>
          <div className="product-text description">{individualService.description}</div>

          {individualService.currencies && (
            <div className="product-text price">
              {individualService.currencies.map((currency) => (
                <div key={currency.currency}>
                  {currency.currency}
                  {currency.currency !== 'Barter' && `: (Price: ${currency.price}, `}
                  (Quantity: {currency.quantity})
                </div>
              ))}
            </div>
          )}

          {localCurrency && (
            <div className="product-text local-currency-info">
              <strong>Local Currency:</strong> 
              <div>
                Selected Option: {localCurrency.selectedOptions[0].value}
              </div>
            </div>
          )}

          {barterCurrency && (
            <div className="product-text counts">
              <strong>Product Count:</strong> {barterProducts.length}
              <br />
              <strong>Service Count:</strong> {barterServices.length}
            </div>
          )}

          <div className="product-text total-quantity">
            <strong>Total Quantity:</strong> {individualService.totalQuantity}
          </div>

          {barterCurrency && (
            <div className="product-text barter-info">
              {barterProducts.length > 0 && (
                <div className="product-text barter-products">
                  <strong>Barter Products:</strong>
                  {barterProducts.map((product, index) => (
                    <div key={index}>
                      Product: {product.title} - Description: {product.description}
                    </div>
                  ))}
                </div>
              )}

              {barterServices.length > 0 && (
                <div className="product-text barter-services">
                  <strong>Barter Services:</strong>
                  {barterServices.map((service, index) => (
                    <div key={index}>
                      Service: {service.title} - Description: {service.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="product-text uploader-info">
            <strong>Uploader:</strong> {individualService.username}
            <br />
            <strong>Display Name:</strong> {individualService.displayName}
            <br />
            <strong>Address:</strong> {individualService.address}
            <br />
            <strong>City:</strong> {individualService.city} {/* Display city */}
            <br />
            <strong>State/Union Territory:</strong> {individualService.stateOrTerritory} {/* Display state/union territory */}
            <br />
            <strong>Zip Code:</strong> {individualService.zipCode} {/* Display zip code */}
            <br />
            <strong>Country:</strong> {individualService.country}
            <br />
            <strong>Phone Number:</strong> {individualService.phoneNumber}
            <br />
            <strong>Email:</strong> {individualService.email}
          </div>
        </div>
      )}

      {/* Toggle the details visibility */}
      <button
        className="btn btn-primary btn-md"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide Details' : 'View Details'}
      </button><br></br>

       {/* Conditionally render Delete or Add to Cart button */}
       {user && user.email === individualService.email ? (
        <button
          className="btn btn-danger btn-md cart-btn"
          onClick={handleDeleteAndReload}
          >
          DELETE
        </button>
      ) : (
        <div className="btn btn-danger btn-md cart-btn" onClick={() => handleAddToCart('Barter')}>
          ADD TO CART
        </div>
      )}
    </div>
  );
};

export default IndividualService;