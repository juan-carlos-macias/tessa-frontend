const FIREBASE_ERRORS: Record<string, string> = {
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/user-not-found": "No se encontró una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/network-request-failed": "Error de red. Verifica tu conexión.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
    "auth/email-already-in-use": "Este correo ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email": "El correo electrónico no es válido.",
  };

export default FIREBASE_ERRORS;
