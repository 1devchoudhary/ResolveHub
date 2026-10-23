import { useState } from "react"
import { validateName, validateEmail, validateMobile, validatePassword } from "../utilities/validation";

export const useSignUp =  () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState({});

    
    const registerUser = (e) => {
        e.preventDefault();
        
        const newErrors = {};

        const nameError = validateName(fullName);
        if(nameError) newErrors.fullName = nameError;

        const emailError = validateEmail(email);
        if(emailError) newErrors.email = emailError;
        
        const mobileError = validateMobile(mobile);
        if(mobileError) newErrors.mobile = mobileError;


        const passwordError = validatePassword(password);
        if(passwordError) newErrors.password = passwordError;

        if (!agreeTerms) newErrors.agreeTerms = "You must agree to the terms";

        setError(newErrors);


        
    }

    return {
    fullName, setFullName,
    email, setEmail,
    mobile, setMobile,
    password, setPassword,
    showPassword, setShowPassword,
    agreeTerms, setAgreeTerms,
    error, setError,
    registerUser}
}