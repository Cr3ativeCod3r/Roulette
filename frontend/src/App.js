import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/layout";
import Roulette from "./pages/roulette";
import Deposit from "./pages/deposit";
import Profile from "./pages/profile";
import Admin from "./pages/admin";
import jwt_decode from "jwt-decode";
import Config from "./components/adminpanels/config";
import Users from "./components/adminpanels/users";
import Support from "./components/adminpanels/support";

function App() {
  let [loggedInUser, setLoggedInUser] = useState(false);
  let [typ, usertyp] = useState(null);

  const token = localStorage.getItem("jwtToken");
  useEffect(() => {
    if (token) {
      const decodedUser = jwt_decode(token);
      const user = decodedUser.user;

      usertyp(user.usertyp);
      setLoggedInUser(decodedUser);
    }
  }, [token]);

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Roulette />
            </Layout>
          }
          exact
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
          exact
        />

        <Route
          path="/deposit"
          element={
            <Layout>
              <Deposit />
            </Layout>
          }
          exact
        />

        <Route
          path="/admin"
          element={
            <Layout>
              {typ === "admin" ? <Admin /> : <Navigate to="/admin" />}
            </Layout>
          }
        />
        <Route
          path="/config"
          element={
            <Layout>
              <Config />
            </Layout>
          }
        />
        <Route
          path="/users"
          element={
            <Layout>
              {typ === "admin" ? <Users /> : <Navigate to="/admin" />}
            </Layout>
          }
        />
        <Route
          path="/support"
          element={
            <Layout>
              {typ === "admin" ? <Support /> : <Navigate to="/admin" />}
            </Layout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
