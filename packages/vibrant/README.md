# @oktomusic/vibrant

It uses the core modules from [Vibrant](https://vibrant.dev) but delegates image processing to [Sharp](https://sharp.pixelplumbing.com) to reduce dependencies and improve performance.

This module has been prototyped by using LLMs provided by GitHub Copilot and unlike the rest of the Oktomusic codebase is under MIT license like the Vibrant project.

You may notice a TypeScript redeclaration of the `BasicPipeline` class, this is apparently caused by a export problem in Vibrant's core package.
