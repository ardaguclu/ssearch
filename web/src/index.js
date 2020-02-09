import React from "react";
import ReactDOM from "react-dom";
import Search from "./pages/search/index";
import Footer from "./pages/search/footer";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render([<Search />, <Footer />], document.getElementById("root"));

serviceWorker.unregister();
