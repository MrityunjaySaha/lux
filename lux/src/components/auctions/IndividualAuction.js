import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';

const IndividualAuction = ({ individualAuction, addToCart, item }) => {
  const [showDetails, setShowDetails] = useState(false); // State variable to toggle details visibility

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

  const handleDeleteAuction = () => {
    return new Promise((resolve, reject) => {
      // Delete the product from the database
      db.collection('auctions')
        .doc(individualAuction.ID)
        .delete()
        .then(() => {
          console.log('Product deleted successfully from the database');
          // You can also remove the product from the user's cart here if needed
          resolve(); // Resolve the promise if deletion is successful
        })
        .catch((error) => {
          console.error('Error deleting the product:', error);
          reject(error); // Reject the promise if there's an error
        });
    });
  };

  const removeFromCartAndDatabase = (productID) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        db.collection(`Cart ${user.uid}`)
          .doc('Auctions')
          .collection('items')
          .doc(productID) // Ensure productID is correct
          .delete()
          .then(() => {
            console.log('Successfully deleted the auction item');
          })
          .catch((error) => {
            console.error('Error deleting the product item:', error);
          });
      }
    });
  };

   // Create a function to handle the deletion and page reload
   const handleDeleteAndReload = () => {
    handleDeleteAuction()
      .then(() => {
        removeFromCartAndDatabase(individualAuction.ID);
        // Reload the page after both deletion and removal from cart
        window.location.reload();
      })
      .catch((error) => {
        // Handle errors if necessary
        console.error('Error during deletion:', error);
      });
  };

  const handleAddToCart = (currencyType) => {
    addToCart(individualAuction, currencyType);
  };

  // Check if the timestamp is already a Date object or a string
  const uploadTime = individualAuction.timestamp instanceof Date
    ? individualAuction.timestamp
    : new Date(individualAuction.timestamp); // Convert to Date object if it's a string

  const formattedUploadTime = uploadTime.toLocaleString();

  // Format start and end times
  const startTime = new Date(individualAuction.startDate).toLocaleString();
  const endTime = new Date(individualAuction.endDate).toLocaleString();

  return (
    <div className="product">
      <div className="product-text auction-type">
        <strong>Auction Type:</strong> {individualAuction.auctionType}
      </div>
      <div className="product-img">
        <img src={individualAuction.itemImage} alt="product-img" />
      </div>
      <div className="product-text title">{individualAuction.title}</div>

      {/* Button to toggle details visibility */}
      <div className="btn btn-primary btn-md details-btn" onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide Details' : 'View Details'}
      </div><br></br>

      {/* Details section */}
      {showDetails && (
        <div className="details-section">
          <div className="product-text description">{individualAuction.description}</div>

          <div className="product-text currency-info">
            <strong>Currencies:</strong>
            {individualAuction.currencies && (
              <div className="product-text price">
                {individualAuction.currencies.map((currency) => (
                  <div key={currency.currency}>
                    {currency.currency}
                    {currency.currency && `: (Price: ${currency.price}), `}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-text auction-times">
            <strong>Start Time:</strong> {startTime}
            <br />
            <strong>End Time:</strong> {endTime}
          </div>

          <div className="product-text uploader-info">
            <strong>Uploader:</strong> {individualAuction.username}
            <br />
            <strong>Display Name:</strong> {individualAuction.displayName}
            <br />
            <strong>Address:</strong> {individualAuction.address}
            <br />
            <strong>City:</strong> {individualAuction.city}
            <br />
            <strong>State/Union Territory:</strong> {individualAuction.stateOrTerritory}
            <br />
            <strong>Zip Code:</strong> {individualAuction.zipCode}
            <br />
            <strong>Country:</strong> {individualAuction.country}
            <br />
            <strong>Phone Number:</strong> {individualAuction.phoneNumber}
            <br />
            <strong>Email:</strong> {individualAuction.email}
          </div>

          <div className="product-text upload-time">
            <strong>Uploaded:</strong> {formattedUploadTime}
          </div>
        </div>
      )}

      {/* Conditionally render Delete, Add to Cart, and Bid buttons */}
      {user && user.email !== individualAuction.email ? (
        <div>
          <button
            className="btn btn-danger btn-md cart-btn"
            onClick={handleAddToCart('Barter')}
          >
            ADD TO CART
          </button>
          <br /><br></br>
          <button className="btn btn-danger btn-md cart-btn">Bid</button>
        </div>
      ) : (
        <button
          className="btn btn-danger btn-md cart-btn"
          onClick={handleDeleteAndReload}
        >
          DELETE
        </button>
      )}
    </div>
  );
};

export default IndividualAuction;
