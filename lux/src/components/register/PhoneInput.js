// PhoneInput.js
import React from 'react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const PhoneInputComponent = ({ value, onChange }) => {
  return (
    <PhoneInput
      defaultCountry="US"
      placeholder="Enter Your Phone Number"
      value={value}
      onChange={onChange}
      id= "number"
      label= "Phone"
      type= "tel"
      required
    />
  );
};

export default PhoneInputComponent;
