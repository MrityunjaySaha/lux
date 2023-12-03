import React, { useState, useEffect } from 'react';
import { UserNavbar } from '../userNavbar/UserNavbar';
import { auth, db } from '../../firebase';
import IndividualCartProduct from './IndividualCartProduct';
import IndividualCartAuction from './IndividualCartAuction';
import IndividualCartService from './IndividualCartService';

export const Cart = () => {
 
  // getting current user function
  function GetCurrentUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged(user => {
        if (user) {
          db.collection('Users').doc(user.uid).get().then(snapshot => {
            setUser(snapshot.data().displayName);
          });
        } else {
          setUser(null);
        }
      });
    }, []);
    return user;
  }

  const user = GetCurrentUser();

  // state of cart products
  const [cartProducts, setCartProducts] = useState([]);

  // state of cart auctions
  const [cartAuctions, setCartAuctions] = useState([]);

  const [cartServices, setCartServices] = useState([]);

  // getting cart products from firestore collection and updating the state
  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection(`Cart ${user.uid}`)
          .doc('Products')
          .collection('items')
          .onSnapshot(snapshot => {
            const newCartProduct = snapshot.docs.map(doc => ({
              ID: doc.id,
              ...doc.data(),
            }));
            setCartProducts(newCartProduct);
          });

          db.collection(`Cart ${user.uid}`)
          .doc('Services')
          .collection('items')
          .onSnapshot(snapshot => {
            const newCartService = snapshot.docs.map(doc => ({
              ID: doc.id,
              ...doc.data(),
            }));
            setCartServices(newCartService);
          });

        db.collection(`Cart ${user.uid}`)
          .doc('Auctions')
          .collection('items')
          .onSnapshot(snapshot => {
            const newCartAuction = snapshot.docs.map(doc => ({
              ID: doc.id,
              ...doc.data(),
            }));
            setCartAuctions(newCartAuction);
          });
      } else {
        console.log('user is not signed in to retrieve cart');
      }
    });
  }, []);


  const handleBuy = (product) => {
    // Handle the buy action here
  };

  return (
    <>
      <UserNavbar user={user} displayName={user} />
      <br />
      <div className='container-fluid'>
        <br />
        <h1 className='text-center'>Cart</h1>
        <p className='text-center'>Number of Items in Cart: {cartProducts.length + cartServices.length + cartAuctions.length}</p>

        {/* Products */}
        <div className='products-box'>
          {cartProducts.map(cartProduct => (
            <div key={cartProduct.ID}>
              <IndividualCartProduct
                cartProduct={cartProduct}
                buy={handleBuy}
                />
            </div>
          ))}
        </div>

        {/* Products */}
        <div className='products-box'>
          {cartServices.map(cartService => (
            <div key={cartService.ID}>
              <IndividualCartService
                cartService={cartService}
                buy={handleBuy}
                />
            </div>
          ))}
        </div>

        {/* Auctions */}
        <div className='products-box'>
          {cartAuctions.map(cartAuction => (
            <div key={cartAuction.ID}>
              <IndividualCartAuction
                cartAuction={cartAuction}
              />
            </div>
          ))}
        </div>

        {/* No products or auctions */}
        {cartProducts.length === 0 && cartAuctions.length === 0 && cartServices.length === 0 &&(
          <div className='container-fluid'>Nothing to show!</div>
        )}
      </div>
    </>
  );
};
