import React, { useState, useEffect, useContext } from "react";
import './usernavbar.scss';
import { Link } from "react-router-dom";
import logo from '../../components/images/LuxmiTitleLogo.jpg';
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useNavigate } from "react-router-dom";
import { auth, db } from '../../firebase';

export const UserNavbar = ({user, displayName }) => {
    const { dispatch } = useContext(DarkModeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/');
        });
    };

 
    // state of cart products
    const [cartProducts, setCartProducts] = useState([]);
    const [cartServices, setCartServices] = useState([]);
    const [cartAuctions, setCartAuctions] = useState([]);

    // getting cart products and auctions from firestore collections and updating the state
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

// Calculate the total number of items in the cart (products + auctions)
const totalCartItems = cartProducts.length + cartServices.length + cartAuctions.length;


    return (
        <div className="navbar">
            <div className="wrapper">
                <div className="logo">
                    <img src={logo} alt="logo" />
                </div>
                <div className="search">
                    <input type="text" placeholder="Search..." />
                    <SearchOutlinedIcon />
                </div>
                <div>
                    {user && (
                        <Link className="navlink" to="/userhome">
                            {displayName ? displayName : 'User'}
                        </Link>
                      )}
                </div>
                <div className="items">
                    <div className = "item">
                        <LanguageOutlinedIcon className = "icon"/>
                        English
                    </div>
                    <div className = "item">
                        <DarkModeOutlinedIcon className = "icon" onClick = {() => dispatch({type: "TOGGLE"})}/>
                    </div>
                    <div className = "item">
                        <FullscreenExitOutlinedIcon className = "icon"/>
                    </div>
                    <div className = "item">
                        <NotificationsNoneOutlinedIcon className = "icon"/>
                        <div className = "counter">1</div>
                    </div>
                    <div className = "item">
                        <ChatBubbleOutlineIcon className = "icon"/>
                        <div className = "counter"></div>
                    </div>
                    <div className='cart-menu-btn'>
                        <Link className='navlink' to='/cart'>
                            <span>Cart <span className = "counter">{totalCartItems}</span></span>   
                        </Link>
                    </div>
                    <div className = "item">
                        <ListOutlinedIcon className = "icon"/>
                    </div>
                    <div className="btn btn-danger btn-md"
                    onClick = {handleLogout}>Logout</div>
                    <div className = "item">
                        <img
                            src = ""
                            alt = ""
                            className = "avatar"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}