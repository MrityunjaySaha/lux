import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserNavbar } from '../userNavbar/UserNavbar';
import { auth, db } from '../../firebase';
import IndividualProduct from '../products/IndividualProduct';
import AddProducts from '../addProducts/AddProducts';

const ProductLink = () => {
  const navigate = useNavigate(); // Get the navigation function
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const addToCart = (product) => {
    const user = auth.currentUser;
    if (user !== null) {
      const cartProduct = {
        ...product,
        hasBarter: product.hasBarter || false,
      };
  
      // Add the product to the 'Products' subcollection of the user's cart
      db.collection(`Cart ${user.uid}`)
        .doc('Products') // Subcollection for products
        .collection('items') // Subcollection for items
        .doc(product.ID)
        .set(cartProduct)
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
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await db.collection('Products').get();
        const productsArray = productsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const { price, ...productData } = data;
          const hasBarter =
            price && price.Barter && (price.Barter.products.length > 0 || price.Barter.services.length > 0);

          return {
            ...productData,
            ID: doc.id,
            hasBarter,
          };
        });

        setProducts(productsArray);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <UserNavbar user={user} displayName={user} />
      <br />
      <br />
      <br />
      <br />
      <br />
      {products ? (
        <div className="container-fluid">
          <h1 className="text-center">Products</h1>
          {user && (
            <>
              <button onClick={() => setShowForm(!showForm)} className="toggle-button">
                {showForm ? 'Hide Product Form' : 'Add Product'}
              </button>
              {showForm && <AddProducts />}
            </>
          )}
          <br />
          <div className="products-box">
            {products.map((product) => (
              <div key={product.ID}>
                <IndividualProduct individualProduct={product} user={user} addToCart={(product) => addToCart(product, 'product')} />
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

export default ProductLink;
