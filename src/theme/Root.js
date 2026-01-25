import React from 'react';
import AiHelper from '../components/AiHelper';

export default function Root({children}) {
  return (
    <>
      {children}
      <AiHelper />
    </>
  );
}
