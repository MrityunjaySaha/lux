import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import './individualcartauction.css';

const IndividualCartAuction = ({ cartAuction }) => {
  const [showDetails, setShowDetails] = useState(false); // State variable to toggle details visibility

  const removeFromCartAndDatabase = (auctionID) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        db.collection(`Cart ${user.uid}`)
          .doc('Auctions')
          .collection('items')
          .doc(auctionID) // Ensure productID is correct
          .delete()
          .then(() => {
            console.log('Successfully deleted the product item');
          })
          .catch((error) => {
            console.error('Error deleting the product item:', error);
          });
      }
    });
  };

  // Check if the timestamp is already a Date object or a string
  const uploadTime = cartAuction.timestamp instanceof Date
    ? cartAuction.timestamp
    : new Date(cartAuction.timestamp); // Convert to Date object if it's a string

  const formattedUploadTime = uploadTime.toLocaleString();

  // Format start and end times
  const startTime = new Date(cartAuction.startDate).toLocaleString();
  const endTime = new Date(cartAuction.endDate).toLocaleString();

  return (
    <div className="product">
      <div className="product-text auction-type">
        <strong>Auction Type:</strong> {cartAuction.auctionType}
      </div>
      <div className="product-img">
        <img src={cartAuction.itemImage} alt="product-img" />
      </div>
      <div className="product-text title">{cartAuction.title}</div>

      {/* Button to toggle details visibility */}
      <div className="btn btn-primary btn-md details-btn" onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide Details' : 'View Details'}
      </div><br></br>

      {/* Details section */}
      {showDetails && (
        <div className="details-section">
          <div className="product-text description">{cartAuction.description}</div>

          <div className="product-text currency-info">
            <strong>Currencies:</strong>
            {cartAuction.currencies && (
              <div className="product-text price">
                {cartAuction.currencies.map((currency) => (
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
            <strong>Uploader:</strong> {cartAuction.username}
            <br />
            <strong>Display Name:</strong> {cartAuction.displayName}
            <br />
            <strong>Address:</strong> {cartAuction.address}
            <br />
            <strong>City:</strong> {cartAuction.city}
            <br />
            <strong>State/Union Territory:</strong> {cartAuction.stateOrTerritory}
            <br />
            <strong>Zip Code:</strong> {cartAuction.zipCode}
            <br />
            <strong>Country:</strong> {cartAuction.country}
            <br />
            <strong>Phone Number:</strong> {cartAuction.phoneNumber}
            <br />
            <strong>Email:</strong> {cartAuction.email}
          </div>

          <div className="product-text upload-time">
            <strong>Uploaded:</strong> {formattedUploadTime}
          </div>
        </div>
      )}<br></br>
       <button
        className="btn btn-danger btn-md cart-btn"
        onClick={() => removeFromCartAndDatabase(cartAuction.ID)}
      >
        DELETE
      </button>
      <br />
      <div className="btn btn-danger btn-md cart-btn">Bid</div>
    </div>
  );
};

export default IndividualCartAuction;
