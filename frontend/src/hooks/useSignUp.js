import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  validateName,
  validateEmail,
  validateMobile,
  validatePassword,
  normalizeMobile,
} from '../utilities/validation';

// The API names a few fields differently from this form
const SERVER_FIELD_TO_FORM = { name: 'fullName', agreeToTerms: 'agreeTerms' };

export const useSignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side checks give instant feedback; the server validates again either way
    const newErrors = {};

    const nameError = validateName(fullName);
    if (nameError) newErrors.fullName = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const mobileError = validateMobile(mobile);
    if (mobileError) newErrors.mobile = mobileError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';

    setError(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        name: fullName.trim(),
        email: email.trim(),
        mobile: normalizeMobile(mobile),
        password,
        agreeToTerms: agreeTerms,
      });
      navigate('/app', { replace: true });
    } catch (err) {
      // Show the server's per-field messages (e.g. "This email is already registered") inline
      const fieldErrors = Object.fromEntries(
        Object.entries(err.errors ?? {}).map(([field, message]) => [
          SERVER_FIELD_TO_FORM[field] ?? field,
          message,
        ]),
      );
      setError(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(err.message);
      setSubmitting(false);
    }
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    mobile,
    setMobile,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    agreeTerms,
    setAgreeTerms,
    error,
    setError,
    formError,
    submitting,
    registerUser,
  };
};
