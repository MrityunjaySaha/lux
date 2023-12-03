import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/feather/plus';
import { minus } from 'react-icons-kit/feather/minus';
import StripeCheckout from 'react-stripe-checkout';
import { UserNavbar } from '../userNavbar/UserNavbar';
import './servicedetails.css'
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRef } from 'react';

const ServiceDetails = () => {
    const { currentUser } = auth;
  const [user, setUser] = useState(null);
  const { serviceId } = useParams();
  const [serviceDetails, setServiceDetails] = useState(null);
  const [cartServices, setCartServices] = useState({}); // Use an object to store quantities for each currency
  const [selectedLocalCurrency, setSelectedLocalCurrency] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(0); // Add this state variable
  const [selectedQuantity, setSelectedQuantity] = useState(0); // Initialize with 0
  const [totalPriceSterling, setTotalPriceSterling] = useState(0);
  const [userSterlingBalance, setUserSterlingBalance] = useState(0);
  const [starBalance, setSTarBalance] = useState(0);
  const [insufficientFunds, setInsufficientFunds] = useState(false); // Add this state variable
  const [barterOfferAccepted, setBarterOfferAccepted] = useState(false); // Step 1

  // Function to handle the acceptance of the barter offer
  const handleAcceptBarterOffer = async () => {
    try {
      // Ensure that the user is authenticated
      if (!currentUser) {
        console.error("User is not authenticated.");
        return;
      }

      // Check if the barter offer has already been accepted
      if (barterOfferAccepted) {
        console.error("Barter offer has already been accepted.");
        return;
      }

      // Fetch the current service data
      const serviceRef = db.collection('Services').doc(serviceId);
      const serviceSnapshot = await serviceRef.get();
      const serviceData = serviceSnapshot.data();

      // Calculate the updated Barter quantity based on selected quantity and update the database
      const updatedBarterQuantity = (serviceData.currencies.find(currency => currency.currency === 'Barter')?.quantity || 0) - selectedQuantity;

      // Update the service data in the database
      await serviceRef.update({
        currencies: serviceData.currencies.map(currency => {
          if (currency.currency === 'Barter') {
            return {
              ...currency,
              quantity: updatedBarterQuantity,
            };
          }
          return currency;
        }),
      });

      // Update the state variable to indicate the barter offer has been accepted
      setBarterOfferAccepted(true);

      window.location.reload();
      toast.success('Your order has been placed successfully', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
      // Perform other necessary actions, such as notifying the user

      console.log('Barter offer accepted successfully.');
    } catch (error) {
      console.error("Error while accepting the barter offer:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
  
    const sterlingBankRef = db.collection('SterlingBank').doc(`SterlingBank-${currentUser.uid}`);
    sterlingBankRef.onSnapshot((doc) => {
      if (doc.exists) {
        setUserSterlingBalance(doc.data().balance);
      } else {
        sterlingBankRef.set({ balance: 0 });
        setUserSterlingBalance(0);
      }
    });
  }, [currentUser]);
  
  useEffect(() => {
    // This code will run once when the component mounts
    const fetchUserSTarBalance = async () => {
        try {
          if (!currentUser) return;
    
          const starBankRef = db.collection('STarBank').doc(`STarBank-${currentUser.uid}`);
          const doc = await starBankRef.get();
    
          if (doc.exists) {
            setSTarBalance(doc.data().balance);
          } else {
            starBankRef.set({ balance: 0 });
            setSTarBalance(0);
          }
        } catch (error) {
          console.error('Error fetching user STar balance:', error);
        }
      };
        setUser();
        fetchUserSTarBalance();
    }, [currentUser]);

  // Function to handle payment with STara
  const handlePaymentWithSTar = async () => {
    console.log('currentUser:', currentUser);
    console.log('userSterlingBalance:', starBalance);

    try {
        if (!currentUser) {
            console.error("User is not authenticated.");
            return;
        }

        // Retrieve the Sterling price from productDetails or any relevant source
        const starPrice = serviceDetails?.currencies?.find(currency => currency.currency === 'STar')?.price;

        // Check if the Sterling price is available
        if (!starPrice) {
            console.error("STar price not found.");
            return;
        }
        
        const totalSTarPrice = calculateTotalPriceInSTar(starPrice, selectedQuantity); // Calculate the total Sterling price

        // Check if the user has enough Sterling balance
        if (starBalance < totalSTarPrice) {
            setInsufficientFunds(true); // Set the insufficient funds state to true
            return;
        }
    
        const newBalance = starBalance - totalSTarPrice;

        const starBankRef = db.collection('STarBank').doc(`STarBank-${currentUser.uid}`);
    
        console.log('Total Price:', totalSTarPrice);
        console.log('New Balance:', newBalance);

        // Update the Sterling balance in the Firestore database
        await starBankRef.update({ balance: newBalance });

        // Update the userSterlingBalance state variable
        setSTarBalance(newBalance); // Convert back to a decimal value

        // Update the product quantity in the database
        const serviceRef = db.collection('Services').doc(serviceId);

        // Fetch the current product data
        const serviceSnapshot = await serviceRef.get();
        const serviceData = serviceSnapshot.data();

        // Calculate the new Sterling quantity
        const updatedSTarQuantity = serviceData.currencies.find(currency => currency.currency === 'STar').quantity - selectedQuantity;

        console.log('Updated STar Quantity:', updatedSTarQuantity);

        // Update the product quantity
        await serviceRef.update({
            currencies: serviceData.currencies.map(currency => {
                if (currency.currency === 'STar') {
                return {
                    ...currency,
                    quantity: updatedSTarQuantity,
                };
                }
                return currency;
            })
        });
        // Perform other necessary actions here, such as updating the order status, sending confirmation emails, etc.

        // You can also navigate to a success page or display a success message
        navigate(`/service/${serviceId}`);
        window.location.reload();
        toast.success('Your order has been placed successfully', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
        });
    } catch (error) {
        console.error("Error while updating user's STar balance or product quantity:", error);
    }
  };

  // Create a ref to hold the latest selectedQuantity value
  const selectedQuantityRef = useRef(selectedQuantity);

  // Update the ref whenever selectedQuantity changes
  useEffect(() => {
    selectedQuantityRef.current = selectedQuantity;
  }, [selectedQuantity]);

  useEffect(() => {
    const getCurrentUser = () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          db.collection('Users')
            .doc(user.uid)
            .get()
            .then((snapshot) => {
              setUser(snapshot.data().displayName);
            });
        } else {
          setUser(null);
        }
      });
    };
  
    const fetchUserSterlingBalance = async () => {
      try {
        if (!currentUser) return;
  
        const sterlingBankRef = db.collection('SterlingBank').doc(`SterlingBank-${currentUser.uid}`);
        const doc = await sterlingBankRef.get();
  
        if (doc.exists) {
          setUserSterlingBalance(doc.data().balance);
        } else {
          sterlingBankRef.set({ balance: 0 });
          setUserSterlingBalance(0);
        }
      } catch (error) {
        console.error('Error fetching user Sterling balance:', error);
      }
    };
  
    getCurrentUser();
    fetchUserSterlingBalance();
  }, [currentUser]);  

  useEffect(() => {
    db.collection('Services')
      .doc(serviceId)
      .get()
      .then(snapshot => {
        if (snapshot.exists) {
          const data = snapshot.data();
          setServiceDetails(data);
        }
      });
  }, [serviceId]);

  const barterCurrency = serviceDetails?.currencies?.find(
    currency => currency.currency === 'Barter'
  );
  const barterProducts =
    barterCurrency?.items?.filter(item => item.type === 'Product') || [];
  const barterServices =
    barterCurrency?.items?.filter(item => item.type === 'Service') || [];

  const totalQuantity = serviceDetails?.currencies?.reduce(
    (total, currency) => total + currency.quantity,
    0
  );

  const cartServiceIncrease = currency => {
    setCartServices(prevCartServices => {
      const updatedServices = { ...prevCartServices };
      const currentQuantity = updatedServices[currency] || 0;
      const maxQuantity = serviceDetails?.currencies?.find(c => c.currency === currency)?.quantity;

      if (currentQuantity < maxQuantity) {
        updatedServices[currency] = currentQuantity + 1;
        setSelectedQuantity(prevQuantity => prevQuantity + 1); // Update selectedQuantity
      }

      return updatedServices;
    });
  };

  const cartServiceDecrease = currency => {
    setCartServices(prevCartServices => {
      if (prevCartServices[currency] && prevCartServices[currency] > 0) {
        const updatedServices = { ...prevCartServices };
        updatedServices[currency] = updatedServices[currency] - 1;
        setSelectedQuantity(prevQuantity => prevQuantity - 1); // Update selectedQuantity
        return updatedServices;
      }
      return prevCartServices;
    });
  };

  // Modify the calculateTotalPrice function
    const calculateTotalPrice = useCallback((currency, quantity) => {
        const currencyData = serviceDetails?.currencies?.find(c => c.currency === currency);
        if (currencyData) {
        if (currency !== 'Barter') {
            if (currency === 'Sterling') {
            return calculateTotalPriceInSterling(currencyData.price, quantity); // Calculate Sterling separately
            } else if (currency === 'STar') {
            return calculateTotalPriceInSTar(currencyData.price, quantity); // Calculate STara separately
            } else {
            return selectedPrice * quantity;
            }
        } else {
            // Calculate Barter value based on selected products and services
            // Return the calculated value
        }
        }
        return 0;
    }, [serviceDetails?.currencies, selectedPrice]);

    useEffect(() => {
        const currencyData = serviceDetails?.currencies?.find(
          currency => currency.currency === 'Sterling'
        );
        if (currencyData) {
          const total = calculateTotalPrice(
            currencyData.currency,
            cartServices[currencyData.currency] || 0
          );
          setTotalPriceSterling(total);
        }
    }, [selectedPrice, cartServices, serviceDetails, calculateTotalPrice]);    

    // Example function to calculate the new quantity based on currencyData
    const calculateNewQuantity = currencyData => {
        // Implement your logic here to calculate the new quantity
        // For example, if it's based on currencyData properties, you can do something like this:
        if (currencyData.currency === 'USD') {
            return selectedQuantityRef.current; // Set the quantity to 5 for CurrencyA
        } else if (currencyData.currency === 'INR') {
            return selectedQuantityRef.current; // Set the quantity to 10 for CurrencyB
        } else {
            return selectedQuantityRef.current; // Keep the current selectedQuantity for other currencies
        }
    };
    
    // Separate function to handle local currency selection
    const handleLocalCurrencyClick = currencyData => {
        console.log('Selected Local Currency:', currencyData.selectedOptions[0].value);
        console.log('Currency Data:', currencyData)
        setSelectedLocalCurrency(currencyData.selectedOptions[0].value); // Update selectedCurrency state
        setSelectedPrice(currencyData.currency !== 'Barter' ? currencyData.price : 0); // Update selectedPrice based on the selected currency
        
        // Calculate a new quantity based on currencyData (example)
        const updatedQuantity = calculateNewQuantity(currencyData);
        setSelectedQuantity(updatedQuantity);
    };    
  
    // Function to calculate the total price for STara
    const calculateTotalPriceInSTar = (starPrice, starQuantity) => {
        // Ensure that staraPrice and staraQuantity are valid numbers
        const price = parseFloat(starPrice) || 0;
        const quantity = parseInt(starQuantity, 10) || 0;
    
        // Calculate the total price
        const totalPrice = price * quantity;
    
        return totalPrice;
    };
  
    // Function to calculate the total price in Sterling
    const calculateTotalPriceInSterling = (sterlingPrice, sterlingQuantity) => {
        // Ensure that sterlingPrice and sterlingQuantity are valid numbers
        const price = parseFloat(sterlingPrice) || 0;
        const quantity = parseInt(sterlingQuantity, 10) || 0;
    
        // Calculate the total price
        const totalPrice = price * quantity;
    
        return totalPrice;
    };

    // charging payment
    const navigate = useNavigate();
    // Define a separate function to handle payment with Sterling
    const handlePaymentWithSterling = async () => {
        console.log('currentUser:', currentUser);
        console.log('userSterlingBalance:', userSterlingBalance);
    
        try {
            if (!currentUser) {
                console.error("User is not authenticated.");
                return;
            }

            // Retrieve the Sterling price from productDetails or any relevant source
            const sterlingPrice = serviceDetails?.currencies?.find(currency => currency.currency === 'Sterling')?.price;

            // Check if the Sterling price is available
            if (!sterlingPrice) {
                console.error("Sterling price not found.");
                return;
            }
            
            const totalSterlingPrice = calculateTotalPriceInSterling(sterlingPrice, selectedQuantity); // Calculate the total Sterling price

            // Check if the user has enough Sterling balance
            if (userSterlingBalance < totalSterlingPrice) {
                setInsufficientFunds(true); // Set the insufficient funds state to true
                return;
            }
        
            const newBalance = userSterlingBalance - totalSterlingPrice;

            const sterlingBankRef = db.collection('SterlingBank').doc(`SterlingBank-${currentUser.uid}`);
        
            console.log('Total Price:', totalSterlingPrice);
            console.log('New Balance:', newBalance);
    
            // Update the Sterling balance in the Firestore database
            await sterlingBankRef.update({ balance: newBalance });

            // Update the userSterlingBalance state variable
            setUserSterlingBalance(newBalance); // Convert back to a decimal value
    
            // Update the product quantity in the database
            const serviceRef = db.collection('Services').doc(serviceId);
    
            // Fetch the current product data
            const serviceSnapshot = await serviceRef.get();
            const serviceData = serviceSnapshot.data();
    
            // Calculate the new Sterling quantity
            const updatedSterlingQuantity = serviceData.currencies.find(currency => currency.currency === 'Sterling').quantity - selectedQuantity;

            console.log('Updated Sterling Quantity:', updatedSterlingQuantity);

            // Update the product quantity
            await serviceRef.update({
                currencies: serviceData.currencies.map(currency => {
                    if (currency.currency === 'Sterling') {
                    return {
                        ...currency,
                        quantity: updatedSterlingQuantity,
                    };
                    }
                    return currency;
                })
            });
            // Perform other necessary actions here, such as updating the order status, sending confirmation emails, etc.
    
            // You can also navigate to a success page or display a success message
            navigate(`/service/${serviceId}`);
            window.location.reload();

            toast.success('Your order has been placed successfully', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
            });
        } catch (error) {
            console.error("Error while updating user's Sterling balance or product quantity:", error);
        }
    };
    
    const handleToken = async (token, selectedQuantity) => {
        if (!selectedLocalCurrency) {
          console.error("Please select a currency");
          return;
        }
      
        console.log("Selected Price:", selectedPrice);
        console.log("Selected Quantity:", selectedQuantityRef);
        console.log("Selected Local Currency:", selectedLocalCurrency);
      
        // Calculate the total price based on selectedPrice and selectedQuantity
        const totalPrice = selectedPrice * selectedQuantity;
        console.log('Total Price:', totalPrice);
      
        // Check if the selected local currency matches the product's local currency
        const serviceLocalCurrency = serviceDetails?.currencies?.find(currency => currency.currency === 'LocalCurrency')?.selectedOptions[0].value;
        if (serviceLocalCurrency !== selectedLocalCurrency) {
          console.error("Selected currency does not match the product's local currency");
          return;
        }
      
        // Modify the data structure to match what the server expects
        const requestData = {
          cart: {
            name: 'All Products & Services',
            localCurrency: selectedLocalCurrency,
            quantity: selectedQuantityRef,
            selectedPrice: selectedPrice,
          },
          token: token,
        };
      
        try {
          const response = await axios.post('http://localhost:8080/service-checkout', requestData);
          console.log(response);
          let { status } = response.data;
          console.log(status);
      
          if (status === 'success') {
            // Update the product quantity in the database here
            const serviceRef = db.collection('Services').doc(serviceId);
      
            // Fetch the current product data
            const serviceSnapshot = await serviceRef.get();
            const serviceData = serviceSnapshot.data();
      
            // Calculate the new quantity
            const updatedQuantity = serviceData.currencies.find(currency => currency.currency === 'LocalCurrency').quantity - selectedQuantity;
      
            // Update the product document with the new quantity value in the `currencies` array
            await serviceRef.update({
              currencies: serviceData.currencies.map(currency => {
                if (currency.currency === 'LocalCurrency') {
                  return {
                    ...currency,
                    quantity: updatedQuantity,
                  };
                }
                return currency;
              }),
            });
      
            // Navigate to a success page or display a success message
            navigate(`/service/${serviceId}`);
            window.location.reload();
            toast.success('Your order has been placed successfully', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              progress: undefined,
            });
          } else {
            alert(response.data.message); // Modify this to match the actual structure of your response
          }
        } catch (error) {
          console.error("Error while making the POST request:", error);
        }
    }
      
  // Render the component
  return (
    <div>
      <UserNavbar user={user} displayName={user} />
      <br />
      <br />
      <br />
      <br />
      <br />
      {/* Display product information */}
      <div className="product-details-container">
      <div className="product">
            <div>
                <span>Service</span>
            </div>
            <h2>{serviceDetails?.title}</h2>
            <div className="product-img">
                <img src={serviceDetails?.image} alt="Product" />
            </div>
            <div>
                <strong>Description:</strong> {serviceDetails?.description}
            </div>
            <br></br>
            {/* Display currency types, prices, and quantities */}
            <div>
              <strong>Prices:</strong>
              {serviceDetails?.currencies?.map((currencyData) => (
                <div key={currencyData.currency}>
                  <div>
                    <span className="currency-name">{currencyData.currency}:</span>
                    {currencyData.currency !== 'Barter' ? (
                      <>
                        <span className="price">Price: {currencyData.price}</span>
                        <span className="quantity">Quantity: {currencyData.quantity}</span>
                        {currencyData.currency === 'LocalCurrency' && (
                          <span className="local-currency">Selected Local Currency: {currencyData.selectedOptions[0].value}</span>
                        )}
                      </>
                    ) : (
                      <>Barter - Quantity: {currencyData.quantity}</>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
                <strong>Total Quantity:</strong> {totalQuantity}
            </div>
            <br></br>
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
            <br></br>
            {/* Display uploader's information */}
            <div>
                <strong>Uploader:</strong> {serviceDetails?.username}
            </div>
            <div>
                <strong>Display Name:</strong> {serviceDetails?.displayName}
            </div>
            <div>
                <strong>Address:</strong> {serviceDetails?.address}
            </div>
            <div>
                <strong>City:</strong> {serviceDetails?.city} {/* Display city */}
            </div>
            <div>
                <strong>State/Union Territory:</strong> {serviceDetails?.stateOrTerritory} {/* Display state/union territory */}
            </div>
            <div>
                <strong>Zip Code:</strong> {serviceDetails?.zipCode} {/* Display zip code */}
            </div>
            <div>
                <strong>Country:</strong> {serviceDetails?.country}
            </div>
            <div>
                <strong>Phone Number:</strong> {serviceDetails?.phoneNumber}
            </div>
            <div>
                <strong>Email:</strong> {serviceDetails?.email}
            </div>
            <div>
                <strong>Uploaded:</strong> {serviceDetails?.timestamp}
            </div>
        </div>

        {/* Display currency buttons and quantity controls */}
        <div className="available-currencies">
        <div className="available-currencies-container">
        <strong>Available Currencies:</strong>
        {serviceDetails?.currencies?.map(currencyData => (
          <div key={currencyData.currency}>
            {currencyData.currency === 'LocalCurrency' ? (
                <div>
                    {currencyData.currency} - {currencyData.selectedOptions[0].value}
                    <button
                        onClick={() => handleLocalCurrencyClick(currencyData)}
                        className={`currency-button ${
                            selectedLocalCurrency === currencyData.selectedOptions[0].value
                            ? 'selected-button'
                            : ''
                        }`}
                        >
                        Select
                    </button>
                </div>
            ) : (
                <div>
                    {currencyData.currency}
                </div>
            )}

                <div className="quantity-control">
                    <span>Quantity</span>
                    <div className="quantity-box">
                        <div className="action-btns minus" onClick={() => cartServiceDecrease(currencyData.currency)}>
                            <Icon icon={minus} size={20} />
                        </div>
                        <div className="quantity">{cartServices[currencyData.currency] || 0}</div>
                        <div className="action-btns plus" onClick={() => cartServiceIncrease(currencyData.currency)}>
                            <Icon icon={plus} size={20} />
                        </div>
                        </div><br></br>

                        {/* Display quantity for 'Barter' currency */}
                        {currencyData.currency === 'Barter' && (
                            <div>
                                Quantity: {cartServices[currencyData.currency] || 0}
                            </div>
                        )}

                        {/* Display "Accept" button for the Barter offer */}
                        {currencyData.currency === 'Barter' && !barterOfferAccepted && (
                          <div>
                            <p>We recommend you message the Uploader before accepting!</p>
                            <button onClick={handleAcceptBarterOffer}>Accept</button>
                          </div>
                        )}

                        {/* Display total price for the currency, except for 'Barter' */}
                        {currencyData.currency !== 'Barter' && (
                            <div>
                                Quantity: {cartServices[currencyData.currency] || 0}<br></br>
                                Price: {currencyData.currency === 'Sterling' ? (
                                    <span>
                                        {currencyData.price} <br></br>
                                        Total Price: {totalPriceSterling}<br></br>
                                        Sterling Balance: {userSterlingBalance}<br></br>
                                        <button onClick={handlePaymentWithSterling}>Pay with Sterling</button>
                                        {/* Display insufficient funds message */}
                                        {insufficientFunds && (
                                            <div className="insufficient-funds-message">
                                            You have insufficient Sterlings to make this purchase.
                                            </div>
                                        )}
                                    </span>
                                ) : currencyData.currency === 'STar' ? (
                                    <span>
                                        {currencyData.price} <br></br>
                                        Total Price: {calculateTotalPrice(currencyData.currency, cartServices[currencyData.currency] || 0)}<br></br>
                                        STar Balance:  {starBalance.toFixed(4)}<br></br> 
                                        <button onClick={handlePaymentWithSTar}>Pay with STar</button>
                                        {insufficientFunds && (
                                            <div className="insufficient-funds-message">
                                            You have insufficient STar balance to make this purchase.
                                            </div>
                                        )}
                                    </span>
                                ) : (
                                    <span>
                                        {currencyData.price}<br></br>
                                    </span>
                                )}    

                                {/* Add a check for the existence of currencyData.selectedOptions */}
                                {currencyData.selectedOptions && currencyData.selectedOptions[0] &&
                                    <div>
                                        Total Price: {calculateTotalPrice(currencyData.currency, cartServices[currencyData.currency] || 0)}<br></br>
                                        Currency: {currencyData.selectedOptions[0].value}
                                    </div>
                                }

                                {/* Log price and total price to the console */}
                                {console.log('Price:', currencyData.price)}
                                {console.log('Total Price:', calculateTotalPrice(currencyData.currency, cartServices[currencyData.currency] || 0))}
                            </div>
                        )}
                        <br></br>
                        {/* Integrate StripeCheckout component here */}
                        {currencyData.currency === 'LocalCurrency' && currencyData.selectedOptions[0].value === selectedLocalCurrency && (
                            <div>
                                {selectedLocalCurrency === 'INR' && (
                                  <div className="message">
                                    Make sure your total INR is at least 50 cents, we don't accept anything less.
                                  </div>
                                )}

                                <StripeCheckout
                                    stripeKey="pk_test_51Ni5FKKAIrTUOi75H2YjfoS6wiu0NoIN8LSCgNzoqdFV64KjwtG1fKhvYofX5y4fyaXjSxapnya2MjFZuytVyetC004RS2xrHM"
                                    token={(token) => handleToken(token, selectedQuantityRef.current)} // Pass selectedQuantity here
                                    billingAddress
                                    shippingAddress
                                    name="Luxmi"
                                    description={`Total Price: ${selectedPrice * selectedQuantity}`}
                                    amount={selectedPrice * selectedQuantity * 100} // Amount in cents
                                    currency={selectedLocalCurrency.toUpperCase()} // Convert to uppercase currency code
                                    >
                                    <button className="stripe-checkout-button">Pay with {currencyData.selectedOptions[0].value}</button>
                                </StripeCheckout>
                            </div>
                        )}
                        </div>
                    </div>
                ))}
                </div>
            </div>
            {/* Include the ToastContainer */}
            <ToastContainer />
        </div>
    </div>
  );
};

export default ServiceDetails;
