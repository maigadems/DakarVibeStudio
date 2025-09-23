import React from 'react';
import { AlertTriangle, Mail, Phone, Globe } from 'lucide-react';

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center px-4 font-sans">
      <div className="max-w-2xl mx-auto text-center">
        {/* Netlify-style header */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <Globe className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">503</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Service Unavailable</h2>
          <p className="text-lg text-gray-600">This site is temporarily down for maintenance</p>
        </div>

        {/* Error details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8 text-left">
          <div className="flex items-start space-x-4 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hosting Issue Detected</h3>
              <p className="text-gray-700 mb-4">
                We're experiencing technical difficulties with our hosting infrastructure. 
                Our team has been notified and is working to resolve this issue as quickly as possible.
              </p>
              <div className="bg-white border border-gray-200 rounded p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Error Code:</strong> HOSTING_UNAVAILABLE
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Status:</strong> Under Investigation
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estimated Resolution:</strong> Working on it
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact admin section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Site Administrator</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">Email</p>
                <a 
                  href="mailto:maiga.projets@gmail.com"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  maiga.projets@gmail.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">Phone</p>
                <a 
                  href="tel:+221781932683"
                  className="text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  +221 78 193 26 83
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <p className="text-sm text-gray-600">
              If you're the site owner, please contact your administrator to resolve this hosting issue.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This page is generated automatically when the site is unavailable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;