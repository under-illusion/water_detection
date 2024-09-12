import React from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import MainLayout from "./layouts/MainLayout";
import AnalyzePage from "./pages/AnalyzePage";

const App = () => {
  // Add new Job
  const addJob = async (newJob) => {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newJob),
    });
    return;
  };

  // Delete Job
  const deleteJob = async (id) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
    });
    return;
  };

  // Update Job
  const updateJob = async (job) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });
    return;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
        {/* <Route
          path="/analyze/:id"
          element={<AnalyzePage />}
          loader={chartDataLoader}
        /> */}
        <Route path="/analyze/:id" element={<AnalyzePage />} />
        <Route
          path="/analyze/"
          element={<Navigate to="/analyze/pH" replace />}
        />
        {/* <Route
          path="/job/:id"
          element={<Job deleteJob={deleteJob} />}
          loader={jobLoader}
        />
        <Route
          path="/edit-job/:id"
          element={<EditJobPage updateJobSubmit={updateJob} />}
          loader={jobLoader}
        /> */}
        {/* <Route path="/jobs" element={<JobPage />} /> */}
      </Route>
    )
  );
  return <RouterProvider router={router} />;
};

export default App;
