declare module "@vibrant/core" {
  import type { ImageData } from "@vibrant/image";
  import type { Quantizer } from "@vibrant/quantizer";
  import type { Generator } from "@vibrant/generator";
  import type { Filter, Palette, Swatch } from "@vibrant/color";

  class Stage<T> {
    protected pipeline: BasicPipeline;
    constructor(pipeline: BasicPipeline);
    names(): string[];
    has(name: string): boolean;
    get(name: string): T | undefined;
    register(name: string, stageFn: T): BasicPipeline;
  }

  interface ProcessResult {
    colors: Swatch[];
    palettes: {
      [name: string]: Palette;
    };
  }

  interface StageOptions {
    name: string;
    options?: unknown;
  }

  interface ProcessOptions {
    filters: string[];
    quantizer: string | StageOptions;
    generators: (string | StageOptions)[];
  }

  interface Pipeline {
    process(imageData: ImageData, opts: ProcessOptions): Promise<ProcessResult>;
  }

  export class BasicPipeline implements Pipeline {
    filter: Stage<Filter>;
    quantizer: Stage<Quantizer>;
    generator: Stage<Generator>;
    process(imageData: ImageData, opts: ProcessOptions): Promise<ProcessResult>;
  }
}
