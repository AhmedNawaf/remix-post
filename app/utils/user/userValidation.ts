export function validateName(name: string) {
  if (name.length === 0) {
    return 'Name is required';
  }

  if (name.length < 3) {
    return 'Name must be at least 3 characters';
  }

  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }
}

export function validateEmail(email: string) {
  const service = email.slice(email.indexOf('@') + 1, email.lastIndexOf('.'));
  const acceptedServices = ['gmail', 'hotmail', 'outlook', 'yahoo'];
  if (email.length === 0) {
    return 'Email is required';
  }

  if (email.length > 50) {
    return 'Email must be less than 50 characters';
  }

  if (!email.includes('@') || !email.includes('.')) {
    return 'Email must be a valid email address';
  }

  if (!acceptedServices.includes(service)) {
    return 'Email must be a valid email address';
  }
}

export function validatePassword(password: string) {
  if (password.length === 0) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (password.length > 50) {
    return 'Password must be less than 50 characters';
  }
}
