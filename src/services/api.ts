/**
 * URL del Web App de Google Apps Script (Backend)
 */
const API_URL = "https://script.google.com/macros/s/AKfycbynd-ZjJ36vdyrZ-NLirozXNAvowf8QIeEolSRtVM57ndAZmcfGMcoZKzN4-VEG5-D9/exec";

/**
 * Función centralizada para llamadas al Backend
 */
async function callGAS(data: any) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error de conexión con el servidor",
    };
  }
}

export const api = {
  login: (u: string, p: string) => callGAS({ action: "login", u, p }),
  register: (userData: any) => callGAS({ action: "register", ...userData }),

  getInitialData: (userId: string, requestingUser?: string) =>
    callGAS({ action: "get_initial_data", userId, requestingUser }),

  savePredictions: (userId: string, predictions: any, freeze: boolean = false) =>
    callGAS({ action: "save_predictions", userId, predictions, freeze }),

  // === PUNTOS CLAVE - Backend como Single Source of Truth ===
  getAllScores: () => callGAS({ action: "getAllScores" }),           // ← Usar este para Leaderboard
  getUserScore: (userId: string) => callGAS({ action: "getUserScore", userId }),
  
  downloadUserProgress: (userId: string) =>
    callGAS({ action: "downloadUserProgress", userId }),

  recalculateScores: (adminUsername: string, matchIds?: number[]) =>
    callGAS({ action: "recalculateScores", adminUsername, matchIds }),

  // Admin
  adminGetUsers: (username: string) => callGAS({ action: "admin_get_users", username }),
  adminUpdateUser: (username: string, targetId: string, updates: any) =>
    callGAS({ action: "admin_update_user", username, targetId, updates }),
  adminSaveRealResults: (username: string, results: any) =>
    callGAS({ action: "admin_save_real_results", username, results }),

  // Config
  getConfigSistema: () => callGAS({ action: "getConfigSistema" }),
  updateConfigSistema: (username: string, config: any) =>
    callGAS({ action: "updateConfigSistema", username, ...config }),
};
