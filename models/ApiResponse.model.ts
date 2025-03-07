/**
 * Type générique pour les réponses API
 * @template T - Le type de données attendu dans la réponse
 */
export type ApiResponse<T> = {
    data?: T;
    error?: Error;
};
