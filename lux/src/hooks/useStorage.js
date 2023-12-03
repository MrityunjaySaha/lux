import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { serverTimestamp } from 'firebase/firestore';

const useStorage = () => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const uploadAuction = async (data, userEmail) => {
      if (data && data.itemImage) {
        const storageRef = storage.ref(`auction-images/${data.itemImage.name}`);
        const collectionRef = db.collection('auctions');

        try {
          storageRef.put(data.itemImage).on(
            'state_changed',
            (snap) => {
              const percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
              setProgress(percentage);
            },
            (error) => {
              console.error(error);
              setError(error);
            },
            async () => {
              const imgUrl = await storageRef.getDownloadURL();
              const createdAt = serverTimestamp();

              const auctionData = { ...data, createdAt, imgUrl, email: userEmail };

              delete auctionData.itemImage;
              await collectionRef.add(auctionData);
              setIsCompleted(true);
              setError(null); // Clear any previous errors
            }
          );
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setIsCompleted(true);
      }
    };

    return uploadAuction;
  }, []);

  return { progress, isCompleted, error };
};

export default useStorage;
