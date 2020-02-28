/**
 * Copyright (c) 2016-present, Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @source https://github.com/necolas/react-native-web/blob/b9172ceb8e0779c41e17210e56da36bdcc3e438b/packages/react-native-web/src/modules/ImageLoader/index.js
 * @licence https://github.com/necolas/react-native-web/blob/b9172ceb8e0779c41e17210e56da36bdcc3e438b/LICENSE
 */
export declare const imageLoader: {
    abort(requestId: number): void;
    load(uri: string, onLoad: (img: HTMLImageElement) => void, onError: (e: string | Event) => void): number;
    prefetch(uri: string): Promise<HTMLImageElement>;
};
