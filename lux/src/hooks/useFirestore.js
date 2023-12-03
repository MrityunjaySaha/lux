import { useEffect, useState } from 'react';
import { db } from '../firebase';

export const useFirestore = (collectionName) => { // Renamed 'collection' to 'collectionName' to avoid conflicts
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = db.collection(collectionName).onSnapshot(
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocs(documents);
        setError(null); // Clear any previous errors
      },
      (error) => {
        setError(error);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  return { docs, error };
};
