import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientSignup } from './service/api';

const ClientSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    corporateAddress: '',
    contactNumber: '',
    gstNumber: '',
    panNumber: '',
    numberOfCompanies: '',
    authorizedSignatory: {
      name: '',
      email: '',
      contact: ''
    },
    ownerDirectorDetails: [
      {
        name: '',
        email: '',
        contact: ''
      }
    ],
    website: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'panNumber') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    } else if (name === 'pinCode') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    } else if (name === 'contactNumber') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  const handleDirectorChange = (index, field, value) => {
    let processedValue = value;
    if (field === 'contact') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData(prev => ({
      ...prev,
      ownerDirectorDetails: prev.ownerDirectorDetails.map((director, i) => 
        i === index ? { ...director, [field]: processedValue } : director
      )
    }));
  };

  const addDirector = () => {
    setFormData(prev => ({
      ...prev,
      ownerDirectorDetails: [
        ...prev.ownerDirectorDetails,
        { name: '', email: '', contact: '' }
      ]
    }));
  };

  const removeDirector = (index) => {
    setFormData(prev => ({
      ...prev,
      ownerDirectorDetails: prev.ownerDirectorDetails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await clientSignup(formData);
      console.log('Signup successful:', response);
      navigate('/login'); // or wherever you want to redirect after signup
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Corporate Address</label>
                <textarea
                  name="corporateAddress"
                  value={formData.corporateAddress}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Authorized Signatory */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Authorized Signatory</h3>
              {formData.ownerDirectorDetails.map((director, index) => (
                <div key={index} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name={`ownerDirectorDetails.${index}.name`}
                      value={director.name}
                      onChange={(e) => handleDirectorChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name={`ownerDirectorDetails.${index}.email`}
                      value={director.email}
                      onChange={(e) => handleDirectorChange(index, 'email', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <input
                      type="tel"
                      name={`ownerDirectorDetails.${index}.contact`}
                      value={director.contact}
                      onChange={(e) => handleDirectorChange(index, 'contact', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addDirector} className="mt-2 text-sm text-gray-500 hover:text-indigo-500">
                Add Director
              </button>
              <button type="button" onClick={removeDirector} className="mt-2 text-sm text-gray-500 hover:text-indigo-500">
                Remove Director
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientSignup; 