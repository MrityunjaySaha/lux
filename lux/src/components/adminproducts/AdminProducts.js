import { auth, db } from '../../firebase';
import { Products } from '../../components/products/Products';
import { useState, useEffect } from 'react';

const AdminProducts = (props) => {
  const [selectedTab, setSelectedTab] = useState('STara');
  const [uid, setUid] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      }
    });
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      const productsSnapshot = await db.collection('products').get();
      const productsArray = productsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        ID: doc.id,
      }));
      setProducts(productsArray);
      setLoading(false);
    };

    getProducts();
  }, []);

  const addToCart = (product) => {
    if (uid !== null) {
      const updatedProduct = {
        ...product,
        qty: 1,
        TotalProductPrice: product.qty * product.price,
      };

      db.collection(`Cart ${uid}`)
        .doc(product.ID)
        .set(updatedProduct)
        .then(() => {
          console.log('successfully added to cart');
        });
    } else {
      props.navigate('/login');
    }
  };

  const filteredProducts = products.filter(
    (product) => product.currency.toLowerCase() === selectedTab.toLowerCase()
  );

  const tabOptions = [
    { id: 'STara', label: 'Product-STara' },
    { id: 'Sterling', label: 'Product-Sterling' },
    { id: 'LocalCurrency', label: 'Product-LocalCurrency' },
    { id: 'Cryptocurrency', label: 'Product-Cryptocurrency' },
    { id: 'Barter', label: 'Product-Barter' },
  ];

  return (
    <div>
      <div className='tab-container'>
        {tabOptions.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className='container-fluid'>
        <h1 className='text-center'>Products</h1>
        <div className='products-box'>
          {loading ? (
            <div className='container-fluid'>Please wait....</div>
          ) : filteredProducts.length > 0 ? (
            <Products products={filteredProducts} addToCart={addToCart} />
          ) : (
            <div className='container-fluid'>No products available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
