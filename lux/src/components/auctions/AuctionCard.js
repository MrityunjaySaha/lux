import React, { useContext, useMemo } from 'react';
import Countdown from 'react-countdown';
import { AuthContext } from '../../context/AuthContext';
import { useFirestore } from '../../hooks/useFirestore'; // Import the useFirestore hook for fetching data

const AuctionCardRenderer = ({ days, hours, minutes, seconds, completed, item, owner, bidAuction, endAuction, timeUntilStart, auctionDuration }) => {
  if (completed) {
    return null;
  }

  const currencyElements = Object.entries(item.currencies).map(([currencyType, currency]) => {
    if (currency.enabled) {
      let priceDisplay = `${currency.price}`;

      if (currencyType === 'LocalCurrency') {
        priceDisplay += ` (${currency.localCurrencyType})`;
      }

      return (
        <p key={currencyType} className="mb-0">
          {currencyType}: {priceDisplay}
        </p>
      );
    }

    return null;
  });

  // Display timeUntilStart and auctionDuration as needed
  const timeUntilStartDisplay = `Time Until Start: ${timeUntilStart} ms`;
  const auctionDurationDisplay = `Auction Duration: ${auctionDuration} ms`;

  return (
    <div className="col">
      <div className="card shadow-sm">
        <div
          style={{
            height: '320px',
            backgroundImage: `url(${item.itemImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
          className="w-100"
        />

        <div className="card-body">
          <p className="lead display-6">{item.title}</p>
          <div className="d-flex justify-content-between align-item-center">
            <h5>
              {days * 24 + hours} hr: {minutes} min: {seconds} sec
            </h5>
          </div>
          <p className="card-text">{item.description}</p>
          {currencyElements.length > 0 && (
            <div>
              <p className="mb-3">Currency Information:</p>
              {currencyElements}
            </div>
          )}
          <br />
          <div className="d-flex justify-content-between align-item-center">
            <div>
              {!owner ? (
                <div
                  onClick={() => bidAuction(item.id, item.curPrice)} // Pass item.id and item.curPrice
                  className="btn btn-outline-secondary"
                >
                  Bid
                </div>
              ) : owner.email === item.email ? (
                <div
                  onClick={() => endAuction(item.id)} // Pass item.id
                  className="btn btn-outline-secondary"
                >
                  Cancel Auction
                </div>
              ) : owner.email === item.curWinner ? (
                <p className="display-6">Winner</p>
              ) : (
                <div
                  onClick={() => bidAuction(item.id, item.curPrice)} // Pass item.id and item.curPrice
                  className="btn btn-outline-secondary"
                >
                  Bid
                </div>
              )}
            </div>
            <p className="display-6">${item.curPrice}</p>
          </div>
          <div>
            <p>{timeUntilStartDisplay}</p>
            <p>{auctionDurationDisplay}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuctionCard = ({ item }) => {
  const { currentUser, bidAuction, endAuction } = useContext(AuthContext);
  const { docs, error } = useFirestore('auctions'); // Fetch auction data using the useFirestore hook

  // Log the data and error for debugging
  console.log('Auction Data:', docs);
  console.error('Fetch Error:', error);

  // Calculate the target date for the Countdown component
  const expiredDate = useMemo(() => {
    const parsedDate = Date.parse(item.duration);
    return isNaN(parsedDate) ? 0 : parsedDate;
  }, [item.duration]);

  // Calculate timeUntilStart and auctionDuration
  const now = Date.now();
  const timeUntilStart = expiredDate > now ? expiredDate - now : 0;
  const auctionDuration = expiredDate > now ? expiredDate - Date.parse(item.createdAt) : 0;

  return (
    <Countdown
      date={expiredDate}
      item={item}
      owner={currentUser}
      bidAuction={bidAuction}
      endAuction={endAuction}
      timeUntilStart={timeUntilStart}
      auctionDuration={auctionDuration}
      renderer={(props) => <AuctionCardRenderer {...props} item={item} owner={currentUser} bidAuction={bidAuction} endAuction={endAuction} timeUntilStart={timeUntilStart} auctionDuration={auctionDuration} />}
    />
  );
};
