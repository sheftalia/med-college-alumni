import React from 'react';
import { PuffLoader } from 'react-spinners';
import '../styles/Loader.css';

const Loader = ({ loading }) => {
  if (!loading) return null; // <-- This will remove it completely
  return (
    <div className="loader-container show">
      <PuffLoader color="#3a3a3a" size={60} />
    </div>
  );
};

export default Loader;