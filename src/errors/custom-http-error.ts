export class CustomHttpError extends Error {
  #code: string | undefined;
  httpCode: number;

  constructor(httpCode: number, msg: string, code?: string | undefined) {
    super(msg);
    this.httpCode = httpCode;
    this.#code = code;
  }

  jsonBodyResponse() {
    return {
      msg: this.message,
      code: this.#code,
    };
  }
}
