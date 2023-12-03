import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Alert } from 'react-bootstrap';
import './AuctionBody.css'; // Import the CSS file
import { UserNavbar } from '../userNavbar/UserNavbar';
import { db, auth } from '../../firebase';
import AddAuction from './AddAuction';
import { useNavigate } from 'react-router-dom';
import IndividualAuction from './IndividualAuction';

const AuctionBody = () => {
  const { globalMsg, currentUser } = useContext(AuthContext);
  const [auctions, setAuctions] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false); // Define showForm and setShowForm

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const auctionsSnapshot = await db.collection('Auctions').get();
        const auctionsArray = auctionsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const { price, ...auctionData } = data;

          return {
            ...auctionData,
            ID: doc.id,
          };
        });

        setAuctions(auctionsArray);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }, []);

  const addToCart = (auction, type) => {
    const user = auth.currentUser;
    if (user !== null) {
      const cartAuction = {
        ...auction,
      };
    // Add the auction to the 'Auctions' subcollection of the user's cart
    db.collection(`Cart ${user.uid}`)
      .doc('Auctions') // Subcollection for auctions
      .collection('items') // Subcollection for items
      .doc(auction.ID)
      .set(cartAuction)
      .then(() => {
        setMessage('Successfully Added to Cart!');
      })
      .catch((error) => {
        console.error('Error adding to cart:', error);
      });
  } else {
    navigate('/login');
  }
};

  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          db.collection('Users')
            .doc(user.uid)
            .get()
            .then((snapshot) => {
              resolve({ ...snapshot.data(), uid: user.uid });
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          resolve(null);
        }
      });
    });
  };

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error('Error getting current user:', error);
      });
  }, []);

  return (
    <div>
      <UserNavbar user={user} displayName={user ? user.displayName : null} />
      <br />
      <br />
      <br />
      <br />
      <br />
      {globalMsg && <Alert variant="info">{globalMsg}</Alert>}
      {currentUser && (
        <>
          <button onClick={() => setShowForm(!showForm)} className="toggle-button">
            {showForm ? 'Hide Auction Form' : 'Add Auction'}
          </button>
          {showForm && <AddAuction setAuctions={setAuctions} />}
        </>
      )}
      <br />
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
        {auctions && auctions.length > 0 ? (
          auctions.map((auction) => (
            <div key={auction.ID}>
                <IndividualAuction individualAuction={auction} user={user} addToCart={(auction) => addToCart(auction, 'auction')} />
              <hr />
            </div>
          ))
        ) : (
          <p>No auctions available.</p>
        )}
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default AuctionBody;
