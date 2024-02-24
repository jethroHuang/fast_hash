/* tslint:disable */

/* eslint-disable */
/**
 * @param {string} msg
 */
export function greet(msg: string): void;

/**
 */
export function set_panic_hook(): void;

/**
 */
export class Md5Hasher {
    free(): void;

    /**
     * @returns {Md5Hasher}
     */
    static new(): Md5Hasher;

    /**
     * @param {Uint8Array} data
     */
    update(data: Uint8Array): void;

    /**
     * @returns {string}
     */
    digest(): string;
}

/**
 */
export class Sha1Hasher {
    free(): void;

    /**
     * @returns {Sha1Hasher}
     */
    static new(): Sha1Hasher;

    /**
     * @param {Uint8Array} data
     */
    update(data: Uint8Array): void;

    /**
     * @returns {string}
     */
    digest(): string;
}

/**
 */
export class Sha256Hasher {
    free(): void;

    /**
     * @returns {Sha256Hasher}
     */
    static new(): Sha256Hasher;

    /**
     * @param {Uint8Array} data
     */
    update(data: Uint8Array): void;

    /**
     * @returns {string}
     */
    digest(): string;
}

/**
 */
export class Sha512Hasher {
    free(): void;

    /**
     * @returns {Sha512Hasher}
     */
    static new(): Sha512Hasher;

    /**
     * @param {Uint8Array} data
     */
    update(data: Uint8Array): void;

    /**
     * Returns the final hash result as a string of hexadecimal characters.
     * @returns {string}
     */
    digest(): string;
}
