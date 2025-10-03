export const validation = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  },

  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  },

  username: (username) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  },

  name: (name, fieldName = 'Name') => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters`;
    return null;
  },

  age: (age) => {
    if (!age) return 'Age is required';
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return 'Age must be a number';
    if (ageNum < 1 || ageNum > 150) return 'Age must be between 1 and 150';
    return null;
  },

  contact: (contact) => {
    if (!contact) return 'Contact number is required';
    if (!/^\d+$/.test(contact)) return 'Contact must contain only numbers';
    if (contact.length < 10) return 'Contact must be at least 10 digits';
    return null;
  },

  required: (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  }
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return errors;
};
