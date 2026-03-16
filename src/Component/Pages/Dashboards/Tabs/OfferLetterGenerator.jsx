import React, { useState, useEffect } from "react";
import { FiEye, FiDownload } from "react-icons/fi";
// import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30, // Reduced from 40
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.2, // Reduced from 1.4
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15, // Reduced from 20
    borderBottom: '1px solid #2563eb',
    paddingBottom: 8, // Reduced from 10
  },
  logo: {
    width: 100, // Reduced from 120
    height: 50, // Reduced from 60
    objectFit: 'contain',
  },
  companyAddress: {
    width: '50%',
    textAlign: 'right',
    color: '#4b5563',
    fontSize: 9,
  },
  referenceNumber: {
    marginBottom: 8, // Reduced from 10
    color: '#6b7280',
    fontSize: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipientDetails: {
    marginBottom: 12, // Reduced from 15
    padding: 8, // Reduced from 10
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  recipientText: {
    marginBottom: 1, // Reduced from 2
    color: '#1f2937',
    fontSize: 9,
  },
  subject: {
    marginBottom: 12, // Reduced from 15
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1e40af',
    textDecoration: 'underline',
    textAlign: 'center',
  },
  content: {
    marginBottom: 12, // Reduced from 15
    textAlign: 'justify',
  },
  salutation: {
    marginBottom: 8, // Reduced from 10
    fontSize: 10,
    color: '#1f2937',
  },
  paragraph: {
    marginBottom: 8, // Reduced from 10
    lineHeight: 1.3, // Reduced from 1.4
    color: '#374151',
  },
  listItem: {
    marginBottom: 6, // Reduced from 8
    paddingLeft: 8, // Reduced from 10
    color: '#374151',
    fontSize: 9,
  },
  signature: {
    marginTop: 15, // Reduced from 20
    borderTop: '1px solid #e5e7eb',
    paddingTop: 8, // Reduced from 10
  },
  signatureText: {
    color: '#1f2937',
    fontSize: 9,
    marginBottom: 1, // Reduced from 2
  },
  footer: {
    marginTop: 12, // Reduced from 15
    fontSize: 7,
    textAlign: 'center',
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 8, // Reduced from 10
  },
  website: {
    marginTop: 4, // Reduced from 5
    textAlign: 'center',
    fontSize: 8,
    color: '#2563eb',
    textDecoration: 'underline',
  },
});
  
  

// PDF Document Component
const OfferLetterPDF = ({ data, logoImage }) => {
  const processText = (text) => {
    return text
      .replace('{position}', data.position)
      .replace('{companyName}', data.companyName)
      .replace('{joiningDate}', new Date(data.joiningDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }))
      .replace('{ctc}', data.ctc)
      .replace('{probationPeriod}', data.probationPeriod)
      .replace('{noticePeriod}', data.noticePeriod);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo and Company Address */}
        <View style={styles.header}>
          {logoImage && (
            <Image src={logoImage} style={styles.logo} />
          )}
          <View style={styles.companyAddress}>
            <Text>{data.companyAddress}</Text>
          </View>
        </View>

        {/* Reference Number and Date */}
        <View style={styles.referenceNumber}>
          <Text>Ref: {data.referenceNumber}</Text>
          <Text>Date: {new Date(data.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}</Text>
        </View>

        {/* Recipient Details */}
        <View style={styles.recipientDetails}>
          <Text style={styles.recipientText}>{data.candidateName}</Text>
          <Text style={styles.recipientText}>{data.houseNo}</Text>
          <Text style={styles.recipientText}>{data.street}</Text>
          <Text style={styles.recipientText}>{`${data.city}, ${data.state} - ${data.pincode}`}</Text>
          <Text style={styles.recipientText}>{`Contact No.: ${data.contactNumber}`}</Text>
          <Text style={styles.recipientText}>{`Email Id: ${data.email}`}</Text>
        </View>

        {/* Subject Line */}
        <View style={styles.subject}>
          <Text>Sub: Offer letter for the position of {data.position}.</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.salutation}>Dear {data.candidateName},</Text>
          
          <Text style={styles.paragraph}>
            {processText(data.mainParagraph)}
          </Text>

          {/* Conditions */}
          {data.conditions.map((condition, index) => (
            <Text key={index} style={styles.listItem}>
              {`${index + 1}. ${processText(condition)}`}
            </Text>
          ))}

          {/* Closing Paragraph */}
          <Text style={styles.paragraph}>
            {processText(data.closingParagraph)}
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>{data.hrDepartment}</Text>
          <Text style={styles.signatureText}>{data.companyName}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is an electronically generated offer and does not require a signature from the sender.
          </Text>
        </View>

        {/* Website */}
        <View style={styles.website}>
          <Text>{data.website}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Preview Modal Component
