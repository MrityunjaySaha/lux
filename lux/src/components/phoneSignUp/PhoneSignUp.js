import React, { useState, useEffect } from 'react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth, firestore } from '../../firebase'; // Import Firebase Firestore as firestore
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const PhoneSignUp = () => {
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [flag, setFlag] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);
  const navigate = useNavigate();

  const countryAliases = {
    'US': 'United States',
    'USA': 'United States',
    'America': 'United States',
    'United States': 'United States',
    'United States of America': 'United States',
    'India': 'Bharat',
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, you can use 'user' object here
      } else {
        // User is signed out
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserExists = async (phoneNumber) => {
    const usersRef = firestore.collection('Users');
    const query = usersRef.where('number', '==', phoneNumber);
    const snapshot = await query.get();

    return !snapshot.empty;
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    console.log(otp);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    if (otp === '' || otp === null) return;
    try {
      setError('');
      await confirmObj.confirm(otp);
  
      // Check if the user already exists in the Users collection
      const user = auth.currentUser; // Get the current user

      // Define 'data' by extracting it from the user object
      const data = {
        phone: number,
      };

      // Check if a user with the same phone number already exists
      const phoneNumber = data.phone || ''; // Use an empty string if phone is undefined
      const phoneNumberExists = await checkUserExists(phoneNumber);

      if (phoneNumberExists) {
        // User exists, determine their role and navigate accordingly
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
        // User doesn't exist, create a new user in the Users collection
        const phoneNumberObject = parsePhoneNumberFromString(phoneNumber);
  
        if (phoneNumberObject) {
          const purePhoneNumber = phoneNumberObject.format('NATIONAL').replace(/\D/g, '');
          const countryCode = phoneNumberObject.country;
          const countryToSave = countryAliases[countryCode] || countryCode;
  
          const newUserRef = db.collection("Users").doc(user.uid);
          await newUserRef.set({
            number: number,
            phone: purePhoneNumber,
            country: countryToSave, // Set the appropriate country code
            timestamp: timestamp,
            role: 'regularUser',
            displayName: 'User',
            userId: user.uid,
          });
        }
  
        // Create a STarBank for the user with an initial balance of 500 Stars
        const initialBalance = 500;
        await firestore.collection('STarBank').doc(`STarBank-${user.uid}`).set({
          userId: user.uid,
          balance: initialBalance,
        });
  
        // Direct the new user to userhome
        navigate('/userhome');
      }
    } catch (err) {
      setError(err.message);
    }
  };  

  const getOtp = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    if (!number) {
      setError('Please enter a valid Phone Number!');
      return;
    }
    try {
      const response = await setUpRecaptcha(number); // Use the auth instance from your Firebase configuration
      console.log(response);
      setConfirmObj(response);
      setFlag(true);
    } catch (err) {
      setError(err.message);
    }
    console.log(number);
  };

  function setUpRecaptcha(number) {
    const recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {},
      auth
    );
    recaptchaVerifier.render();
    return signInWithPhoneNumber(auth, number, recaptchaVerifier);
  };

  return (
    <div>
      <h2>Phone Auth</h2><br /><br /><br />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Form onSubmit={getOtp} style={{ display: !flag ? 'block' : 'none' }}>
        <Form.Group controlId="formBasicPhoneNumber">
          <PhoneInput
            defaultCountry="US"
            value={number}
            onChange={setNumber}
            placeholder="Enter Your Phone Number!"
          />
          <div id="recaptcha-container" />
        </Form.Group><br /><br /><br />
        <Link to="/">
          <Button variant="secondary">Cancel</Button><br /><br /><br />
        </Link>
        <Button variant="primary" type="submit">Send OTP</Button><br /><br /><br />
      </Form><br></br><br></br>
      <Form onSubmit={verifyOtp} style={{ display: flag ? 'block' : 'none' }}>
        <Form.Group controlId="formBasicOtp">
          <Form.Control
            type="otp"
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />
        </Form.Group><br /><br /><br />
        <Link to="/">
          <Button variant="secondary">Cancel</Button><br /><br /><br />
        </Link>
        <Button variant="primary" type="submit">Verify OTP</Button><br /><br /><br />
      </Form>
    </div>
  );
};

export default PhoneSignUp;