// import React, { useState } from 'react';
// import { auth, db } from '../config/firebase';
// import { createUserWithEmailAndPassword } from "firebase/auth"; 
// import { doc, setDoc } from "firebase/firestore"; 
// import { useNavigate } from 'react-router-dom'; // Import useNavigate

// const Register = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [userType, setUserType] = useState('patient');
//   const [isLoading, setIsLoading] = useState(false); // Loading state
//   const navigate = useNavigate(); // Initialize useNavigate

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setIsLoading(true); // Set loading state to true
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Store user information in Firestore
//       await setDoc(doc(db, userType === 'doctor' ? 'doctors' : 'patients', user.uid), {
//         name,
//         email,
//         userType,
//       });

//       alert(Registration successful as a ${userType}!);
      
//       // Navigate to the appropriate dashboard based on user type
//       navigate(userType === 'doctor' ? '/doc' : '/pat'); 
      
//     } catch (error) {
//       // Handle specific error messages
//       switch (error.code) {
//         case 'auth/email-already-in-use':
//           alert('This email address is already in use. Please use a different email.');
//           break;
//         case 'auth/invalid-email':
//           alert('The email address is not valid.');
//           break;
//         case 'auth/weak-password':
//           alert('The password is too weak. It should be at least 6 characters long.');
//           break;
//         default:
//           alert('Error: ' + error.message);
//       }
//     } finally {
//       setIsLoading(false); // Reset loading state
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold text-center text-gray-700">
//           Register as a {userType === 'doctor' ? 'Doctor' : 'Patient'}
//         </h2>
//         <form onSubmit={handleRegister} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-600">Name:</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               disabled={isLoading} // Disable input when loading
//               className={w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-600">Email:</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               disabled={isLoading} // Disable input when loading
//               className={w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-600">Password:</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               disabled={isLoading} // Disable input when loading
//               className={w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-600">Select User Type:</label>
//             <select
//               value={userType}
//               onChange={(e) => setUserType(e.target.value)}
//               disabled={isLoading} // Disable input when loading
//               className={w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}}
//             >
//               <option value="patient">Patient</option>
//               <option value="doctor">Doctor</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading} // Disable button when loading
//             className={w-full py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}}
//           >
//             {isLoading ? 'Registering...' : 'Register'}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-600 mt-4">
//           Already have an account? 
//           <button 
//             onClick={() => navigate('/')} 
//             className="text-blue-500 hover:underline ml-1"
//           >
//             Sign In
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user information in Firestore
      await setDoc(doc(db, userType === 'doctor' ? 'doctors' : 'patients', user.uid), {
        name,
        email,
        userType,
      });

      alert(`Registration successful as a ${userType}!`);

      // Navigate to the appropriate dashboard based on user type
      navigate(userType === 'doctor' ? '/doc' : '/pat');
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('This email address is already in use. Please use a different email.');
          break;
        case 'auth/invalid-email':
          alert('The email address is not valid.');
          break;
        case 'auth/weak-password':
          alert('The password is too weak. It should be at least 6 characters long.');
          break;
        default:
          alert('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="register-container">
  <div className="register-card">
    <h2 className="register-title">
      Register as a {userType === 'doctor' ? 'Doctor' : 'Patient'}
    </h2>
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="register-label">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          className={`register-input ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="register-label">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className={`register-input ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="register-label">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className={`register-input ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="register-label">Select User Type:</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          disabled={isLoading}
          className={`register-select ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`register-button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>

    <p className="register-text">
      Already have an account?
      <button
        onClick={() => navigate('/')}
        className="register-link ml-1"
      >
        Sign In
      </button>
    </p>
  </div>
</div>

  );
};

export default Register;
