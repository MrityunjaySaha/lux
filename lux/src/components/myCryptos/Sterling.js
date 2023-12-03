import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import StripeCheckout from 'react-stripe-checkout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserNavbar } from '../userNavbar/UserNavbar';

const Sterling = () => {
    const { currentUser } = auth;
    const [user, setUser] = useState(null);
    const [sterlingAmount, setSterlingAmount] = useState(0);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [userSterlingBalance, setUserSterlingBalance] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0); // Added state for total price
    
    useEffect(() => {
        const getCurrentUser = () => {
          auth.onAuthStateChanged(user => {
            if (user) {
              db.collection('Users').doc(user.uid).get().then(snapshot => {
                setUser(snapshot.data().displayName); // Use 'displayName' here
              });
            } else {
              setUser(null);
            }
          });
        };
    
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const sterlingBankRef = db.collection('SterlingBank').doc(`SterlingBank-${currentUser.uid}`);

        sterlingBankRef.onSnapshot((doc) => {
            if (doc.exists) {
                setUserSterlingBalance(doc.data().balance);
            } else {
                sterlingBankRef.set({ balance: 0 });
            }
        });
    }, [currentUser]);
    
    const navigate = useNavigate();

    const handleBuySterlings = async (token) => {
        if (currentUser) {
            const rate = selectedCurrency === 'USD' ? 1 : 75;
            const sterlingAmountToBuy = sterlingAmount * rate;
            const newBalance = userSterlingBalance + sterlingAmountToBuy;

            const sterlingBankRef = db.collection('SterlingBank').doc(`SterlingBank-${currentUser.uid}`);
            await sterlingBankRef.update({ balance: newBalance });

            setUserSterlingBalance(newBalance);
            setSterlingAmount(0);

            const requestData = {
                cart: {
                    name: 'Sterling',
                    quantity: sterlingAmount,
                    currency: selectedCurrency,
                },
                token: token,
            };

            try {
                const response = await axios.post('http://localhost:8080/sterling-checkout', requestData);
                console.log(response);
                let { status } = response.data;
                console.log(status);
                if (status === 'success') {
                    navigate(`/sterling`);
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
                    alert(response.data.message);
                }
            } catch (error) {
                console.error("Error while making the POST request:", error);
            }
        }
    };

    // Calculate the total price based on the quantity and currency
    useEffect(() => {
        const rate = selectedCurrency === 'USD' ? 1 : 75;
        const total = sterlingAmount * rate;
        setTotalPrice(total);
    }, [sterlingAmount, selectedCurrency]);

    return (
        <div>
            <UserNavbar user={user} displayName={user} />
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <h1>Sterling</h1><br></br>
            <p>*Well, it is always a good idea to hedge your wealth in an inflationless realm. 
                We believe US Dollar's strength is stability, while Indian Rupee's strength now,
                is growth. We want to hedge ourselves through these two promising mediums, & we 
                believe so should you!
            </p>
            <p>Your Sterling Balance: {userSterlingBalance}</p>

            <div>
                <label htmlFor="sterlingAmount">Buy Sterlings:</label>
                <input
                    type="number"
                    id="sterlingAmount"
                    value={sterlingAmount}
                    onChange={(e) => setSterlingAmount(parseInt(e.target.value, 10) || 0)}
                />
                <div>
                    <label htmlFor="currencySelector">Select Currency:</label>
                    <select
                        id="currencySelector"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                    >
                        <option value="USD">USD</option>
                        <option value="INR">INR</option>
                    </select>
                </div>

                {/* Display the total price */}
                <p>Total Price: {totalPrice} {selectedCurrency}</p>
                
                <StripeCheckout
                    stripeKey="pk_test_51Ni5FKKAIrTUOi75H2YjfoS6wiu0NoIN8LSCgNzoqdFV64KjwtG1fKhvYofX5y4fyaXjSxapnya2MjFZuytVyetC004RS2xrHM"
                    token={handleBuySterlings}
                    billingAddress
                    name="Buy Sterlings"
                    description={`Total Price: ${totalPrice} ${selectedCurrency}`}
                    amount={totalPrice * 100}
                    currency={selectedCurrency.toUpperCase()}
                >
                    <button>Buy</button>
                </StripeCheckout>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Sterling;
