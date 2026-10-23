

export const validateName = (fullName) => {

    if(!fullName.trim()) return "Name is required"

    return null;
    
} 

export const validateEmail = (email) => {
    if(!email) return "Email is required"
    if(!/^\S+@\S+\.\S+$/.test(email)) return "Please Enter a Valid Email"

    return null;
}

export const validatePassword = (password) => {

    if (password.length < 8) return "Password must be atleast 8 characters"

    if (!/[A-Z]/.test(password)) return "Password must contain uppercase character"
    
    if (!/[a-z]/.test(password)) return "Password must contain lowercase character"
    return null;
}
