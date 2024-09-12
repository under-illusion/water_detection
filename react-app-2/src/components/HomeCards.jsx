import Card from "./Card";
import {
  Link,
  useParams,
  useLoaderData,
  useNavigate,
  NavLink,
} from "react-router-dom";
import LineChart from "./LineChart";
import React, { useEffect, useState, useMemo } from "react";
import GreetingCard from "../components/GreetingCard";

const HomeCard = () => {
  // const allChartData = useLoaderData();
  const [chartDataArray, setChartDataArray] = useState([]);
  const [lastUpdate, setLastUpdate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pred, setPred] = useState(0);
  const options = {
    elements: { line: { tension: 0.5 } },
    plugins: {
      decimation: {
        // enable: true (default), controls if decimation is applied
        algorithm: "lttb", // or 'min-max', decimation algorithm to use
        samples: 60,
        threshold: 5, // threshold for triggering decimation (higher = less aggressive)
      },
    },
    scales: {
      x: {
        ticks: {
          minRotation: 45, // Minimum rotation angle for the labels
          maxRotation: 45, // Maximum rotation angle for the labels
        },
      },
    },
  };

  const fetchData = async () => {
    try {
      // const today = new Date(Date.now()).toISOString().split("T")[0];
      const date = new Date();
      const today = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      const apiURL = `/api/sensor_data?date_==${today}`;
      const res = await fetch(apiURL);
      const data = await res.json();
      const windowSize = 60; // Last 60 minutes
      const filteredData = data.slice(-windowSize);

      const xAxisTime = filteredData.map((item) => item.time.slice(0, 5));
      const xAxisDate = filteredData.map((item) => item.date);
      const latestPrediction = filteredData
        .map((item) => item.prediction)
        .slice(-1)[0];
        setPred(latestPrediction);
        console.log(latestPrediction)

      const last_date =
        today === xAxisDate.slice(-1)[0] ? "Today" : xAxisDate.slice(-1);

      const colours = [
        "rgb(61, 52, 139)",
        "rgb(118, 120, 237)",
        "rgb(247, 184, 1)",
        "rgb(241, 135, 1)",
        "rgb(243, 91, 4)",
      ];

      const transformData = (data) => {
        return data.reduce((result, item) => {
          for (const [key, value] of Object.entries(item)) {
            result[key] = result[key] || [];
            result[key].push(value);
          }
          return result;
        }, {});
      };

      const transformedData = transformData(filteredData);
      const jsonKeys = Object.keys(transformedData).filter((key) =>
        ["pH", "conductivity", "turbidity"].includes(key)
      );
      const keys = jsonKeys // Skip "id" key if present
        .map((key) => ({
          labels: xAxisTime,
          datasets: [
            {
              label: key,
              data: transformedData[key],
              borderColor: colours[jsonKeys.indexOf(key) % colours.length],
            },
          ],
        }));
      setLastUpdate([last_date, xAxisTime.slice(-1)]);
      setChartDataArray(keys);
    } catch (error) {
      console.log("error fetching data!", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Fetch data every 60 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <GreetingCard lastUpdate={lastUpdate} prediction={pred} />
      <section className="py-4 w-full">
        <div className="container-xl lg:container m-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
            {chartDataArray.map((chd, index) => (
              <Card bg="bg-blue-100" key={index}>
                <LineChart
                  options={options}
                  data={chd}
                  loading={loading}
                  key={index}
                />
                <div className="flex-none flex items-center justify-center">
                  <Link
                    to={`/analyze/${chd.datasets[0].label}`}
                    className="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
                  >
                    View More
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeCard;