const PreviewModal = ({ data, onClose, isDarkMode }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
      <div className="fixed inset-0 transition-opacity" onClick={onClose}>
        <div
          className={`absolute inset-0 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-500"
          } opacity-75`}
        ></div>
      </div>

      <div
        className={`relative bg-white rounded-lg max-w-4xl w-full mx-auto shadow-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="p-6">
          <h3
            className={`text-lg font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Offer Letter Preview
          </h3>
          <div className="mt-4 border rounded-lg p-6">
            <div className="space-y-6">
              {/* Company Header */}
              <div className="flex justify-between items-start">
                <img
                  src="http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png"
                  alt="Company Logo"
                  className="w-32"
                />
                <p className="text-sm text-right">{data.companyAddress}</p>
              </div>

              {/* Reference and Date */}
              <div>
                <p>{data.referenceNumber}</p>
                <p>{new Date(data.date).toLocaleDateString()}</p>
              </div>

              {/* Recipient Details */}
              <div>
                <p>{data.candidateName}</p>
                <p>{data.houseNo}</p>
                <p>{data.street}</p>
                <p>
                  {data.city}, {data.state} - {data.pincode}
                </p>
                <p>Contact No.: {data.contactNumber}</p>
                <p>Email Id: {data.email}</p>
              </div>

              {/* Subject */}
              <p className="font-bold">
                Sub: Offer letter for the position of {data.position}.
              </p>

              {/* Content */}
              <div className="space-y-4">
                <p>Dear {data.candidateName},</p>
                <p>
                  With reference to your job application and subsequent
                  interview with us we are pleased to offer you the position of{" "}
                  {data.position} with {data.companyName} at our Head Office,
                  Jaipur, as per mutually agreed terms & conditions -
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    This offer is provisional in nature and a formal letter of
                    appointment shall be issued to you upon your joining duties
                    on or before{" "}
                    {new Date(data.joiningDate).toLocaleDateString()}.
                  </li>
                  <li>
                      You shall be on Annual CTC of Rs. {data.ctc}/- subject to
                    statutory and other deductions as per Govt. Laws applicable.
                  </li>
                  <li>
                    You shall be on probation for a period of{" "}
                    {data.probationPeriod}.
                  </li>
                  <li>
                    During probation, if you wish to leave the services of the
                    company, you may do so by giving a {data.noticePeriod}
                    notice period or salary in lieu thereof.
                  </li>
                  <li>
                    The Company may terminate your services anytime without any
                    notice in case of non-performance, misconduct or dereliction
                    of duties.
                  </li>
                </ol>
              </div>

              {/* Signature */}
              <div className="mt-8">
                <p>{data.hrDepartment}</p>
                <p>{data.companyName}</p>
              </div>

              {/* Footer */}
              <p className="text-xs text-center text-gray-500 mt-8">
                This is an electronically generated offer and does not require a
                signature from the sender.
              </p>

              {/* Website */}
              <p className="text-sm text-center text-blue-600">
                {data.website}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const OfferLetterGenerator = ({ isDarkMode, onClose }) => {
  const [logoImage, setLogoImage] = useState(null);
  const [offerLetterData, setOfferLetterData] = useState({
    // Reference details
    referenceNumber: "MAB/HR/2025/Feb/01-01",
    date: new Date().toISOString().split("T")[0],

    // Candidate details
    candidateName: "",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    contactNumber: "",
    email: "",

    // Offer details
    position: "",
    joiningDate: "",
    ctc: "",
    probationPeriod: "3 months",
    noticePeriod: "30 days",

    // Company details
    companyName: "MABICONS",
    companyAddress: "92, Kasturba Nagar, Rani Sati Nagar\nNirman Nagar, Jaipur - 302019",
    hrDepartment: "HR Dept.",
    website: "www.mabicons.com",


       // Add new customizable content
       mainParagraph: "With reference to your job application and subsequent interview with us, we are pleased to offer you the position of {position} with {companyName} at our Head Office, Jaipur, as per mutually agreed terms & conditions -",
    
       conditions: [
        `This offer is provisional in nature and a formal letter of appointment shall be issued to you upon your joining duties on or before Monday, February 3, 2025, and satisfactory completion of the joining formalities. Also furnishing your documents is a mandatory requirement, which needs to be complied on your joining day. If not, this letter of offer shall stand void.`,
        
        `You shall be paid an Annual CTC of Rs. 1,80,000/- (Rupees One Lac Eighty Thousand only) subject to Statutory and other deductions as per Govt Laws applicable. Your detailed salary structure shall be provided to you with your Appointment Letter upon your successful completion of your joining formalities.`,
        
        `You shall be on probation for a period of 3 months during this period, your performance shall be reviewed by the management on parameters like work conduct, and general aptitude, and if found satisfactory your employment shall be confirmed with the Company; else maybe extended accordingly for next 1 month.`,
        
        `During probation, if you wish to leave the services of the company, you may do so by giving a 30 days' notice period or salary in lieu thereof. Post confirmation if you wish to leave the services of the Company, you can do so by giving 60 days' notice or salary in lieu thereof.`,
        
        `The Company may terminate your services anytime without any notice in case of non-performance, misconduct or dereliction of duties.`,
        
        `This offer of employment with MABICONS is subject to the successful verification of information provided by you. The management reserves the right to withdraw the said offer/appointment in case your background verification report comes negative and if any of the information provided by you in the Application Form/Personal Data Form is found misleading or misconceived and/or if any of the above conditions are not fulfilled by you at the time of joining.`,
        
        `As a token of your acceptance of our terms and conditions, you are required to sign and submit a copy of this offer letter, within 2 days from the date of this letter, failing which this offer letter stands expired.`
      ],
    
      closingParagraph: "We are keen on welcoming you on board to our organization and look forward to attaining the common goal of sustainable growth for all concerned as a long-term vision."
  });

  const replacePlaceholders = (text) => {
    return text
      .replace('{position}', offerLetterData.position)
      .replace('{companyName}', offerLetterData.companyName)
      .replace('{joiningDate}', new Date(offerLetterData.joiningDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }))
      .replace('{ctc}', offerLetterData.ctc)
      .replace('{probationPeriod}', offerLetterData.probationPeriod)
      .replace('{noticePeriod}', offerLetterData.noticePeriod);
  };

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!offerLetterData.candidateName)
      newErrors.candidateName = "Name is required";
    if (!offerLetterData.position) newErrors.position = "Position is required";
    if (!offerLetterData.ctc) newErrors.ctc = "CTC is required";
    if (!offerLetterData.joiningDate)
      newErrors.joiningDate = "Joining date is required";
    if (!offerLetterData.email) newErrors.email = "Email is required";
    if (!offerLetterData.contactNumber)
      newErrors.contactNumber = "Contact number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 space-y-8`}>
    
    {/* Company Details Section */}
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b pb-2`}>
        Company Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
            Company Logo
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className={`block w-full text-sm ${
                isDarkMode ? 'text-gray-200 file:bg-gray-600 file:text-gray-200' : 'text-gray-700 file:bg-gray-100 file:text-gray-700'
              } file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium hover:file:bg-gray-200`}
            />
            {logoImage && (
              <img src={logoImage} alt="Selected logo" className="h-12 w-auto object-contain" />
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Company Name
            </label>
            <input
              type="text"
              value={offerLetterData.companyName}
              onChange={(e) => setOfferLetterData({ ...offerLetterData, companyName: e.target.value })}
              placeholder="MABICONS"
              className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Company Address
            </label>
            <textarea
              value={offerLetterData.companyAddress}
              onChange={(e) => setOfferLetterData({ ...offerLetterData, companyAddress: e.target.value })}
              rows="3"
              placeholder="92, Kasturba Nagar, Rani Sati Nagar&#10;Nirman Nagar, Jaipur - 302019"
              className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Website
            </label>
            <input
              type="text"
              value={offerLetterData.website}
              onChange={(e) => setOfferLetterData({ ...offerLetterData, website: e.target.value })}
              placeholder="www.mabicons.com"
              className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Reference Details Section */}
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b pb-2`}>
        Reference Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Reference Number
          </label>
          <input
            type="text"
            value={offerLetterData.referenceNumber}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, referenceNumber: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Date
          </label>
          <input
            type="date"
            value={offerLetterData.date}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, date: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
      </div>
    </div>

    {/* Candidate Details Section */}
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b pb-2`}>
        Candidate Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Candidate Name
          </label>
          <input
            type="text"
            value={offerLetterData.candidateName}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, candidateName: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
          {errors.candidateName && <p className="mt-1 text-sm text-red-600">{errors.candidateName}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            House No.
          </label>
          <input
            type="text"
            value={offerLetterData.houseNo}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, houseNo: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Street
          </label>
          <input
            type="text"
            value={offerLetterData.street}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, street: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            City
          </label>
          <input
            type="text"
            value={offerLetterData.city}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, city: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            State
          </label>
          <input
            type="text"
            value={offerLetterData.state}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, state: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Pincode
          </label>
          <input
            type="text"
            value={offerLetterData.pincode}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, pincode: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Contact Number
          </label>
          <input
            type="tel"
            value={offerLetterData.contactNumber}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, contactNumber: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
          {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Email
          </label>
          <input
            type="email"
            value={offerLetterData.email}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, email: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>
    </div>

    {/* Offer Details Section */}
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b pb-2`}>
        Offer Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Position
          </label>
          <input
            type="text"
            value={offerLetterData.position}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, position: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
          {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Joining Date
          </label>
          <input
            type="date"
            value={offerLetterData.joiningDate}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, joiningDate: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
          {errors.joiningDate && <p className="mt-1 text-sm text-red-600">{errors.joiningDate}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            CTC (₹)
          </label>
          <input
            type="text"
            value={offerLetterData.ctc}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, ctc: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
          {errors.ctc && <p className="mt-1 text-sm text-red-600">{errors.ctc}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Probation Period
          </label>
          <input
            type="text"
            value={offerLetterData.probationPeriod}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, probationPeriod: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Notice Period
          </label>
          <input
            type="text"
            value={offerLetterData.noticePeriod}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, noticePeriod: e.target.value })}
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
        </div>
      </div>
    </div>

    {/* Letter Content Section */}
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b pb-2`}>
        Letter Content
      </h2>
      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            Main Paragraph
          </label>
          <textarea
            value={offerLetterData.mainParagraph}
            onChange={(e) => setOfferLetterData({ ...offerLetterData, mainParagraph: e.target.value })}
            rows="4"
            className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
          />
          <p className="mt-1 text-sm text-gray-500">
            Available placeholders: {'{position}'}, {'{companyName}'}, {'{joiningDate}'}, {'{ctc}'}, {'{probationPeriod}'}, {'{noticePeriod}'}
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Conditions
            </label>
            <button
              type="button"
              onClick={() => {
                setOfferLetterData({
                  ...offerLetterData,
                  conditions: [...offerLetterData.conditions, ""],
                });
              }}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Condition
            </button>
          </div>
          <div className="space-y-3">
            {offerLetterData.conditions.map((condition, index) => (
              <div key={index} className="flex items-start group">
                <span className={`mr-2 mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{index + 1}.</span>
                <div className="flex-grow">
                  <textarea
                    value={condition}
                    onChange={(e) => {
                      const newConditions = [...offerLetterData.conditions];
                      newConditions[index] = e.target.value;
                      setOfferLetterData({
                        ...offerLetterData,
                        conditions: newConditions,
                      });
                    }}
                    rows="2"
                    className={`w-full rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} border-gray-300`}
                  />
                </div>
                <button
                  onClick={() => {
                    const newConditions = offerLetterData.conditions.filter((_, i) => i !== index);
                    setOfferLetterData({
                      ...offerLetterData,
                      conditions: newConditions,
                    });
                  }}
                  className="ml-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handlePreview}
          className={`flex items-center px-4 py-2 rounded-lg ${
            isDarkMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          <FiEye className="mr-2" />
          Preview
        </button>

        <button
          onClick={async () => {
            try {
              const blob = await pdf(
                <OfferLetterPDF data={offerLetterData} logoImage={logoImage} />
              ).toBlob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${offerLetterData.candidateName}-Offer-Letter.pdf`;
              link.click();
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("Error generating PDF:", error);
            }
          }}
          className={`flex items-center px-4 py-2 rounded-lg ${
            isDarkMode
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-purple-500 hover:bg-purple-600"
          } text-white`}
        >
          <FiDownload className="mr-2" />
          Download PDF
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          data={offerLetterData}
          onClose={() => setShowPreview(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default OfferLetterGenerator;