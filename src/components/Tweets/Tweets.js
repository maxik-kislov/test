import React, { useState, useEffect } from "react";
import { Card } from "../";
import {
  getInitialTweets,
  getLatestTweetsAfterTimestamp,
  getHistoricTweetsBeforeTimestamp
} from "../../services/Tweets";
import config from "../../config";

import "./Tweets.css";

function Tweets() {
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState();
  const [oldTimestamp, setOldTimestamp] = useState();

  useEffect(() => {
    const userIsAtTopOrBottomOfPage = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const windowBottom = window.innerHeight + window.pageYOffset;

      if (windowBottom >= docHeight) {
        return "BOTTOM";
      } else if (window.scrollY === 0) {
        return "TOP";
      }
    };

    const beginFetch = async () => {
      try {
        const data = await getInitialTweets();
        setTweets(data);
        setLastTimestamp(data[0].timeStamp);
        setOldTimestamp(data[data.length - 1].timeStamp);
      } catch (e) {} // in the real world we may handle this depending on the circumstances or at least log it
    };

    const fetchTweets = async () => {
      if (!lastTimestamp) {
        beginFetch();
      } else {
        try {
          let data;

          if (userIsAtTopOrBottomOfPage() === "BOTTOM") {
            console.log("getting historic tweets");

            data = await getHistoricTweetsBeforeTimestamp(
              oldTimestamp,
              config.MAX_TWEETS
            );

            setTweets([...tweets, ...data]);
            if (data.length) {
              setOldTimestamp(data[data.length - 1].timeStamp);
            }
          } else if (userIsAtTopOrBottomOfPage() === "TOP") {
            console.log("getting latest tweets");

            data = await getLatestTweetsAfterTimestamp(
              lastTimestamp,
              config.MAX_TWEETS
            );

            setTweets([...data, ...tweets]);
            if (data.length) {
              setLastTimestamp(data[0].timeStamp);
            }
          }
        } catch (e) {} // in the real world we may handle this depending on the circumstances or at least log it
      }
    };

    if (!initialFetchComplete) {
      setInitialFetchComplete(true);
      beginFetch();
    }

    const interval = setInterval(fetchTweets, config.FETCH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [initialFetchComplete, lastTimestamp, oldTimestamp, tweets]);

  return (
    <div className="tweets">
      <h1> Latest Tweets </h1>
      {tweets.map(tweet => (
        <Card
          key={tweet.id}
          username={tweet.username}
          text={tweet.text}
          image={tweet.image}
        />
      ))}
    </div>
  );
}

export default Tweets;
