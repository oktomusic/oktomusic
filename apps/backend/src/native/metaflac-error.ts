export class MetaflacError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message)
    this.name = "MetaflacError"
  }
}
