import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserNavbar } from '../userNavbar/UserNavbar';
import { auth, db } from '../../firebase';
import IndividualService from '../services/IndividualService';
import AddServices from '../addServices/AddServices';

const ServiceLink = () => {
  const navigate = useNavigate(); // Get the navigation function
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const addToCart = (service) => {
    const user = auth.currentUser;
    if (user !== null) {
      const cartService = {
        ...service,
        hasBarter: service.hasBarter || false,
      };
  
      // Add the product to the 'Products' subcollection of the user's cart
      db.collection(`Cart ${user.uid}`)
        .doc('Services') // Subcollection for products
        .collection('items') // Subcollection for items
        .doc(service.ID)
        .set(cartService)
        .then(() => {
          setMessage('Item added to cart!');
          setTimeout(() => setMessage(''), 3000);
        })
        .catch((error) => {
          console.error('Error adding to cart:', error);
        });
    } else {
      navigate('/login');
    }
  };
  
  useEffect(() => {
    const getCurrentUser = () => {
      auth.onAuthStateChanged(user => {
        if (user) {
          db.collection('Users').doc(user.uid).get().then(snapshot => {
            setUser(snapshot.data().displayName);
          });
        } else {
          setUser(null);
        }
      });
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await db.collection('Services').get();
        const servicesArray = servicesSnapshot.docs.map((doc) => {
          const data = doc.data();
          const { price, ...serviceData } = data;
          const hasBarter =
            price && price.Barter && (price.Barter.products.length > 0 || price.Barter.services.length > 0);

          return {
            ...serviceData,
            ID: doc.id,
            hasBarter,
          };
        });

        setServices(servicesArray);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <>
      <UserNavbar user={user} displayName={user} />
      <br />
      <br />
      <br />
      <br />
      <br />
      {services ? (
        <div className="container-fluid">
          <h1 className="text-center">Services</h1>
          {user && (
            <>
              <button onClick={() => setShowForm(!showForm)} className="toggle-button">
                {showForm ? 'Hide Srvice Form' : 'Add Service'}
              </button>
              {showForm && <AddServices />}
            </>
          )}
          <br />
          <div className="products-box">
            {services.map((service) => (
              <div key={service.ID}>
                <IndividualService individualService={service} user={user} addToCart={(service) => addToCart(service, 'service')} />
                <hr />
              </div>
            ))}
            {message && <div className="message">{message}</div>}
          </div>
        </div>
      ) : (
        <div className="container-fluid">Please wait....</div>
      )}
    </>
  );
};

export default ServiceLink;
