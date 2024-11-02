// src/pages/PatientDashboard.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [patientDetails, setPatientDetails] = useState({});
  const [name, setName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [userId, setUserId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchPatientDetails(user.uid);
        await fetchDoctors();
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchPatientDetails = async (id) => {
    const patientDocRef = doc(db, 'patients', id);
    const patientDocSnapshot = await getDoc(patientDocRef);

    if (patientDocSnapshot.exists()) {
      const data = patientDocSnapshot.data();
      setPatientDetails(data);
      setName(data.name || '');
      setContactDetails(data.contactDetails || '');
      setMedicalHistory(data.medicalHistory || '');
    } else {
      console.log("No such document!");
    }
  };

  const fetchDoctors = async () => {
    const doctorsRef = collection(db, 'doctors');
    const doctorSnapshot = await getDocs(doctorsRef);
    const doctorList = doctorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDoctors(doctorList);
  };

  const handleSaveDetails = async () => {
    const patientDocRef = doc(db, 'patients', userId);
    await setDoc(patientDocRef, { name, contactDetails, medicalHistory }, { merge: true });
    alert("Patient details saved successfully.");
    setIsEditing(false); // Exit editing mode after saving
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !dateTime) {
      alert("Please select a doctor and choose a date/time.");
      return;
    }

    try {
      const appointmentRef = collection(db, 'appointments');
      await addDoc(appointmentRef, {
        doctorId: selectedDoctorId,
        patientId: userId,
        dateTime: new Date(dateTime),
        notes,
      });
      alert('Appointment booked successfully!');
      clearAppointmentForm();
    } catch (error) {
      console.error("Error booking appointment: ", error);
      alert("Error booking appointment: " + error.message);
    }
  };

  const clearAppointmentForm = () => {
    setSelectedDoctorId('');
    setDateTime('');
    setNotes('');
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
<div className="dashboard-container">
  <h1 className="dashboard-header">Patient Dashboard</h1>

  {/* Display patient details */}
  <div className="details-card">
    <h2>Your Details</h2>
    {isEditing ? (
      <>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Contact Details:
          <input
            type="text"
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
          />
        </label>
        <label>
          Medical History:
          <textarea
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
          />
        </label>
        <button
          onClick={handleSaveDetails}
          className="button-primary"
        >
          Save Details
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="button-secondary"
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Contact Details:</strong> {contactDetails}</p>
        <p><strong>Medical History:</strong> {medicalHistory}</p>
        <button
          onClick={() => setIsEditing(true)}
          className="button-primary"
        >
          Edit Details
        </button>
      </>
    )}
  </div>

  {/* Button to toggle appointment form */}
  <button
    onClick={() => setShowAppointment(!showAppointment)}
    className="button-primary mb-4"
  >
    {showAppointment ? "Hide Appointment Form" : "Book an Appointment"}
  </button>

  {/* Display appointment form */}
  {showAppointment && (
    <div className="appointment-form">
      <h2>Book an Appointment</h2>
      <form onSubmit={handleBookAppointment}>
        <label>
          Select Doctor:
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} ({doctor.specialization})
              </option>
            ))}
          </select>
        </label>
        <label>
          Appointment Date & Time:
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </label>
        <label>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="button-primary"
        >
          Book Appointment
        </button>
      </form>
    </div>
  )}

  {/* Optional Logout Button */}
  {/* <button
    onClick={handleLogout}
    className="mt-4 py-2 px-4 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
  >
    Logout
  </button> */}
</div>

  );
};

export default PatientDashboard;