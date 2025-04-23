import { toast } from 'react-toastify';

export const showSuccess = (message, options = {}) => {
  toast.success(message, options);
};

export const showError = (err, options = {}) => {
  const message =
    err?.response?.data?.message ||
    err?.message ||
    (typeof err === "string" ? err : JSON.stringify(err, null, 2)) ||
    "Errore sconosciuto";

  toast.error(message, options);
};
