import React, { useState } from 'react';
import { storage, db, auth } from '../../firebase';

const AddServices = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currencies, setCurrencies] = useState({
    STar: { selected: false, price: '', quantity: '' },
    Sterling: { selected: false, price: '', quantity: '' },
    LocalCurrency: { selected: false, price: '', quantity: '', selectedOption: 'USD' },
    CryptoCurrency: { selected: false, price: '', quantity: '' },
    Barter: { selected: false, quantity: '', products: [], services: [] },
  });
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadError, setUploadError] = useState('');

  const types = ['image/jpg', 'image/jpeg', 'image/png'];

  const handleServiceImg = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && types.includes(selectedFile.type)) {
        setImage(selectedFile);
        setImageError('');
      } else {
        setImage(null);
        setImageError('Please select a valid image file type (png or jpg)');
      }
    } else {
      console.log('Please select your file');
      setImage(null);
      setImageError('');
    }
  };

   // Validation check for negative quantity and price
  const validateQuantityAndPrice = (value) => {
    return value >= 0;
  };

  const handleCurrencyChange = (currency) => {
    setCurrencies((prevCurrencies) => ({
      ...prevCurrencies,
      [currency]: {
        ...prevCurrencies[currency],
        selected: !prevCurrencies[currency].selected,
      },
    }));
  };

  const handleCurrencyValueChange = (currency, field, value) => {
    // Convert the value to a number if it's not empty
    const numericValue = value !== '' ? parseFloat(value) : '';

    // Validate that quantity and price are not negative
    if (field === 'quantity' || field === 'price') {
      if (!validateQuantityAndPrice(numericValue)) {
        return;
      }
    }

    setCurrencies((prevCurrencies) => ({
      ...prevCurrencies,
      [currency]: {
        ...prevCurrencies[currency],
        [field]: numericValue,
      },
    }));

    if (currency === 'LocalCurrency' && field === 'selectedOption') {
      setCurrencies((prevCurrencies) => ({
        ...prevCurrencies,
        LocalCurrency: {
          ...prevCurrencies.LocalCurrency,
          [field]: value,
        },
      }));
    }
  }; 

  const handleBarteringProductChange = (index, field, value) => {
    setCurrencies((prevCurrencies) => {
      const updatedProducts = [...prevCurrencies.Barter.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value,
      };
      return {
        ...prevCurrencies,
        Barter: {
          ...prevCurrencies.Barter,
          products: updatedProducts,
        },
      };
    });
  };

  const handleBarteringServiceChange = (index, field, value) => {
    setCurrencies((prevCurrencies) => {
      const updatedServices = [...prevCurrencies.Barter.services];
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      };
      return {
        ...prevCurrencies,
        Barter: {
          ...prevCurrencies.Barter,
          services: updatedServices,
        },
      };
    });
  };

  const addBarteringProduct = () => {
    setCurrencies((prevCurrencies) => ({
      ...prevCurrencies,
      Barter: {
        ...prevCurrencies.Barter,
        products: [...prevCurrencies.Barter.products, { title: '', description: '' }],
      },
    }));
  };

  const removeBarteringProduct = (index) => {
    setCurrencies((prevCurrencies) => {
      const updatedProducts = [...prevCurrencies.Barter.products];
      updatedProducts.splice(index, 1);
      return {
        ...prevCurrencies,
        Barter: {
          ...prevCurrencies.Barter,
          products: updatedProducts,
        },
      };
    });
  };

  const addBarteringService = () => {
    setCurrencies((prevCurrencies) => ({
      ...prevCurrencies,
      Barter: {
        ...prevCurrencies.Barter,
        services: [...prevCurrencies.Barter.services, { title: '', description: '' }],
      },
    }));
  };

  const removeBarteringService = (index) => {
    setCurrencies((prevCurrencies) => {
      const updatedServices = [...prevCurrencies.Barter.services];
      updatedServices.splice(index, 1);
      return {
        ...prevCurrencies,
        Barter: {
          ...prevCurrencies.Barter,
          services: updatedServices,
        },
      };
    });
  };

  const calculateTotalQuantity = () => {
    let totalQuantity = 0;
    if (currencies.STar.selected) totalQuantity += parseInt(currencies.STar.quantity, 10) || 0;
    if (currencies.Sterling.selected) totalQuantity += parseInt(currencies.Sterling.quantity, 10) || 0;
    if (currencies.LocalCurrency.selected) totalQuantity += parseInt(currencies.LocalCurrency.quantity, 10) || 0;
    if (currencies.CryptoCurrency.selected) totalQuantity += parseInt(currencies.CryptoCurrency.quantity, 10) || 0;
    if (currencies.Barter.selected) totalQuantity += parseInt(currencies.Barter.quantity, 10) || 0;
  
    return totalQuantity;
  };  

  const handleAddServices = async (e) => {
    e.preventDefault();
  
    const isCurrencySelected =
      currencies.STar.selected ||
      currencies.Sterling.selected ||
      currencies.LocalCurrency.selected ||
      currencies.CryptoCurrency.selected ||
      currencies.Barter.selected;
  
    if (!isCurrencySelected) {
      setUploadError('Please select at least one currency');
      return;
    }
  
    if (!title.trim() || !description.trim() || !image) {
      setUploadError('Please enter a valid title, description, and select an image');
      return;
    }
  
    try {
      const uploadTask = storage.ref(`service-images/${image.name}`).put(image);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress);
        },
        (error) => {
          setUploadError(error.message);
          console.log('Upload error:', error.message);
        },
        async () => {
          try {
            const url = await storage.ref('service-images').child(image.name).getDownloadURL();
  
            const serviceData = {
              title,
              description,
              image: url,
              timestamp: new Date().toLocaleString(),
              phoneNumber: '',
              currencies: [],
            };
  
            const totalQuantity = calculateTotalQuantity();
            serviceData.totalQuantity = totalQuantity;
  
            // Inside the handleAddProducts function
            if (currencies.Barter.selected) {
              const barterData = {
                currency: 'Barter',
                quantity: currencies.Barter.quantity,
                items: [],
              };

              barterData.items = [
                ...currencies.Barter.products.map((product) => ({
                  type: 'Product',
                  title: product.title.trim(),
                  description: product.description.trim(),
                })),
                ...currencies.Barter.services.map((service) => ({
                  type: 'Service',
                  title: service.title.trim(),
                  description: service.description.trim(),
                })),
              ];

              serviceData.currencies.push(barterData);
            }

            if (currencies.STar.selected) {
              serviceData.currencies.push({
                currency: 'STar',
                price: currencies.STar.price || 0,
                quantity: currencies.STar.quantity,
              });
            }
  
            if (currencies.Sterling.selected) {
              serviceData.currencies.push({
                currency: 'Sterling',
                price: currencies.Sterling.price || 0,
                quantity: currencies.Sterling.quantity,
              });
            }
  
            if (currencies.LocalCurrency.selected) {
              const localCurrencyData = {
                currency: 'LocalCurrency',
                price: currencies.LocalCurrency.price || 0,
                quantity: currencies.LocalCurrency.quantity,
                selectedOptions: [
                  { 
                    type: 'LocalCurrency', 
                    value: currencies.LocalCurrency.selectedOption, 
                    country: currencies.LocalCurrency.selectedOption
                 },
                ],
              };
      
              serviceData.currencies.push(localCurrencyData);
            }                
  
            if (currencies.CryptoCurrency.selected) {
              serviceData.currencies.push({
                currency: 'CryptoCurrency',
                price: currencies.CryptoCurrency.price || 0,
                quantity: currencies.CryptoCurrency.quantity,
              });
            }
  
            const user = auth.currentUser;
            if (user) {
              serviceData.uploader = user.uid;
              serviceData.email = user.email;
  
              db.collection('Users')
                .doc(user.uid)
                .get()
                .then((doc) => {
                  if (doc.exists) {
                    const userData = doc.data();
                    serviceData.username = userData.username;
                    serviceData.displayName = userData.displayName;
                    serviceData.address = userData.address;
                    serviceData.country = userData.country;
                    serviceData.phoneNumber = userData.phone || '';
  
                     // Add the user's city, state/union territory, and zip code to the product data
                    serviceData.city = userData.city;
                    serviceData.stateOrTerritory = userData.stateOrTerritory;
                    serviceData.zipCode = userData.zipCode;

                    db.collection('Services')
                      .add(serviceData)
                      .then(() => {
                        setSuccessMsg('Service added successfully');
                        setTitle('');
                        setDescription('');
                        setCurrencies({
                          STar: { selected: false, price: '', quantity: '' },
                          Sterling: { selected: false, price: '', quantity: '' },
                          LocalCurrency: { selected: false, price: '', quantity: '' },
                          CryptoCurrency: { selected: false, price: '', quantity: '' },
                          Barter: { selected: false, quantity: '', products: [], services: [] },
                        });
                        setImage(null);
                        setImageError('');
                        setUploadError('');
                        window.location.reload();
                      })
                      .catch((error) => setUploadError(error.message));
                  } else {
                    console.log('User data not found');
                  }
                })
                .catch((error) => console.log('Error fetching user data:', error));
            }
          } catch (error) {
            setUploadError(error.message);
          }
        }
      );
    } catch (error) {
      setUploadError(error.message);
    }
  };  

  const totalServiceQuantity = calculateTotalQuantity();

  return (
    <div className="container">
      <br />
      <br />
      <h1>Add Services</h1>
      <hr />
      {successMsg && (
        <>
          <br />
          <div className="success-msg">{successMsg}</div>
        </>
      )}
      <form autoComplete="off" className="form-group" onSubmit={handleAddServices}>
        <label>Service Title</label>
        <input
          type="text"
          className="form-control"
          required
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <br />
        <label>Service Description</label>
        <input
          type="text"
          className="form-control"
          required
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
        <br />
        <div>
          <label>
            <input
              type="checkbox"
              checked={currencies.Barter.selected}
              onChange={() => handleCurrencyChange('Barter')}
            />
            {' '}
            Barter
          </label>
          <br />
          {currencies.Barter.selected && (
            <>
              <label>Bartering Quantity</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="1"
                value={currencies.Barter.quantity}
                onChange={(e) => handleCurrencyValueChange('Barter', 'quantity', e.target.value)}
                placeholder="Quantity"
                required
              />
              <br />
              <label>Bartering (Products)</label>
              {currencies.Barter.products.map((product, index) => (
                <div key={index}>
                  <input
                    type="text"
                    className="form-control"
                    value={product.title}
                    onChange={(e) => handleBarteringProductChange(index, 'title', e.target.value)}
                    placeholder="Product Title"
                  />
                  <br />
                  <input
                    type="text"
                    className="form-control"
                    value={product.description}
                    onChange={(e) => handleBarteringProductChange(index, 'description', e.target.value)}
                    placeholder="Product Description"
                  />
                  <br />
                  {index > 0 && (
                    <button type="button" className="btn btn-danger" onClick={() => removeBarteringProduct(index)}>
                      Remove Product
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={addBarteringProduct}>
                Add Product
              </button>
              <br />
              <label>Bartering (Services)</label>
              {currencies.Barter.services.map((service, index) => (
                <div key={index}>
                  <input
                    type="text"
                    className="form-control"
                    value={service.title}
                    onChange={(e) => handleBarteringServiceChange(index, 'title', e.target.value)}
                    placeholder="Service Title"
                  />
                  <br />
                  <input
                    type="text"
                    className="form-control"
                    value={service.description}
                    onChange={(e) => handleBarteringServiceChange(index, 'description', e.target.value)}
                    placeholder="Service Description"
                  />
                  <br />
                  {index > 0 && (
                    <button type="button" className="btn btn-danger" onClick={() => removeBarteringService(index)}>
                      Remove Service
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={addBarteringService}>
                Add Service
              </button>
              <br />
            </>
          )}
        </div>
        <br />
        <div>
          <label>
            <input
              type="checkbox"
              checked={currencies.STar.selected}
              onChange={() => handleCurrencyChange('STar')}
            />
            {' '}
            STar
          </label>
          <br />
          {currencies.STar.selected && (
            <>
              <label>STar Price</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="0.01"
                value={currencies.STar.price}
                onChange={(e) => handleCurrencyValueChange('STar', 'price', e.target.value)}
                placeholder="Price"
                required
              />
              <br />
              <label>STar Quantity</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="1"
                value={currencies.STar.quantity}
                onChange={(e) => handleCurrencyValueChange('STar', 'quantity', e.target.value)}
                placeholder="Quantity"
                required
              />
              <br />
            </>
          )}
        </div>
        <br />
        <div>
          <label>
            <input
              type="checkbox"
              checked={currencies.Sterling.selected}
              onChange={() => handleCurrencyChange('Sterling')}
            />
            {' '}
            Sterling
          </label>
          <br />
          {currencies.Sterling.selected && (
            <>
              <label>Sterling Price</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="0.01"
                value={currencies.Sterling.price}
                onChange={(e) => handleCurrencyValueChange('Sterling', 'price', e.target.value)}
                placeholder="Price"
                required
              />
              <br />
              <label>Sterling Quantity</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="1"
                value={currencies.Sterling.quantity}
                onChange={(e) => handleCurrencyValueChange('Sterling', 'quantity', e.target.value)}
                placeholder="Quantity"
                required
              />
              <br />
            </>
          )}
        </div>
        <br />
        <div>
          <label>
            <input
              type="checkbox"
              checked={currencies.LocalCurrency.selected}
              onChange={() => handleCurrencyChange('LocalCurrency')}
            />
            {' '}
            Local Currency
          </label>
          <br />
          {currencies.LocalCurrency.selected && (
            <>
              <label>Local Currency Price</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="0.01"
                value={currencies.LocalCurrency.price}
                onChange={(e) => handleCurrencyValueChange('LocalCurrency', 'price', e.target.value)}
                placeholder="Price"
                required
              />
              <br />
              <label>Local Currency Quantity</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="1"
                value={currencies.LocalCurrency.quantity}
                onChange={(e) => handleCurrencyValueChange('LocalCurrency', 'quantity', e.target.value)}
                placeholder="Quantity"
                required
              />
              <br />
              <label>Local Currency Option</label>
              <select
                className="form-control"
                value={currencies.LocalCurrency.selectedOption}
                onChange={(e) => handleCurrencyValueChange('LocalCurrency', 'selectedOption', e.target.value)}
              >
                <option value="USD">US Dollar</option>
                <option value="INR">Indian Rupee</option>
              </select>
              <br />
            </>
          )}
        </div>
        <br />
        <div>
          <label>
            <input
              type="checkbox"
              checked={currencies.CryptoCurrency.selected}
              onChange={() => handleCurrencyChange('CryptoCurrency')}
            />
            {' '}
            CryptoCurrency
          </label>
          <br />
          {currencies.CryptoCurrency.selected && (
            <>
              <label>CryptoCurrency Price</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="0.01"
                value={currencies.CryptoCurrency.price}
                onChange={(e) => handleCurrencyValueChange('CryptoCurrency', 'price', e.target.value)}
                placeholder="Price"
                required
              />
              <br />
              <label>CryptoCurrency Quantity</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="1"
                value={currencies.CryptoCurrency.quantity}
                onChange={(e) => handleCurrencyValueChange('CryptoCurrency', 'quantity', e.target.value)}
                placeholder="Quantity"
                required
              />
              <br />
            </>
          )}
        </div>
        <br />
        <label>Service Image</label>
        <input type="file" className="form-control" onChange={handleServiceImg} />
        <br />
        {imageError && <div className="error-msg">{imageError}</div>}
        <br />
        <div className="text-center">
          <button type="submit" className="btn btn-success">
            Add Service
          </button>
          {uploadError && <div className="error-msg">{uploadError}</div>}
        </div>
        <br></br>
        {totalServiceQuantity > 0 && (
          <div className="total-quantity-info">
            Total Quantity: {totalServiceQuantity}
          </div>
        )}
      </form>     
    </div>
  );
};

export default AddServices;
