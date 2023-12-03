import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase';
import firebase from 'firebase/compat/app'; // Import firebase/app instead of 'firebase/app'

const Welcome = () => {
  // State to control the visibility of About and Terms sections
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const navigate = useNavigate();

  const handleSignInWithApple = async () => {
    const provider = new firebase.auth.OAuthProvider('apple.com');
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const email = user.email;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    
        // Check if the user's email is awesomedbz@gmail.com or ranmaanimaker@gmail.com
        let role = 'regularUser'; // Default role is regular user
    
        if (email === 'awesomedbz@gmail.com') {
          role = 'admin';
        } else if (email === 'ranmaanimaker@gmail.com') {
          role = 'superAdmin';
        }
    
        // Check if the email already exists in the database
        const userRef = db.collection("Users");
        const query = userRef.where("email", "==", email);
        const existingUsers = await query.get();

        if (!existingUsers.empty) {
            const userRef = db.collection("Users").doc(user.uid);
            const userDoc = await userRef.get();
    
            if (userDoc.exists) {
                const userData = userDoc.data();
                const userRole = userData.role;
    
                switch (userRole) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'superAdmin':
                    navigate('/superadmin');
                    break;
                case 'regularUser':
                    navigate('/userhome');
                    break;
                // Add more cases for other roles as needed
                default:
                    navigate('/userhome');
                    break;
                }
            }
        } else {
          // Save user information in Firestore database
          const newUserRef = db.collection("Users").doc(user.uid);
          await newUserRef.set({
            displayName: user.displayName,
            email: email,
            img: user.photoURL,
            role: role, // Set the role here
            timestamp: timestamp, // Include the timestamp
            userId: user.uid,
          });
    
          // Create a STarBank for the user
          const initialBalance = 500;
          await db.collection("STarBank").doc(`STarBank-${user.uid}`).set({
            userId: user.uid,
            balance: initialBalance,
          });

          // Check email and navigate accordingly
          if (email === 'awesomedb@gmail.com') {
            navigate('/admin');
          } else if (email === 'ranmaanimaker@gmail.com') {
            navigate('/superadmin');
          } else {
            navigate('/userhome');
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSignInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const email = user.email;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
        // Check if the user's email is awesomedbz@gmail.com or ranmaanimaker@gmail.com
        let role = 'regularUser'; // Default role is regular user
  
        if (email === 'awesomedbz@gmail.com') {
          role = 'admin';
        } else if (email === 'ranmaanimaker@gmail.com') {
          role = 'superAdmin';
        }
  
        // Check if the email already exists in the database
        const userRef = db.collection("Users");
        const query = userRef.where("email", "==", email);
        const existingUsers = await query.get();

        if (!existingUsers.empty) {
            const userRef = db.collection("Users").doc(user.uid);
            const userDoc = await userRef.get();
    
            if (userDoc.exists) {
                const userData = userDoc.data();
                const userRole = userData.role;
    
                switch (userRole) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'superAdmin':
                    navigate('/superadmin');
                    break;
                case 'regularUser':
                    navigate('/userhome');
                    break;
                // Add more cases for other roles as needed
                default:
                    navigate('/userhome');
                    break;
                }
            }
        } else {
          // Save user information in Firestore database
          const newUserRef = db.collection("Users").doc(user.uid);
          await newUserRef.set({
            displayName: user.displayName,
            email: email,
            img: user.photoURL,
            role: role, // Set the role here
            timestamp: timestamp, // Include the timestamp
            userId: user.uid,
          });
  
          // Create a STarBank for the user
          const initialBalance = 500;
          await db.collection("STarBank").doc(`STarBank-${user.uid}`).set({
            userId: user.uid,
            balance: initialBalance,
          });

          // Check email and navigate accordingly
          if (email === 'awesomedb@gmail.com') {
            navigate('/admin');
          } else if (email === 'ranmaanimaker@gmail.com') {
            navigate('/superadmin');
          } else {
            navigate('/userhome');
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };  

  const handleSignInWithFacebook = () => {
    const provider = new FacebookAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const email = user.email;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
        // Check if the user's email is awesomedbz@gmail.com or ranmaanimaker@gmail.com
        let role = 'regularUser'; // Default role is regular user
  
        if (email === 'awesomedbz@gmail.com') {
          role = 'admin';
        } else if (email === 'ranmaanimaker@gmail.com') {
          role = 'superAdmin';
        }
  
        // Check if the email already exists in the database
        const userRef = db.collection("Users");
        const query = userRef.where("email", "==", email);
        const existingUsers = await query.get();

        if (!existingUsers.empty) {
            const userRef = db.collection("Users").doc(user.uid);
            const userDoc = await userRef.get();
    
            if (userDoc.exists) {
                const userData = userDoc.data();
                const userRole = userData.role;
    
                switch (userRole) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'superAdmin':
                    navigate('/superadmin');
                    break;
                case 'regularUser':
                    navigate('/userhome');
                    break;
                // Add more cases for other roles as needed
                default:
                    navigate('/userhome');
                    break;
                }
            }
        } else {
          // Save user information in Firestore database
          const newUserRef = db.collection("Users").doc(user.uid);
          await newUserRef.set({
            displayName: user.displayName,
            email: email,
            img: user.photoURL,
            role: role, // Set the role here
            timestamp: timestamp, // Include the timestamp
            userId: user.uid,
          });
  
          // Create a STarBank for the user
          const initialBalance = 500;
          await db.collection("STarBank").doc(`STarBank-${user.uid}`).set({
            userId: user.uid,
            balance: initialBalance,
          });

          // Check email and navigate accordingly
          if (email === 'awesomedb@gmail.com') {
            navigate('/admin');
          } else if (email === 'ranmaanimaker@gmail.com') {
            navigate('/superadmin');
          } else {
            navigate('/userhome');
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="App" align='center'>
      <h4 style ={{marginTop: '20px'}}>Welcome to Lux!</h4>
      <br />
      {/* Toggle buttons for About and Terms of Agreement with Login and Sign Up links */}
      <div style={{marginBottom: '10px'}}>
        <div>
          <button style={{marginRight: '20px'}} onClick={() => setShowAbout(!showAbout)}>
            {showAbout ? 'Hide About' : 'About'}
          </button>
          <button onClick={() => setShowTerms(!showTerms)}>
            {showTerms ? 'Hide TOA' : 'Terms'}
          </button><br></br><br></br>
        </div>
        <Link to="login" style={{ marginRight: '20px' }}>Login</Link>
        <Link to="signup">Sign Up</Link><br></br><br></br>
        {/* Wrap the phone sign-in button in a Link */}
        <Link to="/phonesignup">
          <button variant="success" type="Submit">
            Sign In with Phone
          </button>
        </Link>
        <br></br><br></br>
        <button style={{ marginRight: '20px' }} onClick={handleSignInWithGoogle}>Google</button>
        <button onClick={handleSignInWithFacebook}>Facebook</button><br></br><br></br>
        <button style={{ marginRight: '20px' }} onClick={handleSignInWithApple}>X(Twitter)</button>
        <button onClick={handleSignInWithApple}>Microsoft</button><br></br><br></br>
        <button onClick={handleSignInWithApple}>Sign In with Apple</button>
      </div>
      <div style ={{marginTop: '20px', marginBottom: '20px'}}>
      {/* About section */}
      {showAbout && (
        <>
          We want to give people all the financial freedom we can legally allow.
          We allow people to exchange any products or services in 5 ways. Which includes
          Local currencies (US Dollar & Indian Rupee for now), any cryptocurrency, or with
          no currency, like in the old days, who knows maybe in the future too?
          <br></br><br></br>
                  
          Then we have our own 1st cryptocurrency called Sterling, where we allow people 
          to move their estate in an inflationless zone, where you can only convert one 
          way using either the USD or INR for now. It's a good idea for people who have 
          something to conserve, or preserve.<br></br><br></br>

          & lastly we also offer our own 2nd cryptocurrency called STar, which is a 
          completely non-convertible currency, for people who are looking for a refresh 
          of values. We provide people STar in the form of UBI, where they get 500 to start 
          with and 500 every week, with the female gender, single parents, & elderly get a
          bit extra pocket income. <br></br><br></br>
                  
          With STar we also provide people subsidies to help get started. We are very 
          favorable towards artists (content creators, of any level), as we believe we all 
          have a story we want to tell, if not many! To any level of software developers, 
          as we ourselves have realized we all need software to put our theories into 
          application at this day & age, we are prominently economists. We also give 
          subsidies to any kind of business owners, so long as they are good.<b></b><b></b>
                  
          It's is import to point out that it is possible for you to have the 
          best of each & all the worlds. You don't have to choose between one or another, 
          in fact we encourage you to explore all the ways of commerce.<br></br><br></br>

          One of the very most important things we help people with is finding & connecting 
          with a buyer, seller, distributor, & financier of basically any idea. A very 
          useful & pragmatic B2B section. We have other developments planned for Lux, & we 
          will continue to work towards completing it, hopefully more with you all.
        </>
      )}<br></br><br></br>
  
      {/* Terms of Agreement section */}
      {showTerms && (
        <>
          We do not intend on using your data for profits without you 
          letting you know. When we do, you will be notified of it, & everything about it,
          & you will get your share of the profit, which would be proportional & fair.
          <br></br><br></br>
                  
          As of yet we do not have plans to use your data, but if we do, we hope you 
          understand for our stability reasons.<br></br><br></br>

          We will work with the local laws to keep everyone and the platform safe & great.
        </>
      )}
      </div>
    </div>
  );
};

export default Welcome;
