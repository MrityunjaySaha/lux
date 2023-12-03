import React, { useState, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import './AuctionBody.css';
import { db, auth, storage } from '../../firebase';
//import { useNavigate } from 'react-router-dom';

const AddAuction = () => {
  const [auctionType, setAuctionType] = useState('product');
  const itemImage = useRef();
  const [imageOrVideo, setImageOrVideo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currencies, setCurrencies] = useState([
    { currency: 'STar', enabled: false, price: '' },
    { currency: 'Sterling', enabled: false, price: '' },
    { currency: 'LocalCurrency', enabled: false, price: '', localCurrencyType: 'USD' },
    { currency: 'CryptoCurrency', enabled: false, price: '' },
    { currency: 'Barter', enabled: false, price: '' },
  ]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const imgTypes = ['image/png', 'image/jpeg', 'image/jpg'];

 //const navigate = useNavigate();

  const handleAuctionTypeChange = (e) => {
    setAuctionType(e.target.value);
  };

  const handleCurrencyChange = (e, currencyType) => {
    const updatedCurrencies = [...currencies];

    const currencyToUpdate = updatedCurrencies.find(currency => currency.currency === currencyType);

    if (currencyToUpdate) {
      currencyToUpdate.enabled = e.target.checked;
      if (!e.target.checked) {
        currencyToUpdate.price = '';
      }
      setCurrencies(updatedCurrencies);
    }
  };

  const handleLocalCurrencyChange = (e) => {
    const localCurrencyType = e.target.value;

    const updatedCurrencies = [...currencies];

    const localCurrency = updatedCurrencies.find(currency => currency.currency === 'LocalCurrency');

    if (localCurrency) {
      localCurrency.localCurrencyType = localCurrencyType;
      setCurrencies(updatedCurrencies);
    }
  };

  const handlePriceChange = (e, currencyType) => {
    const value = parseFloat(e.target.value);
  
    if (isNaN(value) || value < 0) {
      // Handle invalid input (not a number or negative)
      setError(`Price for ${currencyType} must be a non-negative number.`);
      return;
    }
  
    const updatedCurrencies = [...currencies];
  
    const currencyToUpdate = updatedCurrencies.find(currency => currency.currency === currencyType);
  
    if (currencyToUpdate) {
      currencyToUpdate.price = value;
      setCurrencies(updatedCurrencies);
    }
  
    // Clear any previous error message if the input is valid
    setError('');
  };  

  const handleBarterChange = (e) => {
    const value = e.target.value;

    const updatedCurrencies = [...currencies];

    const barterCurrency = updatedCurrencies.find(currency => currency.currency === 'Barter');

    if (barterCurrency) {
      barterCurrency.price = value;
      setCurrencies(updatedCurrencies);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const isCurrencySelected = currencies.some(currency => currency.enabled);

    if (!isCurrencySelected) {
      setError('Please select at least one currency');
      return;
    }

    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      setError('Please fill in all fields, including start and end dates');
      return;
    }

    const currentTimestamp = new Date().getTime();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    // Define the minimum time difference (in milliseconds)
    const minimumTimeDifference = 1000 * 60 * 5; // 5 minutes

    if (startTime >= endTime - minimumTimeDifference) {
      setError('End time must be later than the start time for the auction');
      return;
    }

    if (startTime <= currentTimestamp) {
      setError('Start time must be later than the current time');
      return;
    }

    if (
      itemImage.current &&
      itemImage.current.files[0] &&
      !imgTypes.includes(itemImage.current.files[0].type)
    ) {
      setError('Please use a valid image');
      return;
    }

    const user = auth.currentUser;

    if (user && user.email) {
      try {
        const downloadURL = await handleFileUpload();

        if (downloadURL) {
          if (user) {
            const newAuction = {
              auctionType,
              itemImage: downloadURL,
              title,
              description,
              startDate,
              endDate,
              currencies: currencies
                .filter((currency) => currency.enabled)
                .map((currency) => ({
                  currency: currency.currency,
                  price: currency.currency === 'Barter' ? currency.price : parseFloat(currency.price),
                })),
              email: user.email,
              timestamp: new Date().toLocaleString(),
              uploader: user.uid,
            };

            const doc = await db.collection('Users').doc(user.uid).get();

            if (doc.exists) {
              const userData = doc.data();
              newAuction.username = userData.username;
              newAuction.displayName = userData.displayName;
              newAuction.address = userData.address;
              newAuction.country = userData.country;
              newAuction.phoneNumber = userData.phone || '';

              newAuction.city = userData.city;
              newAuction.stateOrTerritory = userData.stateOrTerritory;
              newAuction.zipCode = userData.zipCode;

              await db.collection('Auctions').add(newAuction);

              // Show a success message
              setSuccessMessage('Auction has been added successfully.');

              // Clear the form
              setAuctionType('product');
              setImageOrVideo('');
              setTitle('');
              setDescription('');
              setStartDate('');
              setEndDate('');
              const resetCurrencies = currencies.map(currency => ({
                ...currency,
                enabled: false,
                price: '',
              }));
              setCurrencies(resetCurrencies);

              // Refresh the page
              window.location.reload();

              // Alternatively, you can navigate to the auction page
              // navigate('/auction', {
              //   state: {
              //     currencies: currencies
              //       .filter((currency) => currency.enabled)
              //       .map((currency) => currency.currency),
              //     auctionType: auctionType,
              //   },
              // });
            } else {
              setError('Error fetching user data');
            }
          } else {
            setError('User is undefined');
          }
        }
      } catch (error) {
        console.error('Error adding auction to Firestore:', error);
        setError('Error adding auction to Firestore');
      }
    } else {
      setError('User is undefined or does not have an email');
    }
  };

  const handleFileUpload = async () => {
    const file = itemImage.current.files[0];

    if (file) {
      const storageRef = storage.ref(`auction-images/${file.name}`);

      try {
        const fileSnapshot = await storageRef.put(file);
        const downloadURL = await fileSnapshot.ref.getDownloadURL();
        return downloadURL;
      } catch (error) {
        console.error('Error uploading the image:', error);
        setError('Error uploading the image');
        return null;
      }
    } else {
      return null;
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <h1 style={{ textAlign: 'center' }}>Create an Auction</h1>
        <form className="auction-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Auction Type:
            <select
              value={auctionType}
              onChange={handleAuctionTypeChange}
              className="form-input"
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </label>
          <label className="form-label">
            Image or Video:
            <input
              type="file"
              ref={itemImage}
              value={imageOrVideo}
              accept="image/*, video/*"
              onChange={(e) => setImageOrVideo(e.target.value)}
              className="form-input"
            />
          </label>
          <label className="form-label">
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </label>
          <label className="form-label">
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
          </label>
          <label className="form-label">
            Start Date:
            <input
              type="datetime-local"
              value={startDate}
              onChange={handleStartDateChange}
              className="form-input"
            />
          </label>
          <label className="form-label">
            End Date:
            <input
              type="datetime-local"
              value={endDate}
              onChange={handleEndDateChange}
              className="form-input"
            />
          </label>
          <h3>Minimum Price for each Currency for Auction:</h3>
          {currencies.map((currency, index) => (
            <div key={currency.currency} className="currency-input">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currency.enabled}
                  onChange={(e) => handleCurrencyChange(e, currency.currency)}
                />
                {currency.currency}
                {currency.currency === 'LocalCurrency' && currency.enabled && (
                  <select
                    value={currency.localCurrencyType}
                    onChange={(e) => handleLocalCurrencyChange(e)}
                    className="form-input"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                )}
                {currency.currency === 'Barter' && currency.enabled && (
                  <input
                    type="text"
                    value={currency.price}
                    onChange={(e) => handleBarterChange(e)}
                    placeholder={`Items or Services You Want in Return`}
                    className="form-input"
                    disabled={!currency.enabled}
                  />
                )}
                {currency.enabled && currency.currency !== 'Barter' && (
                  <input
                    type="number"
                    value={currency.price}
                    onChange={(e) => handlePriceChange(e, currency.currency)}
                    placeholder={`Price in ${currency.currency}`}
                    className="form-input"
                    disabled={!currency.enabled}
                  />
                )}
              </label>
            </div>
          ))}
          <br />
          <br />
          <button type="submit" className="submit-button">
            Create Auction
          </button>
        </form>
    </div>
  );
};

export default AddAuction;
