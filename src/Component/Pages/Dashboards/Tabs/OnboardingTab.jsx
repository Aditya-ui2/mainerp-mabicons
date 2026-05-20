import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiCalendar, FiMail, FiBriefcase, FiX, FiDollarSign, FiPaperclip, FiHome, FiEye, FiCheckCircle, FiXCircle ,FiImage, FiLink, FiFileText, FiSend,FiUser} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import OfferLetterGenerator  from './OfferLetterGenerator';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OnboardingTab = ({ isDarkMode }) => {
  const [candidates, setCandidates] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    company: 'MABICONS',
    joiningDate: '',
    ctc: '',
    offerLetter: null,
    companyLogo: 'http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png',
    supportEmail: 'mabiconsjpr@gmail.com',
    headerColor: '#e3e1ff',
    benefits: '',
    status: 'pending'
  });
  const [selectedTemplate, setSelectedTemplate] = useState('welcome1');
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState({ show: false, success: false, message: '' });
  const [customMessage, setCustomMessage] = useState('');
  const [showPreHiringModal, setShowPreHiringModal] = useState(false);
  const [preHiringData, setPreHiringData] = useState({
    candidateName: '',
    position: '',
    candidateEmail: '',
    googleFormLink: '',
    selectedDocuments: [
      { id: 1, name: 'Aadhaar Card', selected: true },
      { id: 2, name: 'Updated CV', selected: true },
      { id: 3, name: 'Salary Slips – Last 3 months', selected: true },
      { id: 4, name: 'Bank Statement – Last 3 months', selected: true },
      { id: 5, name: 'Required Notice Period', selected: true },
      { id: 6, name: 'Offer/Appointment letter of previous company', selected: true }
    ]
  });
  const [previewContent, setPreviewContent] = useState('');
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);

  const getEmailSubject = (template, data) => {
    switch(template) {
      case 'welcome1':
        return `Welcome to ${data.company}! 🎉`;
      case 'welcome2':
        return `Welcome to ${data.company} - Let's Get Started! 🚀`;
      case 'welcome3':
        return `Welcome to ${data.company} - Official Onboarding`;
      default:
        return 'Welcome to Our Team';
    }
  };

  const formatCTC = (value) => {
    if (!value) return '';
    
    // Remove any existing formatting
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Convert to float
    const amount = parseFloat(numericValue);
    
    // Format in lakhs
    if (amount >= 1) {
      return `₹${amount} LPA (Lakhs Per Annum)`;
    }
    
    return `₹${numericValue}`;
  };

  const emailTemplates = {
    modernProfessional: {
      name: 'Modern Professional',
      subject: `Welcome to ${formData.company} - Account Details`,
      template: (data, customMessage) => `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light only">
            <meta name="supported-color-schemes" content="light only">
          </head>
          <body style="background-color: #ffffff !important; margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff !important;">
              <!-- Header with custom background color -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: ${data.headerColor}; padding: 20px; text-align: left;">
                    <img src="${data.companyLogo}" alt="${data.company}" style="height: 40px; max-width: 150px;">
                  </td>
                </tr>
              </table>

              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff !important;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #1f2937; margin-bottom: 20px; font-size: 15px; line-height: 1.5;">
                      Dear <strong style="color: #4f46e5;">${data.name}</strong>,
                    </p>
                    
                    <p style="color: #1f2937; margin-bottom: 20px; font-size: 15px; line-height: 1.5;">
                      We are thrilled to have you on board and appreciate your interest. You are now part of the ${data.company} team, and we are committed to providing you with the best experience possible.
                    </p>

                    <p style="color: #1f2937; margin-bottom: 15px; font-size: 15px; line-height: 1.5;">
                      Below, you will find your account details to get started:
                    </p>

                    <!-- Details Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc !important; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="120" style="color: #4b5563; font-size: 15px; font-weight: 600;">Position:</td>
                                    <td style="color: #1f2937; font-size: 15px;">${data.position}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="120" style="color: #4b5563; font-size: 15px; font-weight: 600;">Start Date:</td>
                                    <td style="color: #1f2937; font-size: 15px;">${data.joiningDate}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="120" style="color: #4b5563; font-size: 15px; font-weight: 600;">CTC:</td>
                                    <td style="color: #1f2937; font-size: 15px; font-weight: 500;">${formatCTC(data.ctc)}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ${data.benefits ? `
                            <tr>
                              <td style="padding: 8px 0; border-top: 1px solid #e2e8f0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="120" style="color: #4b5563; font-size: 15px; font-weight: 600;">Benefits:</td>
                                    <td style="color: #1f2937; font-size: 15px;">${data.benefits}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #1f2937; margin-bottom: 20px; font-size: 15px; line-height: 1.5;">
                      If you have any questions or need assistance, our support team is here to help. Contact us at 
                      <a href="mailto:${data.supportEmail}" style="color: #4f46e5; text-decoration: none;">${data.supportEmail}</a>
                    </p>

                    <p style="color: #1f2937; margin-bottom: 20px; font-size: 15px; line-height: 1.5;">
                      ${customMessage || `Thank you for choosing ${data.company}!`}
                    </p>

                    <!-- Signature -->
                    <p style="color: #1f2937; margin: 0; font-size: 15px; line-height: 1.5;">
                      Regards,<br>
                      ${data.company}
                    </p>
                  </td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `
    }
  };

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Updated sendEmail function to handle attachments
  const sendEmail = async (emailContent, emailSubject, recipientEmail, recipientName, pdfFile) => {
    const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY; // Loaded from environment variables

    const API_URL = 'https://api.brevo.com/v3/smtp/email';

    // Prepare email data
    const emailData = {
      sender: {
        name: "HR Team",
        email: "ashwin.francis@mabicons.com" // Replace with your verified sender email
      },
      to: [{
        email: recipientEmail,
        name: recipientName
      }],
      subject: emailSubject,
      htmlContent: emailContent
    };

    // Add attachment if PDF file exists
    if (pdfFile) {
      try {
        const base64Content = await fileToBase64(pdfFile);
        emailData.attachment = [{
          name: pdfFile.name,
          content: base64Content
        }];
      } catch (error) {
        console.error('Error converting file to base64:', error);
        return { success: false, message: 'Failed to process PDF attachment' };
      }
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Failed to send email. Please try again.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.position) {
      toast.error('Please fill in all required fields');
      return;
    }

    await handlePreviewAndSend();
  };

  // Add this function to handle the preview and send action
  const handlePreviewAndSend = async () => {
    setIsSending(true);
    try {
      const emailContent = emailTemplates.modernProfessional.template(formData, customMessage);
      const emailSubject = `Welcome to ${formData.company || 'MABICONS'}! 🎉`;
      
      const result = await sendEmail(
        emailContent,
        emailSubject,
        formData.email,
        formData.name,
        formData.offerLetter
      );

      if (result.success) {
        toast.success('Email sent successfully!');
        setCandidates([...candidates, { ...formData, id: Date.now() }]);
        setFormData({
          name: '',
          email: '',
          position: '',
          company: 'MABICONS',
          joiningDate: '',
          ctc: '',
          offerLetter: null,
          companyLogo: 'http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png',
          supportEmail: 'mabiconsjpr@gmail.com',
          headerColor: '#e3e1ff',
          benefits: '',
          status: 'pending'
        });
        setShowAddForm(false);
        setShowPreview(false);
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  // Add file input handler
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, offerLetter: file });
      
      // Add file upload UI feedback
      const fileUploadElement = document.getElementById('fileUploadStatus');
      if (fileUploadElement) {
        fileUploadElement.innerHTML = 'Processing file...';
      }
      
      try {
        // Extract data from PDF
        const extractedData = await extractDataFromPDF(file);
        
        if (extractedData && Object.values(extractedData).some(value => value)) {
          // Show confirmation dialog only if some data was extracted
          if (window.confirm('Would you like to fill the form with data from the offer letter?')) {
            setFormData(prev => ({
              ...prev,
              name: extractedData.name || prev.name,
              email: extractedData.email || prev.email,
              position: extractedData.position || prev.position,
              joiningDate: extractedData.joiningDate || prev.joiningDate,
              ctc: extractedData.ctc || prev.ctc,
              benefits: extractedData.benefits || prev.benefits
            }));
          }
        }

        // Update upload status
        if (fileUploadElement) {
          fileUploadElement.innerHTML = 'File uploaded successfully';
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
        toast.error('Error processing PDF file');
        if (fileUploadElement) {
          fileUploadElement.innerHTML = 'Error processing file';
        }
      }
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  // Add this function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  // Add some CSS for the email preview
  // You can add this to your CSS file or use a style tag
  const styles = `
    .email-preview {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .email-preview img {
      max-width: 100%;
      height: auto;
    }

    .email-preview a {
      color: #4f46e5;
      text-decoration: none;
    }

    .email-preview a:hover {
      text-decoration: underline;
    }
  `;

  const StatusNotification = ({ status }) => {
    if (!status.show) return null;

    return (
      <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
        status.success ? 'bg-green-500' : 'bg-red-500'
      } text-white`}>
        <div className="flex items-center space-x-2">
          {status.success ? (
            <FiCheckCircle className="w-5 h-5" />
          ) : (
            <FiXCircle className="w-5 h-5" />
          )}
          <span>{status.message}</span>
        </div>
      </div>
    );
  };

  // Add a new function to handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, companyLogo: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a JPEG or PNG image');
    }
  };

  const handlePreviewEmail = () => {
    const emailContent = `
      Dear ${formData.name},
      
      Please be informed that you have been shortlisted for the position of ${formData.position} in our organization - ${formData.company}.
      Currently, we are in the process of rolling-out your offer letter. Kindly provide us with the following information/document to proceed further:
      
      1. Aadhaar Card
      2. Updated CV
      3. Salary Slips – Last 3 months
      4. Bank Statement – Last 3 months
      5. Required Notice Period
      6. Offer/Appointment letter of previous company

      Accordingly, we shall provide you with your offer letter and shall confirm your date and time of joining.

      ${formData.googleFormLink ? `Google Form: ${formData.googleFormLink}` : ''}
    `;
    
    setPreviewContent(emailContent);
  };

  // Function to generate email content
  const generateEmailContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light only">
          <meta name="supported-color-schemes" content="light only">
        </head>
        <body style="background-color: #ffffff !important; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff !important; color: #000000 !important;">
            <!-- Header with custom background color -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #e3e1ff; padding: 20px; text-align: left;">
                  <img src="http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png" alt="MABICONS" style="height: 40px; max-width: 150px;">
                </td>
              </tr>
            </table>

            <!-- Content -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff !important;">
              <tr>
                <td style="padding: 30px 25px;">
                  <!-- Greeting -->
                  <p style="font-size: 16px; line-height: 1.6; color: #1f2937; margin-bottom: 25px;">
                    Dear <span style="color: #4f46e5; font-weight: 600;">${preHiringData.candidateName}</span>,
                  </p>

                  <!-- Main Message -->
                  <p style="font-size: 16px; line-height: 1.6; color: #1f2937; margin-bottom: 25px;">
                    We are pleased to inform you that you have been shortlisted for the position of 
                    <strong style="color: #4f46e5;">${preHiringData.position}</strong> at 
                    <strong style="color: #4338ca;">MABICONS</strong>.
                  </p>

                  <!-- Required Documents -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff !important; margin: 30px 0;">
  <tr>
    <td style="padding: 0;">
      <div style="background-color: #ffffff !important; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom: 16px;">
              <h3 style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 600;">Required Documents</h3>
            </td>
          </tr>
          ${preHiringData.selectedDocuments
            .filter(doc => doc.selected)
            .map((doc, index) => `
              <tr>
                <td style="padding-bottom: 8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc !important; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <tr>
                      <td style="padding: 12px 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 28px; vertical-align: middle;">
                              <div style="background-color: #1B4F98; width: 28px; height: 28px; border-radius: 50%; color: #ffffff; text-align: center; line-height: 28px; font-size: 14px;">
                                ${index + 1}
                              </div>
                            </td>
                            <td style="padding-left: 12px; color: #1f2937; font-size: 15px; vertical-align: middle;">
                              ${doc.name}
                            </td>
                            <td style="text-align: right; vertical-align: middle;">
                              <span style="display: inline-block; background-color: #FF0000; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                Required
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `).join('')}
          <tr>
            <td style="padding-top: 16px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; font-style: italic; text-align: center;">
                Please ensure all documents are clear and in PDF format
              </p>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
                  ${preHiringData.googleFormLink ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-left: 4px solid #4f46e5; margin: 25px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 15px; color: #1f2937;">
                            📝 Please complete this form:
                            <a href="${preHiringData.googleFormLink}" style="color: #4f46e5; text-decoration: none; font-weight: 500; display: inline-block; margin-top: 8px;">
                              Access Form →
                            </a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
  
                  <!-- Signature -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 2px solid #f1f5f9;">
                    <tr>
                      <td style="padding-top: 30px;">
                        <p style="margin: 0; color: #1f2937;">Best regards,</p>
                        <p style="margin: 5px 0; color: #4f46e5; font-weight: 600;">HR Team</p>
                        <p style="margin: 5px 0; color: #4338ca; font-weight: 700;">MABICONS</p>
                      </td>
                    </tr>
                  </table>
  
                  <!-- Contact Info -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <tr>
                      <td style="padding: 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom: 20px; width: 50%; vertical-align: top;">
                              <p style="margin: 0 0 12px; font-weight: 600; color: #1f2937;">Corporate Office</p>
                              <a href="https://maps.google.com/?q=92,+Kasturba+Nagar,+Nirman+Nagar,+Jaipur+302019" 
                                 style="color: #4f46e5; text-decoration: none; display: block; margin-bottom: 8px;">
                                92, Kasturba Nagar, Nirman Nagar,<br>Jaipur 302019
                              </a>
                              <p style="margin: 8px 0; color: #1f2937;">
                                <strong>Satellite Seats:</strong><br>
                                Delhi, Hyderabad, Mumbai, Vadodara
                              </p>
                            </td>
                            <td style="padding-bottom: 20px; width: 50%; vertical-align: top;">
                              <p style="margin: 0 0 12px; font-weight: 600; color: #1f2937;">Contact Information</p>
                              <p style="margin: 0 0 8px;">
                                <a href="tel:+918003650831" style="color: #1f2937; text-decoration: none;">
                                  📞 +91-8003650831
                                </a>
                              </p>
                              <p style="margin: 0 0 8px;">
                                <a href="mailto:mabiconsjpr@gmail.com" style="color: #1f2937; text-decoration: none;">
                                  ✉️ mabiconsjpr@gmail.com
                                </a>
                              </p>
                              <p style="margin: 0 0 8px;">
                                <a href="http://www.mabicons.com" style="color: #1f2937; text-decoration: none;">
                                  🌐 www.mabicons.com
                                </a>
                              </p>
                              <p style="margin: 0;">
                                <a href="https://www.linkedin.com/company/mabicons/" style="color: #1f2937; text-decoration: none;">
                                  💼 LinkedIn
                                </a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  // Updated handlePreHiringSubmit function
  const handlePreHiringSubmit = async (e) => {
    e.preventDefault();
    
    if (!preHiringData.candidateName || !preHiringData.candidateEmail || !preHiringData.position) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSending(true);
      
      const emailContent = generateEmailContent();
      const emailSubject = `Pre-Hiring Information for ${preHiringData.position} Position at MABICONS`;
      
      const result = await sendEmail(
        emailContent,
        emailSubject,
        preHiringData.candidateEmail,
        preHiringData.candidateName
      );

      if (result.success) {
        toast.success('Pre-hiring email sent successfully!');
        setShowPreHiringModal(false);
        setShowPreview(false);
        // Reset form data
        setPreHiringData({
          candidateName: '',
          position: '',
          candidateEmail: '',
          googleFormLink: '',
          selectedDocuments: [
            { id: 1, name: 'Aadhaar Card', selected: true },
            { id: 2, name: 'Updated CV', selected: true },
            { id: 3, name: 'Salary Slips – Last 3 months', selected: true },
            { id: 4, name: 'Bank Statement – Last 3 months', selected: true },
            { id: 5, name: 'Required Notice Period', selected: true },
            { id: 6, name: 'Offer/Appointment letter of previous company', selected: true }
          ]
        });
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Update the CTC input field to handle the formatting
  const handleCTCChange = (e) => {
    let value = e.target.value;
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    setFormData({
      ...formData,
      ctc: value
    });
  };

  // Add a separate preview function
  const handlePreview = () => {
    const emailContent = emailTemplates.modernProfessional.template(formData, customMessage);
    setPreviewContent(emailContent);
    setShowPreview(true);
  };

  // PDF Styles
  const pdfStyles = StyleSheet.create({
    page: {
      padding: 50,
      fontSize: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 'auto',
    },
    companyAddress: {
      textAlign: 'right',
      fontSize: 10,
    },
    referenceNumber: {
      marginBottom: 20,
    },
    recipientDetails: {
      marginBottom: 30,
    },
    subject: {
      marginBottom: 20,
      fontWeight: 'bold',
    },
    content: {
      lineHeight: 1.6,
    },
    signature: {
      marginTop: 50,
    },
  });

  // Offer Letter PDF Component
  const OfferLetterPDF = () => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header with Logo and Company Address */}
        <View style={pdfStyles.header}>
          <Image src={formData.companyLogo} style={pdfStyles.logo} />
          <Text style={pdfStyles.companyAddress}>{formData.companyAddress}</Text>
        </View>

        {/* Reference Number and Date */}
        <View style={pdfStyles.referenceNumber}>
          <Text>{formData.referenceNumber}</Text>
          <Text>{formData.date}</Text>
        </View>

        {/* Recipient Details */}
        <View style={pdfStyles.recipientDetails}>
          <Text>Mr. {formData.candidateName}</Text>
          <Text>{formData.address}</Text>
          <Text>Contact No.: {formData.contactNumber}</Text>
          <Text>Email Id: {formData.email}</Text>
        </View>

        {/* Subject Line */}
        <View style={pdfStyles.subject}>
          <Text>Sub: Offer letter for the position of {formData.position}.</Text>
        </View>

        {/* Main Content */}
        <View style={pdfStyles.content}>
          <Text>Dear {formData.candidateName},</Text>
          <Text>
            With reference to your job application and subsequent interview with us we are pleased to offer you the position
            of {formData.position} with {formData.companyName} at our Head Office, Jaipur, as per mutually agreed terms &
            conditions -
          </Text>

          {/* Terms and Conditions */}
          <Text>1. This offer is provisional in nature and a formal letter of appointment shall be issued to you upon your joining
            duties on or before {formData.joiningDate}.</Text>
          
          <Text>2. You shall be on Annual CTC of Rs. {formatCTC(formData.ctc)}/- subject to statutory and other deductions as per Govt. Laws applicable.</Text>
          
          <Text>3. You shall be on probation for a period of {formData.probationPeriod}.</Text>
          
          <Text>4. During probation, if you wish to leave the services of the company, you may do so by giving a {formData.noticePeriod}
            notice period or salary in lieu thereof.</Text>
        </View>

        {/* Signature */}
        <View style={pdfStyles.signature}>
          <Text>HR Dept.</Text>
          <Text>{formData.companyName}</Text>
        </View>
      </Page>
    </Document>
  );

  // Add this function near the top of the component
  const extractDataFromPDF = async (file) => {
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      // Extract text from first page
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      
      // Simple parsing logic - you can make this more sophisticated
      const extractedData = {
        name: extractField(text, /name:?\s*([^\n,]+)/i),
        email: extractField(text, /email:?\s*([^\s,]+@[^\s,]+)/i),
        position: extractField(text, /position:?\s*([^\n,]+)/i),
        joiningDate: extractField(text, /joining date:?\s*([^\n,]+)/i),
        ctc: extractField(text, /ctc:?\s*([^\n,]+)/i),
        benefits: extractField(text, /benefits:?\s*([^\n,]+)/i),
      };

      console.log('Extracted data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return null;
    }
  };

  // Helper function to extract fields using regex
  const extractField = (text, regex) => {
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  // Update the file upload section in the form
  const FileUploadSection = () => (
    <div className="space-y-2">
      <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
        isDarkMode ? 'text-gray-200' : 'text-gray-700'
      }`}>
        <FiPaperclip className="w-4 h-4" />
        <span>Offer Letter (PDF)</span>
      </label>
      <div className={`relative rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-white border-gray-300'
      }`}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="px-4 py-2 text-sm">
          {formData.offerLetter ? (
            <div className="flex items-center justify-between">
              <span className="truncate">{formData.offerLetter.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData({ ...formData, offerLetter: null });
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Click to upload PDF (Data will be automatically extracted)
            </span>
          )}
        </div>
        <div id="fileUploadStatus" className="px-4 py-1 text-xs text-indigo-600"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Candidate Onboarding
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage and track your candidate onboarding process
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          {/* Pre-Hiring Email Button */}
          <button
            onClick={() => setShowPreHiringModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <FiMail className="w-5 h-5 mr-2" />
            Send Pre-Hiring Email
          </button>

          {/* Generate Offer Letter Button */}
          <button
            onClick={() => setShowOfferLetterModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FiFileText className="w-5 h-5 mr-2" />
            Generate Offer Letter
          </button>

          {/* Add New Candidate Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <FiUserPlus className="w-5 h-5 mr-2" />
            Add New Candidate
          </button>
        </div>
      </div>

      {/* Updated Add Candidate Form Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900/75' : 'bg-black/50'}`}></div>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative inline-block w-full max-w-3xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-2xl sm:my-8 sm:align-middle sm:p-6`}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Add New Candidate
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Fill in the candidate's information to start the onboarding process
                </p>
              </div>

              {/* Form Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-2">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className={`pb-3 mb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Personal Information
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Basic information about the candidate
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiUserPlus className="w-4 h-4" />
                          <span>Full Name</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 placeholder-gray-400'
                          }`}
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiMail className="w-4 h-4" />
                          <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 placeholder-gray-400'
                          }`}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4">
                    <div className={`pb-3 mb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Company Details
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Company-related information about the candidate
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Company Name Input */}
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiBriefcase className="w-4 h-4" />
                          <span>Company</span>
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 placeholder-gray-400'
                          }`}
                          placeholder="Enter company name"
                          defaultValue="MABICONS"
                        />
                      </div>

                      {/* Company Logo URL Input */}
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiImage className="w-4 h-4" />
                          <span>Company Logo URL</span>
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={formData.companyLogo}
                            onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                            className={`flex-1 p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 placeholder-gray-400'
                            }`}
                            placeholder="Enter logo URL"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, companyLogo: 'http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png' })}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              isDarkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            Reset
                          </button>
                        </div>
                        {/* Logo Preview */}
                        {formData.companyLogo && (
                          <div className="mt-2 p-2 border rounded-lg">
                            <img 
                              src={formData.companyLogo} 
                              alt="Company Logo" 
                              className="h-12 object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiMail className="w-4 h-4" />
                          <span>Support Email</span>
                        </label>
                        <input
                          type="email"
                          value={formData.supportEmail}
                          onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                          className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 placeholder-gray-400'
                          }`}
                          placeholder="Enter support email"
                          defaultValue="mabiconsjpr@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiImage className="w-4 h-4" />
                          <span>Header Background Color</span>
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={formData.headerColor}
                            onChange={(e) => setFormData({ ...formData, headerColor: e.target.value })}
                            className="w-12 h-12 rounded border p-1 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.headerColor}
                            onChange={(e) => setFormData({ ...formData, headerColor: e.target.value })}
                            className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 placeholder-gray-400'
                            }`}
                            placeholder="#e3e1ff"
                          />
                        </div>
                        {/* Header Preview with Logo */}
                        <div 
                          className="mt-2 p-4 rounded-lg border"
                          style={{ backgroundColor: formData.headerColor }}
                        >
                          <img 
                            src={formData.companyLogo} 
                            alt="Company Logo" 
                            className="h-10 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Position Input */}
                  <div className="space-y-2">
                    <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FiUserPlus className="w-4 h-4" />
                      <span>Position</span>
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 placeholder-gray-400'
                      }`}
                      placeholder="Enter position"
                      required
                    />
                  </div>

                  {/* Compensation & Joining Details */}
                  <div className="space-y-4">
                    <div className={`pb-3 mb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Compensation & Joining Details
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Details about the candidate's compensation and joining
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiDollarSign className="w-4 h-4" />
                          <span>CTC Package</span>
                        </label>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            CTC (in lakhs per annum)
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                              type="text"
                              name="ctc"
                              value={formData.ctc}
                              onChange={handleCTCChange}
                              placeholder="Ex: 5.00"
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">Lakhs</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiCalendar className="w-4 h-4" />
                          <span>Joining Date</span>
                        </label>
                        <input
                          type="date"
                          value={formData.joiningDate}
                          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                          className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 placeholder-gray-400'
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Benefits & Documents */}
                  <div className="space-y-4">
                    <div className={`pb-3 mb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Benefits & Documents
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Information about the candidate's benefits and required documents
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiDollarSign className="w-4 h-4" />
                          <span>Benefits</span>
                        </label>
                        <textarea
                          value={formData.benefits}
                          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                          className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 placeholder-gray-400'
                          }`}
                          placeholder="Enter benefits description"
                          rows="3"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          <FiPaperclip className="w-4 h-4" />
                          <span>Offer Letter (PDF)</span>
                        </label>
                        <FileUploadSection />
                      </div>
                    </div>
                  </div>

                  {/* Email Communication */}
                  <div className="space-y-4">
                    <div className={`pb-3 mb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Email Communication
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Choose and customize the email template to send
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <FiMail className="w-4 h-4" />
                        <span>Select Email Style</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(emailTemplates).map(([key, template]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedTemplate(key)}
                            className={`p-4 rounded-xl text-left transition-all ${
                              selectedTemplate === key
                                ? 'bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2'
                                : isDarkMode
                                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <div className="font-medium mb-1">{template.name}</div>
                            <div className={`text-xs ${
                              selectedTemplate === key
                                ? 'text-purple-100'
                                : isDarkMode
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                            }`}>
                              {getEmailSubject(key, formData)}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={handlePreview}
                          className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          <FiEye className="w-5 h-5 mr-2" />
                          Preview Email
                        </button>
                      </div>
                    </div>

                    {/* Custom Message Input */}
                    <div className="space-y-2">
                      <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <FiMail className="w-4 h-4" />
                        <span>Custom Message</span>
                      </label>
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-purple-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 placeholder-gray-400'
                        }`}
                        placeholder="Type your custom message here"
                        rows="4"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className={`sticky bottom-0 pt-4 pb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSending}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                          isSending 
                            ? 'bg-purple-400 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        } text-white`}
                      >
                        {isSending ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4" 
                                fill="none"
                              />
                              <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <FiSend className="w-5 h-5 mr-2" />
                            <span>Send Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Email Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900/75' : 'bg-black/50'}`}></div>
            </div>

            <div className={`relative inline-block w-full max-w-3xl p-6 overflow-hidden text-left align-bottom transition-all transform ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-xl shadow-2xl`}>
              {/* Preview Content */}
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Email Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 bg-white rounded-lg shadow-inner p-4" 
                   style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              </div>

              {/* Modal Footer Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePreviewAndSend}
                  disabled={isSending}
                  className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                    isSending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidates List */}
      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-hidden`}>
        {candidates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserPlus className="w-12 h-12 text-purple-600" />
            </div>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No candidates added yet
            </p>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Click the "Add New Candidate" button to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    CTC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Joining Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {candidates.map((candidate) => (
                  <tr 
                    key={candidate.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCTC(candidate.ctc)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.joiningDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        candidate.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {candidate.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StatusNotification status={sendStatus} />

      {showPreHiringModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900/75' : 'bg-black/50'}`}></div>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative inline-block w-full max-w-3xl overflow-hidden text-left align-bottom transition-all transform ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-2xl sm:my-8 sm:align-middle`}
            >
              {/* Header with MABICONS branding */}
              <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src="http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png" 
                      alt="MABICONS Logo" 
                      className="h-10 w-auto"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Pre-Hiring Email Template
                      </h3>
                      <p className="mt-1 text-indigo-100">
                        Send important pre-hiring information to candidates
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreHiringModal(false)}
                    className="p-2 rounded-full hover:bg-indigo-700/50 transition-colors text-white"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                <form onSubmit={handlePreHiringSubmit} className="space-y-6">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Pre-Hiring Email
                      </h3>
                      <button
                        onClick={() => setShowPreHiringModal(false)}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                          isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Send important pre-hiring information and document requirements to candidates
                    </p>
                  </div>

                  {/* Candidate Name Input */}
                  <div className="space-y-2">
                    <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FiUser className="w-4 h-4 text-indigo-600" />
                      <span>Candidate Name</span>
                    </label>
                    <input
                      type="text"
                      value={preHiringData.candidateName}
                      onChange={(e) => setPreHiringData({
                        ...preHiringData,
                        candidateName: e.target.value
                      })}
                      className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 placeholder-gray-400'
                      }`}
                      placeholder="Enter candidate's name"
                      required
                    />
                  </div>

                  {/* Position Input */}
                  <div className="space-y-2">
                    <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FiUserPlus className="w-4 h-4 text-indigo-600" />
                      <span>Position</span>
                    </label>
                    <input
                      type="text"
                      value={preHiringData.position}
                      onChange={(e) => setPreHiringData({
                        ...preHiringData,
                        position: e.target.value
                      })}
                      className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 placeholder-gray-400'
                      }`}
                      placeholder="Enter position"
                      required
                    />
                  </div>

                  {/* Candidate Email Input */}
                  <div className="space-y-2">
                    <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FiMail className="w-4 h-4 text-indigo-600" />
                      <span>Candidate Email</span>
                    </label>
                    <input
                      type="email"
                      value={preHiringData.candidateEmail}
                      onChange={(e) => setPreHiringData({
                        ...preHiringData,
                        candidateEmail: e.target.value
                      })}
                      className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 placeholder-gray-400'
                      }`}
                      placeholder="Enter candidate's email"
                      required
                    />
                  </div>

                  {/* Google Form Link */}
                  <div className="space-y-2">
                    <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FiLink className="w-4 h-4 text-indigo-600" />
                      <span>Google Form Link (Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={preHiringData.googleFormLink}
                      onChange={(e) => setPreHiringData({
                        ...preHiringData,
                        googleFormLink: e.target.value
                      })}
                      className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 placeholder-gray-400'
                      }`}
                      placeholder="Enter Google Form URL"
                    />
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="space-y-3">
                    <label className={`inline-flex items-center space-x-2 text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FiFileText className="w-4 h-4 text-indigo-600" />
                      <span>Required Documents</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {preHiringData.selectedDocuments.map((doc) => (
                        <label key={doc.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${
                          isDarkMode 
                            ? 'border-gray-700 hover:bg-gray-700/50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors cursor-pointer`}>
                          <input
                            type="checkbox"
                            checked={doc.selected}
                            onChange={(e) => {
                              const updatedDocs = preHiringData.selectedDocuments.map(d =>
                                d.id === doc.id ? { ...d, selected: e.target.checked } : d
                              );
                              setPreHiringData({
                                ...preHiringData,
                                selectedDocuments: updatedDocs
                              });
                            }}
                            className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {doc.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPreHiringModal(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                    >
                      {isSending ? (
                        <>
                          <span className="animate-spin">⌛</span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          <span>Send Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {showOfferLetterModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900/75' : 'bg-black/50'}`}></div>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative inline-block w-full max-w-3xl overflow-hidden text-left align-bottom transition-all transform ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-2xl sm:my-8 sm:align-middle`}
            >
              {/* Header with MABICONS branding */}
              <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src="http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png" 
                      alt="MABICONS Logo" 
                      className="h-10 w-auto"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Generate Offer Letter
                      </h3>
                      <p className="mt-1 text-indigo-100">
                        Create and customize offer letters for candidates
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOfferLetterModal(false)}
                    className="p-2 rounded-full hover:bg-indigo-700/50 transition-colors text-white"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                <OfferLetterGenerator 
                  isDarkMode={isDarkMode} 
                  onClose={() => setShowOfferLetterModal(false)}
                  companyLogo="http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png"
                  companyName="MABICONS"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingTab;


















