import React from "react";

const DateCurrent = ({date}) => {
  const DateString = getFormattedDate(date);
  return (
    <div>
      <h2 className="text-1xl font tracking-tight text-gray-700">
        Reports for {DateString}
      </h2>
    </div>
  );
};

export default DateCurrent;

function getFormattedDate(date = new Date()) {
  // // const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
  // return date.getFullYear() + "-" +(date.getMonth()+1) + "-" + date.getDate();
}
