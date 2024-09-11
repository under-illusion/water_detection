import { json } from "react-router-dom";

export async function chartDataLoader({ request }) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("date");
  const start_date_str = `${startDate.getFullYear()}-${(
    startDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${startDate.getDate().toString().padStart(2, "0")}`;

  const today_date = new Date();
  const today_date_str = `${today_date.getFullYear()}-${(
    today_date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today_date.getDate().toString().padStart(2, "0")}`;
  //   const endDate = url.searchParams.get("end_date") || startDate; // Default to startDate if end_date is not provided
  const isToday = start_date_str === today_date_str;

  if (isToday) {
    const apiURL = `http://localhost:3000/sensor_data?date=${startDate}`;
    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Response("Failed to load sensor data", {
          status: response.status,
        });
      }
      const data = await response.json();
      return json(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Response("Failed to load sensor data", { status: 500 });
    }
  } else {
    // const apiURL = `http://localhost:8080/api/historical_data?start_date=${startDate}&end_date=${endDate}`;
    const apiURL = `http://localhost:8080/api/historical_data?date=${startDate}`;

    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Response("Failed to load historical data", {
          status: response.status,
        });
      }
      const data = await response.json();
      return json(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw new Response("Failed to load historical data", { status: 500 });
    }
  }
}
