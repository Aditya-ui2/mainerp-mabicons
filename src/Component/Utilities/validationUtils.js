export const validatePhone = (phone) => {
  if (!phone) return true; // Let required validation handle empty fields if necessary

  const cleanPhone = String(phone).replace(/\D/g, '');
  const phoneDigits = cleanPhone.startsWith('91') && cleanPhone.length === 12 
    ? cleanPhone.slice(2) 
    : (cleanPhone.startsWith('0') && cleanPhone.length === 11 ? cleanPhone.slice(1) : cleanPhone);
  
  return phoneDigits.length === 10;
};
