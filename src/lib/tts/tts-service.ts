export interface TTSService {
  synthesize(
    text: string,
    voice?: string,
    signal?: AbortSignal
  ): Promise<ArrayBuffer>
}
