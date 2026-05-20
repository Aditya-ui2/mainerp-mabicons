import  { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function App() {
  const [clientId, setClientId] = useState("");
  const [files, setFiles] = useState({
    employeeMasterDatabase: null,
    currentSalaryStructure: null,
    previousSalarySheets: null,
    currentHRPolicies: null,
    leaveBalance: null,
  });
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, files: selectedFiles } = event.target;
    setFiles((prevState) => ({
      ...prevState,
      [name]: selectedFiles[0],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    alert("File uploads are temporarily disabled due to database storage limits (500MB). We will reopen this feature in the future.");
    return;

    try {
      console.log("Attempting to connect to:", "https://erp-backend-d8tz.onrender.com/upload-documents");
      
      const response = await axios.post("https://erp-backend-d8tz.onrender.com/upload-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Files uploaded successfully: " + response.data.message);
      navigate('/customer-dashboard');
    } catch (error) {
      console.error("Full error object:", error);
      if (error.code === 'ERR_NAME_NOT_RESOLVED') {
        alert("Cannot connect to server. Please check your internet connection or contact support.");
      } else if (error.response) {
        console.error("Server responded with:", error.response.data);
        alert("Error uploading files: " + error.response.data.message);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response from server. Please try again.");
      } else {
        console.error("Error setting up the request:", error.message);
        alert("Error uploading files. Please try again.");
      }
    }
  };

  const isFormComplete = clientId && Object.values(files).every((file) => file !== null);

  return (
    <div>
      <h2>Upload Client Documents</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Client ID:</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Employee Master Database:</label>
          <input
            type="file"
            name="employeeMasterDatabase"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Current Salary Structure:</label>
          <input
            type="file"
            name="currentSalaryStructure"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Previous Salary Sheets:</label>
          <input
            type="file"
            name="previousSalarySheets"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Current HR Policies:</label>
          <input
            type="file"
            name="currentHRPolicies"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Leave Balance:</label>
          <input
            type="file"
            name="leaveBalance"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Agreement:</label>
          <input
            type="file"
            name="agreement"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={!isFormComplete}>
          Upload
        </button>
      </form>
    </div>
  );
}