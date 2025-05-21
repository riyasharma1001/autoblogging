// utils/session.js

/**
 * Save the OpenRouter API key in session storage.
 * @param {string} key - The API key to save.
 */
export function setAPIToken(key) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("OPENROUTER_API_KEY", key);
    }
  }
  
  /**
   * Retrieve the OpenRouter API key from session storage.
   * @returns {string|null} - The API key or null if not set.
   */
  export function getAPIToken() {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("OPENROUTER_API_KEY");
    }
    return null;
  }
  
  /**
   * Remove the OpenRouter API key from session storage.
   */
  export function removeAPIToken() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("OPENROUTER_API_KEY");
    }
  }
  