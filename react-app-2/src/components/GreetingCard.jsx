import React from "react";
import DateCurrent from "./DateCurrent";
import Notification from "./Notification"

const GreetingCard = ({ lastUpdate, date, prediction }) => {
  const now = new Date();
  const hours = now.getHours();
  let greeting;

  if (hours < 12) {
    greeting = "Good Morning";
  } else if (hours < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  return (
    <>
      <header className="bg-white shadow sticky top-14 w-full z-30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-1xl font-bold tracking-tight text-gray-900">
              {greeting}, Chinenye!
            </h1>
            <DateCurrent date={date} />
          </div>
          <Notification prediction={prediction}/>
          <div className="flex align-middle">
            <span className="inline-block items-center font-light text-gray-500">
              Last updated: {lastUpdate[0]}, {lastUpdate[1]}
            </span>
          </div>
        </div>
      </header>
    </>
  );
};

export default GreetingCard;
