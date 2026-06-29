 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { create } from "zustand";
import { api } from "@/lib/api";

const getErrorMessage = (err, defaultMessage) => {
  if (_optionalChain([err, 'optionalAccess', _ => _.errors]) && Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.join(", ");
  }
  return _optionalChain([err, 'optionalAccess', _2 => _2.message]) || defaultMessage;
};
































export const useAuthStore = create((set) => {
  // Try to load initial state from localStorage on the client side
  let initialUser = null;
  let initialToken = null;

  if (typeof window !== "undefined") {
    const rawUser = localStorage.getItem("user");
    if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
      try {
        initialUser = JSON.parse(rawUser);
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
    initialToken = localStorage.getItem("accessToken");
  }

  return {
    user: initialUser,
    accessToken: initialToken,
    loading: false,
    initialized: false,
    error: null,
    otpSent: false,
    phoneForOtp: null,

    setAuth: (user, accessToken) => {
      if (typeof window !== "undefined") {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");

        if (accessToken) localStorage.setItem("accessToken", accessToken);
        else localStorage.removeItem("accessToken");
      }
      set({ user, accessToken });
    },

    sendOtp: async (phone) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post("/auth/otp/send", { phone });
        if (response.success) {
          set({ otpSent: true, phoneForOtp: phone, loading: false });
          return true;
        }
        throw new Error(response.message || "Failed to send OTP");
      } catch (err) {
        set({ error: getErrorMessage(err, "Something went wrong"), loading: false });
        return false;
      }
    },

    verifyOtp: async (phone, otp) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post("/auth/otp/verify", { phone, otp });
        if (response.success && response.data) {
          const { user, accessToken } = response.data;
          
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("accessToken", accessToken);
          }
          
          set({ user, accessToken, otpSent: false, phoneForOtp: null, loading: false });
          return true;
        }
        throw new Error(response.message || "Verification failed");
      } catch (err) {
        set({ error: getErrorMessage(err, "Invalid OTP code"), loading: false });
        return false;
      }
    },

    loginWithPassword: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post("/auth/login", { email, password });
        if (response.success && response.data) {
          const { user, accessToken } = response.data;
          
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("accessToken", accessToken);
          }
          
          set({ user, accessToken, loading: false });
          return true;
        }
        throw new Error(response.message || "Login failed");
      } catch (err) {
        set({ error: getErrorMessage(err, "Invalid email or password"), loading: false });
        return false;
      }
    },

    registerCustomer: async (name, email, phone, password) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post("/auth/register", { name, email, phone, password });
        if (response.success && response.data) {
          const { user, accessToken } = response.data;
          
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("accessToken", accessToken);
          }
          
          set({ user, accessToken, loading: false });
          return true;
        }
        throw new Error(response.message || "Registration failed");
      } catch (err) {
        set({ error: getErrorMessage(err, "Failed to register account"), loading: false });
        return false;
      }
    },

    registerBusiness: async (name, email, phone, password, businessName, address, category, bookingUrl) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post("/auth/register-business", { name, email, phone, password, businessName, address, category, bookingUrl });
        if (response.success && response.data) {
          const { user, accessToken } = response.data;
          
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("accessToken", accessToken);
          }
          
          set({ user, accessToken, loading: false });
          return true;
        }
        set({ loading: false });
        return response.success;
      } catch (err) {
        set({ error: getErrorMessage(err, "Failed to register business"), loading: false });
        return false;
      }
    },

    loginWithGoogle: async (idToken, phone) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post("/auth/google", { idToken, phone });
        if (response.success && response.data) {
          if (response.data.newUser) {
            set({ loading: false });
            return {
              newUser: true,
              email: response.data.email,
              name: response.data.name,
            };
          }

          const { user, accessToken } = response.data;
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("accessToken", accessToken);
          }
          set({ user, accessToken, loading: false });
          return true;
        }
        throw new Error(response.message || "Google login failed");
      } catch (err) {
        set({ error: getErrorMessage(err, "Failed to authenticate with Google"), loading: false });
        return false;
      }
    },

    logout: async () => {
      set({ loading: true });
      try {
        await api.post("/auth/logout");
      } catch (err) {
        console.error("Logout API call failed", err);
      } finally {
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
        }
        set({ user: null, accessToken: null, otpSent: false, phoneForOtp: null, loading: false });
      }
    },

    checkSession: async () => {
      set({ loading: true });
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) {
          set({ user: null, accessToken: null, loading: false, initialized: true });
          return;
        }
        const response = await api.get("/auth/me");
        if (response.success && response.data) {
          const user = response.data;
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
          }
          set({ user, loading: false, initialized: true });
        } else {
          throw new Error("Invalid session");
        }
      } catch (err) {
        // Clear auth if /me returns error (meaning session expired)
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
        }
        set({ user: null, accessToken: null, loading: false, initialized: true });
      }
    },

    clearError: () => set({ error: null }),
  };
});
