
/**
 * URL del Web App de Google Apps Script.
 */
const API_URL = "https://script.google.com/macros/s/AKfycbwbaSnRoqEd-5YhrvDBqHR736IA0voyWSdwSQ9jXHUjRICka99C_8H5yjd7nLLCMwhS/exec";

/**
 * Función centralizada para llamadas a la API de Google Apps Script.
 * Se utiliza 'text/plain' para evitar problemas de preflight CORS.
 */
async function callGAS(data: any) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Servidor no disponible (${response.status})`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Error Detail:", error);
    
    let message = "Error de conexión";
    if (error instanceof TypeError && error.message.includes('fetch')) {
      message = "Error de Red: El servidor no respondió o la petición fue bloqueada.";
    } else if (error instanceof Error) {
      message = error.message;
    }

    return { 
      success: false, 
      message 
    };
  }
}

export const api = {
  login: (u: string, p: string) => 
    callGAS({ action: "login", u, p }),
  
  register: (userData: { nombre: string, apellido: string, email: string, username: string, password: string }) =>
    callGAS({ action: "register", ...userData }),
    
  getInitialData: (userId: string) => 
    callGAS({ action: "get_initial_data", userId }),
    
  savePredictions: (userId: string, username: string, predictions: any, freeze: boolean = false) => 
    callGAS({ action: "save_predictions", userId, username, predictions, freeze }),
    
  adminGetUsers: (username: string) => 
    callGAS({ action: "admin_get_users", username }),
    
  adminUpdateUser: (username: string, targetId: string, updates: any) => 
    callGAS({ action: "admin_update_user", username, targetId, updates }),

  adminSaveRealResults: (username: string, results: any) => 
    callGAS({ action: "admin_save_real_results", username, results }),

  adminGetLogs: (username: string) =>
    callGAS({ action: "admin_get_logs", username }),

  // Ajustado para coincidir con el documento técnico del backend
  adminUpdateTimeConfig: (username: string, config: { modoTiempo: 'PRESENTE' | 'SIMULACION', fechaSimulacion: string | null }) =>
    callGAS({ action: "updateConfigSistema", username, ...config }),

  adminGetTimeConfig: (username: string) =>
    callGAS({ action: "getConfigSistema", username })
};
