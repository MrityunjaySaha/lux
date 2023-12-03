import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { UserNavbar } from '../userNavbar/UserNavbar';

const STar = () => {
  // Initialize state variables with values from localStorage if available
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    localStorage.getItem('subscriptionStatus') || 'unsubscribed'
  );
  const [balance, setBalance] = useState(
    parseFloat(localStorage.getItem('userBalance')) || 500
  );
  const [user, setUser] = useState(null);
  const [user2, setUser2] = useState(null);
  const [isWoman, setIsWoman] = useState(false);
  const [isSingleParent, setIsSingleParent] = useState(false);
  const [isOver72, setIsOver72] = useState(false);
  const [totalBonus, setTotalBonus] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const getCurrentUser = () => {
      auth.onAuthStateChanged((user2) => {
        if (user2) {
          db.collection('Users')
            .doc(user2.uid)
            .get()
            .then((snapshot) => {
              setUser2(snapshot.data().displayName); // Use 'displayName' here
            });
        } else {
          setUser2(null);
        }
      });
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    // Check if the user is authenticated
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);

        // Get the user's data from Firestore
        const userId = user.uid;
        const userRef = db.collection('Users').doc(userId);

        userRef.get().then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            setSubscriptionStatus(userData.subscriptionStatus || 'unsubscribed');
            localStorage.setItem(
              'subscriptionStatus',
              userData.subscriptionStatus || 'unsubscribed'
            );
            setIsWoman(userData.isWoman || false);
            setIsSingleParent(userData.isSingleParent || false);
            setIsOver72(userData.isOver72 || false);
          }
        });
      } else {
        setUser(null);
      }
    });
  }, []);

  useEffect(() => {
    // Calculate total bonuses based on user attributes
    let bonus = 0;

    if (isWoman) {
      bonus += 100;
    }

    if (isSingleParent) {
      bonus += 150;
    }

    if (isOver72) {
      bonus += 125;
    }

    // Calculate the bi-weekly bonus on the 1st and 15th
    const today = new Date();
    const dayOfMonth = today.getDate();
    const hourOfDay = today.getHours();

    if ((dayOfMonth === 1 || dayOfMonth === 15) && hourOfDay === 0) {
      bonus += 1000; // Add the bi-weekly bonus on the 1st and 15th at 12 AM
    }

    setTotalBonus(bonus);
  }, [isWoman, isSingleParent, isOver72]);

  const handleSubscribe = () => {
    if (subscriptionStatus === 'unsubscribed') {
      setSubscriptionStatus('subscribed');

      // Update the user's data in Firestore
      const userId = user.uid;
      const userRef = db.collection('Users').doc(userId);

      userRef.update({
        subscriptionStatus: 'subscribed',
      });

      // Update the balance and local storage
      const bonusToAdd = 500; // Start with 500 STara bonus
      setBalance((prevBalance) => prevBalance + bonusToAdd);
      localStorage.setItem('userBalance', balance + bonusToAdd); // Update local storage
    }
  };

  const handleUnsubscribe = () => {
    setSubscriptionStatus('unsubscribed');

    // Update the user's data in Firestore
    const userId = user.uid;
    const userRef = db.collection('Users').doc(userId);

    userRef.update({
      subscriptionStatus: 'unsubscribed',
    });
  };

  return (
    <div>
      <UserNavbar user={user2} displayName={user2} />
      <br />
      <br />
      <br />
      <br />
      <br />
      <h1>Welcome to STar</h1>
      {balance !== null && (
        <>
          <p>Your STar Balance: {balance.toFixed(4)} STar</p>
          <p>Total Bonus: {totalBonus.toFixed(4)} STar</p>
          {subscriptionStatus === 'unsubscribed' ? (
            <>
              {showQuestions ? (
                <div>
                  <p>Are you a woman?</p>
                  <button onClick={() => setIsWoman(true)}>Yes</button>
                  <button onClick={() => setIsWoman(false)}>No</button>

                  <p>Are you a single parent?</p>
                  <button onClick={() => setIsSingleParent(true)}>Yes</button>
                  <button onClick={() => setIsSingleParent(false)}>No</button>

                  <p>Are you over 72 years old?</p>
                  <button onClick={() => setIsOver72(true)}>Yes</button>
                  <button onClick={() => setIsOver72(false)}>No</button>
                </div>
              ) : (
                <button onClick={() => setShowQuestions(true)}>Answer Questions</button>
              )}
              <button onClick={handleSubscribe}>Subscribe</button>
            </>
          ) : (
            <button onClick={handleUnsubscribe}>Unsubscribe</button>
          )}
        </>
      )}
    </div>
  );
};

export default STar;