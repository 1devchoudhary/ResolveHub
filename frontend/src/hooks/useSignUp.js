import { useState } from "react"
import { validateName, validateEmail, validatePassword } from "../utilities/validation";

export const useSignUp =  () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
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

        const passwordError = validatePassword(password);
        if(passwordError) newErrors.password = passwordError;

        if (!agreeTerms) newErrors.agreeTerms = "You must agree to the terms";

        setError(newErrors);


        
    }

    return {
    fullName, setFullName,
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    agreeTerms, setAgreeTerms,
    error, setError,
    registerUser}
}