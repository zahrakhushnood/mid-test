
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [doctorDetails, setDoctorDetails] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeSection, setActiveSection] = useState('details');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [available, setAvailable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(''); // Error state
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchDoctorDetails(userId);
      fetchSchedule(userId);
      fetchAppointments(userId);
    }
  }, [userId]);

  const fetchDoctorDetails = async (id) => {
    try {
      const doctorDocRef = doc(db, 'doctors', id);
      const doctorDocSnapshot = await getDoc(doctorDocRef);
      
      if (doctorDocSnapshot.exists()) {
        const data = doctorDocSnapshot.data();
        setDoctorDetails(data);
        setName(data.name || '');
        setSpecialization(data.specialization || '');
        setContactInfo(data.contactInfo || '');
      } else {
        setError("No such doctor document!");
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      setError("Failed to fetch doctor details. Please try again.");
    }
  };

  const fetchSchedule = (id) => {
    const scheduleRef = collection(db, 'doctors', id, 'schedule');
    const q = query(scheduleRef);
    
    onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedule(slots);
    }, (error) => {
      console.error("Error fetching schedule:", error);
      setError("Failed to fetch schedule. Please try again.");
    });
  };

  const fetchAppointments = (id) => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('doctorId', '==', id));
    
    onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsData);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments. Please try again.");
    });
  };

  const handleSaveSlot = async () => {
    if (!startTime || !endTime) {
      setError("Please fill in all fields.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError("Start time must be before end time.");
      return;
    }

    const slotData = {
      startTime: startTime,
      endTime: endTime,
      available,
    };

    try {
      await setDoc(doc(db, 'doctors', userId, 'schedule', `${Date.now()}`), slotData);
      setStartTime('');
      setEndTime('');
      setAvailable(false);
      setError(''); // Clear error on success
    } catch (error) {
      console.error("Error saving slot:", error);
      setError("Failed to save slot. Please try again.");
    }
  };

  const handleSaveDetails = async () => {
    if (!name || !specialization || !contactInfo) {
      setError("Please fill in all fields.");
      return;
    }

    const doctorDocRef = doc(db, 'doctors', userId);
    try {
      await setDoc(doctorDocRef, { name, specialization, contactInfo }, { merge: true });
      setDoctorDetails({
        ...doctorDetails,
        name,
        specialization,
        contactInfo
      });
      setError(''); // Clear error on success
      alert("Doctor details saved successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving details:", error);
      setError("Failed to save doctor details. Please try again.");
    }
  };

  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp.seconds * 1000); // Firestore timestamp
      return date.toLocaleString(); // Format as needed
    }
    return 'Invalid Date';
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-teal-600 mb-6">Doctor Dashboard</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>} {/* Display error message */}
      <nav className="mb-8">
        <ul className="flex space-x-8">
          <li 
            onClick={() => setActiveSection('details')} 
            className={`cursor-pointer hover:underline ${activeSection === 'details' ? 'font-semibold text-teal-600 border-b-2 border-teal-600' : 'text-gray-700'}`}
          >
            Details
          </li>
          <li 
            onClick={() => setActiveSection('schedule')} 
            className={`cursor-pointer hover:underline ${activeSection === 'schedule' ? 'font-semibold text-teal-600 border-b-2 border-teal-600' : 'text-gray-700'}`}
          >
            Schedule
          </li>
          <li 
            onClick={() => setActiveSection('appointments')} 
            className={`cursor-pointer hover:underline ${activeSection === 'appointments' ? 'font-semibold text-teal-600 border-b-2 border-teal-600' : 'text-gray-700'}`}
          >
            Appointments
          </li>
        </ul>
      </nav>

      {activeSection === 'details' && (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-teal-500 mb-4">Your Details</h2>
          {isEditing ? (
            <>
              <label className="block mb-3">
                <span className="text-gray-700">Name:</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </label>
              <label className="block mb-3">
                <span className="text-gray-700">Specialization:</span>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </label>
              <label className="block mb-3">
                <span className="text-gray-700">Contact Info:</span>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </label>
              <button 
                onClick={handleSaveDetails} 
                className="w-full py-2 mt-4 font-semibold text-white bg-teal-500 rounded-md hover:bg-teal-600 transition duration-200 shadow-md"
              >
                Save Details
              </button>
            </>
          ) : (
            <>
              <p className="mb-2 text-gray-700"><strong>Name:</strong> {doctorDetails.name || 'N/A'}</p>
              <p className="mb-2 text-gray-700"><strong>Specialization:</strong> {doctorDetails.specialization || 'N/A'}</p>
              <p className="mb-2 text-gray-700"><strong>Contact Info:</strong> {doctorDetails.contactInfo || 'N/A'}</p>
              <button 
                onClick={() => setIsEditing(true)} 
                className="mt-4 p-2 font-semibold text-white bg-teal-500 rounded-md hover:bg-teal-600 transition duration-200 shadow-md"
              >
                Edit Details
              </button>
            </>
          )}
        </div>
      )}

      {activeSection === 'schedule' && (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-teal-500 mb-4">Schedule Availability</h3>
          <label className="block mb-3">
            <span className="text-gray-700">Start Time:</span>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <label className="block mb-3">
            <span className="text-gray-700">End Time:</span>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <label className="block mb-3">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="mr-2"
            />
            Available
          </label>
          <button 
            onClick={handleSaveSlot} 
            className="w-full py-2 mt-4 font-semibold text-white bg-teal-500 rounded-md hover:bg-teal-600 transition duration-200 shadow-md"
          >
            Save Slot
          </button>

          <h3 className="text-xl font-semibold mt-6">Your Availability Slots</h3>
          <ul className="space-y-2 mt-2">
            {schedule.length > 0 ? (
              schedule.map(slot => (
                <li key={slot.id} className="p-4 border border-gray-200 rounded-md shadow-sm">
                  <p><strong>Start:</strong> {new Date(slot.startTime).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(slot.endTime).toLocaleString()}</p>
                  <p><strong>Available:</strong> {slot.available ? 'Yes' : 'No'}</p>
                </li>
              ))
            ) : (
              <li className="p-4 text-gray-500">No availability slots found.</li>
            )}
          </ul>
        </div>
      )}

      {activeSection === 'appointments' && (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-teal-500 mb-4">Your Appointments</h3>
          {appointments.length > 0 ? (
            <ul className="space-y-3">
              {appointments.map(appointment => (
                <li key={appointment.id} className="p-4 border border-gray-200 rounded-md shadow-sm">
                  <p className="text-lg font-semibold text-teal-600">{appointment.patientName}</p>
                  <p className="text-gray-600">
                    <strong>Date:</strong> {formatDate(appointment.date)}
                  </p>
                  {appointment.notes && (
                    <p className="italic text-gray-500"><strong>Notes:</strong> {appointment.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No appointments found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
