import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Compte from "./component/Users/Compte";
import PhoneSignIn from "./component/Users/PhoneSignIn";
import AddEvent from "./component/Events/AddEvent";
import Events from "./component/Events/Events";
import EventDetails from "./component/Events/EventDetails";
import SetUsername from "./component/Users/SetUsername";
import Amis from "./component/Users/Amis";
import TakePicture from "./component/Events/TakePicture";
import HeaderPics from "./component/Elements/HeaderPics";
import "./App.css";
function AppUsers() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PhoneSignIn />} />
        <Route path="/setusername" element={<SetUsername />} />
        <Route path="/compte" element={<Compte />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:eventId" element={<EventDetails />} />
        <Route path="/AddEvent" element={<AddEvent />} />
        <Route path="/amis" element={<Amis />} />
        <Route path="/TakePicture/:eventId" element={<TakePicture />} />
        <Route path="/return" element={<HeaderPics />} />
      </Routes>
    </Router>
  );
}

export default AppUsers;
