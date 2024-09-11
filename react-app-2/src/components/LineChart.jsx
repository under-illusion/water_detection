import React, { useEffect, useState } from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import Spinner from "./Spinner";
import DownsamplePlugin from "chartjs-plugin-downsample";
import { io } from "socket.io-client";

// Chart.register(DownsamplePlugin);
const LineChart = ({ data, options, loading }) => {
  
  return (
      <div className="container-xl lg:container m-auto mb-6">
        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <>
            <div className="">
              <Line data={data} options={options} />
            </div>
          </>
        )}
      </div>
  );
};

export default LineChart;
