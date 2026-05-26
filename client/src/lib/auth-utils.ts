export function isUnauthorizedError(error: Error): boolean {
  return error.message === "Não autorizado";
}
