import { BrowserRouter,Routes,Route } from "react-router-dom";
import Register from "./components/register";
import Login from "./components/login";
import DoctorDashboard from "./components/doctor";
import PatientDashboard from "./components/patient";
import Navbar from "./components/navbar";
function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/reg" element={<Register/>}/>
      <Route path="/doc" element={<DoctorDashboard/>}/>
      <Route path="/pat" element={<PatientDashboard/>}/>
      <Route path="/pat" element={<PatientDashboard/>}/>
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;