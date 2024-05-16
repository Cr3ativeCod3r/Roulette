import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import './assets/css/styles.css';
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux"; 
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";
import { createStore } from "redux"; 
import { SocketProvider } from './SocketContext';


const store = createStore(rootReducer, composeWithDevTools());

ReactDOM.render(
  <SocketProvider>
    <Provider store={store}>
      <Router basename="/roulette">
        <App />
      </Router>
    </Provider>
  </SocketProvider>,
  document.getElementById("root")
);
