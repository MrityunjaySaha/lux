import { createContext, useReducer, useEffect, useState } from 'react'
import AuthReducer from "./AuthReducer"
import { auth, firestore } from '../firebase';
import { RecaptchaVerifier } from 'firebase/auth';

const INITIAL_STATE = {
    currentUser: JSON.parse(localStorage.getItem("user")) || null,
};

export const AuthContext = createContext(INITIAL_STATE)

export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    useEffect(()=> {
        localStorage.setItem("user", JSON.stringify(state.currentUser))
    },[state.currentUser])

    return (
        <AuthContext.Provider value = {{currentUser: state.currentUser, dispatch}}>
            {children}
        </AuthContext.Provider>
    );
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalMsg, setGlobalMsg] = useState('');
  
    const register = (email, password) => {
      return auth.createUserWithEmailAndPassword(email, password);
    };
  
    const login = (email, password) => {
      return auth.signInWithEmailAndPassword(email, password);
    };
  
    const logout = () => {
      return auth.signOut();
    };
  
    const bidAuction = (auctionId, price) => {
      if (!currentUser) {
        return setGlobalMsg('Please login first');
      }
  
      let newPrice = Math.floor((price / 100) * 110);
      const db = firestore.collection('auctions');
  
      return db.doc(auctionId).update({
        curPrice: newPrice,
        curWinner: currentUser.email,
      });
    };
  
    const endAuction = (auctionId) => {
      const db = firestore.collection('auctions');
  
      return db.doc(auctionId).delete();
    };
  
    useEffect(() => {
      const subscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setLoading(false);
      });
  
      return subscribe;
    }, []);
  
    useEffect(() => {
      const interval = setTimeout(() => setGlobalMsg(''), 5000);
      return () => clearTimeout(interval);
    }, [globalMsg]);
  
    function setUpRecaptcha(number) {
      const recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {},
        auth
      );
      recaptchaVerifier.render();
    }

    return (
      <AuthContext.Provider
        value={{
          currentUser,
          register,
          login,
          logout,
          bidAuction,
          endAuction,
          globalMsg,
          setUpRecaptcha,
        }}
      >
        {!loading && children}
      </AuthContext.Provider>
    );
};