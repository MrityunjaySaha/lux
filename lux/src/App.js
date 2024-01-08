import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Admin from './pages/home/Home';
import AdminProducts from './components/adminproducts/AdminProducts';
import { SuperAdmin } from './pages/superAdmin/SuperAdmin';
import List from './pages/list/List';
import Login from './components/login/Login';
import Single from './pages/single/Single';
import SignUp from './components/register/SignUp';
import New from './pages/new/New';
import Welcome from './pages/welcome/Welcome';
import UserHome from './pages/home1/UserHome';
import Business from './pages/home2/BusinessHome';
import Company from './pages/home3/CompanyHome';
import NonProfit from './pages/home4/NonProfitHome';
import SemiProfit from './pages/home5/SemiProfitHome';
import Employee from './pages/home6/EmployeeHome';
import { Products } from './components/products/Products';
import { Services } from './components/services/Services';
import AddServices from './components/addServices/AddServices';
import { productInputs, userInputs } from './formSource';
import './style/dark.scss';
import { DarkModeContext } from './context/darkModeContext';
import { AuthContext } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import ProductLink from './components/links/ProductLink';
import ServiceLink from './components/links/ServiceLink';
import { Cart } from './components/cart/Cart';
import ProductDetails from './components/cart/ProductDetails';
import ServiceDetails from './components/cart/ServiceDetails';
import Sterling from './components/myCryptos/Sterling';
import STar from './components/myCryptos/STar';
import AuctionBody from './components/auctions/AuctionBody';
import PhoneSignUp from './components/phoneSignUp/PhoneSignUp';

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? (
      children
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <AuthProvider>
      <div className={darkMode ? 'app dark' : 'app'}>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} /> {/* Set the welcome page as the index page */}
            <Route path="/login" element={<Login />} />
            <Route path="/phonesignup" element={<PhoneSignUp />} />
            <Route path="/signup" element={<SignUp inputs={userInputs} title="Thank You For Choosing Us!" />} />
            <Route path="/userhome" element={<UserHome />} />
            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
            <Route path="/superadmin" element={<RequireAuth><SuperAdmin /></RequireAuth>} />
            <Route path="/adminproducts" element={<RequireAuth><AdminProducts /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth><List /></RequireAuth>} />
            <Route path="/users/new" element={<RequireAuth><New inputs={userInputs} title="Add New User" /></RequireAuth>} />
            <Route path="/users/:userID" element={<RequireAuth><Single /></RequireAuth>} />
            <Route path="/superadmin" element={<RequireAuth><SuperAdmin /></RequireAuth>} />
            <Route path="/business" element={<RequireAuth><Business /></RequireAuth>} />
            <Route path="/company" element={<RequireAuth><Company /></RequireAuth>} />
            <Route path="/nonprofit" element={<RequireAuth><NonProfit /></RequireAuth>} />
            <Route path="/semiprofit" element={<RequireAuth><SemiProfit /></RequireAuth>} />
            <Route path="/employee" element={<RequireAuth><Employee /></RequireAuth>} />
            <Route path="/products" element={<Products />} />
            <Route path="/services" element={<Services />} />
            <Route path="/addservices" element={<AddServices />} />
            <Route path="/productlink" element={<ProductLink />} />
            <Route path="/servicelink" element={<ServiceLink />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/service/:serviceId" element={<ServiceDetails />} />
            <Route path="/products/new" element={<New inputs={productInputs} title="Add New Product" />} />
            <Route path="/sterling" element={<Sterling />} />
            <Route path="/star" element={<STar />} />
            <Route path="/auction" element={<AuctionBody />} />
            <Route path="*" element={<div>Page Not Found!</div>} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
