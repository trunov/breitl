export const isEmail = (value?: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const passwordValid = (value: string) => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
export const required = (value?: string | number | null) => value !== undefined && value !== null && String(value).trim() !== '';
