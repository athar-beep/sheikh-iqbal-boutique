export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}

export function validatePakistaniPhone(phone: string): boolean {
  // Accepts: 03XXXXXXXXX (11 digits), +923XXXXXXXXX (13 chars), 923XXXXXXXXX
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^((\+92)|(92)|0)?3\d{9}$/.test(cleaned);
}

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
];

export const MAJOR_PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Hyderabad',
  'Gujrat',
  'Mardan',
  'Jhelum',
  'Rahim Yar Khan',
  'Sahiwal',
];
