import React, { useState, useEffect } from 'react';
import { UserNavbar } from '../../components/userNavbar/UserNavbar';
import { auth, db } from '../../firebase';
import { Link } from 'react-router-dom';

const UserHome = () => {
  function GetCurrentUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          db.collection('Users')
            .doc(user.uid)
            .get()
            .then((snapshot) => {
              setUser(snapshot.data());
            });
        } else {
          setUser(null);
        }
      });
    }, []);
    return user;
  }

  const user = GetCurrentUser();

  return (
    <>
      <UserNavbar user={user} displayName={user ? user.displayName : 'Guest'} />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />

      <div><Link to="/productlink">Products</Link></div>
      <div><Link to="/servicelink">Services</Link></div>
      <div><Link to="/star">STar</Link></div>
      <div><Link to="/sterling">Sterling</Link></div>
      <div><Link to="/auction">Auction</Link></div>
    </>
  );
};

export default UserHome;
