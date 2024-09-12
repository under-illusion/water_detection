import React from "react";
import LineChart from "../components/LineChart";
import DateCurrent from "../components/DateCurrent";
import Dropdown from "../components/DropDown";
import DatePicker from "../components/DatePicker";
import GreetingCard from "../components/GreetingCard";
import Card from "../components/Card";
import { useState, useEffect } from "react";
import {
  useParams,
  useLoaderData,
  Link,
  useNavigate,
  json,
} from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "../components/Spinner";

const AnalyzePage = () => {
  const { id } = useParams();
  const [startDate, setStartDate] = useState(new Date());
  const [chartData, setChartData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(["", ""]);
  const [x_axis_time, setx_axis_time] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(id);
  const [loading, setLoading] = useState(false);
  // const [pred, setPred] = useState(0);

  const handleDateChange = (event) => {
    setStartDate(new Date(event.target.value));
  };
  const handleDropdownChange = (option) => {
    setSelectedMetric(option);
  };

  const today_date = new Date();
  const today_date_str = `${today_date.getFullYear()}-${(
    today_date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today_date.getDate().toString().padStart(2, "0")}`;
  const start_date_str = `${startDate.getFullYear()}-${(
    startDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${startDate.getDate().toString().padStart(2, "0")}`;
  const isToday = start_date_str === today_date_str;

  const fetchChartData = async (selected_date, isToday) => {
    setLoading(true);
    const last_date = isToday ? "Today" : selected_date;
    if (isToday) {
      const apiURL = `http://localhost:3000/api/sensor_data?date=${selected_date}`;
      try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const time = data.map((item) => item.time.slice(0, 5));
        setLoading(false);
        setChartData(data);
        setx_axis_time(time);
        setLastUpdate([last_date, time.slice(-1)]);
      } catch (error) {
        console.error("Error fetching data:", error);
        // throw new Response("Failed to load sensor data", { status: 500 });
      }
    } else {
      // const apiURL = `http://localhost:8080/api/historical_data?start_date=${startDate}&end_date=${endDate}`;
      const apiURL = `http://localhost:8080/api/historical_data?start_date=${selected_date}`;
      try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const time = data.map((item) => item.time.slice(0, 5));
        setChartData(data);
        setLoading(false);
        setx_axis_time(time);
        setLastUpdate([last_date, time.slice(-1)]);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    }
  };

  useEffect(() => {
    fetchChartData(start_date_str, isToday);
  }, [start_date_str]);

  let formattedChartData;
  const colours = [
    "rgb(61, 52, 139)",
    "rgb(118, 120, 237)",
    "rgb(247, 184, 1)",
    "rgb(241, 135, 1)",
    "rgb(243, 91, 4)",
  ];

  const options = {
    elements: { line: { tension: 0.5 } },
  };

  if (!chartData || chartData.length === 0) {
    return (
      <>
        <GreetingCard lastUpdate={lastUpdate} date={startDate}/>
        <section className="py-3 w-full">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8  items-center">
            <div className="flex align-middle justify-end items-stretch gap-6">
              <div className="flex align-middle">
                <DatePicker date={startDate} onChange={handleDateChange} />
              </div>
            </div>
            <div>
              <Card bg="bg-gray-100">
                <h1>There is no data.</h1>
              </Card>
            </div>
          </div>
        </section>
      </>
    );
    // setLoading(true);
  }

  const keys = Object.keys(chartData[0]).filter(
    (key) =>["pH", "conductivity", "turbidity"].includes(key)
  );
  const itemIndex = keys.indexOf(`${selectedMetric}`);
  const colorIndex = itemIndex % colours.length;

  formattedChartData = {
    labels: x_axis_time,
    datasets: [
      {
        label: `${selectedMetric}`,
        data: chartData.map((item) => item[`${selectedMetric}`]),
        borderColor: colours[colorIndex],
      },
    ],
  };

  return (
    <>
      <GreetingCard lastUpdate={lastUpdate} date={startDate} />
      <section className="py-3 w-full">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8  items-center">
          <div className="flex align-middle justify-end items-stretch gap-6">
            <div className="flex align-middle">
              <DatePicker date={startDate} onChange={handleDateChange} />
            </div>
            <div className="flex align-middle">
              <Dropdown
                options={keys}
                value={selectedMetric}
                onChange={handleDropdownChange}
                placeholder="Select an option"
              />
            </div>
          </div>
          <div>
            <Card bg="bg-gray-100">
              {loading ? (
                <Spinner loading={loading} />
              ) : (
                // <h2>There's no data</h2>
                <>
                  <LineChart options={options} data={formattedChartData} />
                  <div className="flex-none flex items-center justify-center">
                    <Link
                      to={`/`}
                      className="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
                    >
                      Back
                    </Link>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export { AnalyzePage as default };
// const chartDataLoader = async () => {
//   const start_date = '2024-07-28';
//   const apiURL = `/api/sensor_data?date=${start_date}`;
//   try {
//     const res = await fetch(apiURL);
//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.log("error fetching data!", error);
//   }
// };
