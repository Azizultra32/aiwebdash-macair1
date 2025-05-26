import { useEffect, useState } from 'react';
import { getCountryCallingCode } from 'libphonenumber-js';

export function useDetectCountryCode(onDetect?: (code: string) => void) {
  const [countryCode, setCountryCode] = useState('');

  useEffect(() => {
    const detectCountryCode = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const detected = `+${getCountryCallingCode(data.country_code)}`;
        setCountryCode(detected);
        onDetect?.(detected);
      } catch (error) {
        console.error('Error detecting country code:', error);
      }
    };

    detectCountryCode();
  }, [onDetect]);

  return countryCode;
}
