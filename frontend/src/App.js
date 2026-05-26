import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelection from "./components/RoleSelection";




// Admin Components
import AdminLogin from "./components/Admin/AdminLogin";
import AdminPage from "./components/Admin/AdminPage";
import SuperAdminLogin from "./components/Admin/SuperAdminLogin";
import SuperAdminRegister from "./components/Admin/SuperAdminRegister";
import DashboardHome from "./components/Admin/Dashboard/DashboardHome";
import Dashboard from "./components/Admin/Dashboard/Dashboard";
import AddEmployee from "./components/Admin/Dashboard/AddEmployee/AddEmployee";
import EmployeesPage from "./components/Admin/Dashboard/EmployeesPage";
import EmployeeProfile from "./components/Admin/Dashboard/EmployeeProfile";
import CommunicationPage from "./components/Admin/Dashboard/CommunicationPage";
import DocumentVerification from "./components/Admin/Dashboard/DocumentPage";
import MailDetail from "./components/Admin/Dashboard/MailDetail";
import AddWorker from "./components/Admin/Dashboard/AddWorker";
import WorkersPage from "./components/Admin/Dashboard/Workerspage";



// Employee Components
import EmployeeRegister from "./components/EmployeeHome/EmployeeRegister";
import EmployeeLogin from "./components/EmployeeHome/EmployeeLogin";
import ProfileCompletion from "./components/EmployeeHome/ProfileCompletion";
import EmployeePasswordset from "./components/EmployeeHome/EmpPassword";
import ForgotPassword from "./components/EmployeeHome/Forgotpassword";
import EmployeeDashboard from "./components/EmployeeHome/EmpDashboard/EmployeeDashboard";
import MyDocuments from "./components/EmployeeHome/EmpDashboard/MyDocuments";
import ProfilePage from "./components/EmployeeHome/EmpDashboard/ProfilePage";



import "../src/styles/App.css";






function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<RoleSelection />} />



        {/* // Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-page" element={<AdminPage/>}/>
        <Route path="/superadmin-login" element={<SuperAdminLogin/>}/>
        <Route path="/superadmin-register" element={<SuperAdminRegister/>}/>






        

        {/* //outlet */}
        <Route path="/admin/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="Add-Worker" element={<AddWorker/>}/>
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employee/:emp_id" element={<EmployeeProfile />} />
          <Route path="communicationpage" element={<CommunicationPage />} />
          <Route path="DocumentVerification" element={<DocumentVerification />} />
          <Route path="mail/:mailId" element={<MailDetail />} />
          <Route path="workerspage" element={<WorkersPage/>} />
          


        </Route>






        {/* Employee Routes */}
        <Route path="/employee-register" element={<EmployeeRegister />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/employee/Forgotpassword" element={<ForgotPassword/>}/>
        <Route path="/employee/password-set" element={<EmployeePasswordset />} />
        <Route path="/employee/profile-completion" element={<ProfileCompletion />} />
        <Route path="/employee/Dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/MyDocuments" element={<MyDocuments />} />
        <Route path="/employee/ProfilePage" element={<ProfilePage />} />
        


      </Routes>
    </Router>
  );
}
 
export default App;
