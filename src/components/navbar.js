import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Make sure this path is correct
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebase'; // Import your Firestore database reference

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'doctor' or 'patient'
  const [userName, setUserName] = useState(''); // Store the user's name
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user role from Firestore
        const fetchUserRole = async () => {
          // Example: Assuming you have collections 'doctors' and 'patients'
          const doctorDoc = await getDoc(doc(db, 'doctors', currentUser.uid));
          const patientDoc = await getDoc(doc(db, 'patients', currentUser.uid));
          
          if (doctorDoc.exists()) {
            setUserRole('doctor');
            setUserName(doctorDoc.data().name); // Get doctor's name
          } else if (patientDoc.exists()) {
            setUserRole('patient');
            setUserName(patientDoc.data().name); // Get patient's name
          }
        };

        fetchUserRole();
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  // Function to get the first letter of the user's name
  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <nav className="navbar">
    <div className="navbar-inner">
      <h1 className="navbar-logo">DocMeet</h1>
      <ul className="navbar-links">
        {!user ? (
          <li>
            <Link to="/" className="navbar-link">Login</Link>
          </li>
        ) : (
          <>
            <li className="flex items-center space-x-2">
              <div className="profile-initials">
                {getInitials(userName)}
              </div>
              <span className="navbar-username">{userName}</span>
            </li>
            <li>
              <Link to={userRole === 'doctor' ? '/doc' : '/pat'} className="navbar-link">
                {userRole === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </li>
          </>
        )}
      </ul>
    </div>
  </nav>
  
  );
};

export default Navbar;