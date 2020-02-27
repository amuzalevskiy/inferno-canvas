/**
 * Cache implementation based on [BasketsQueue](https://people.csail.mit.edu/shanir/publications/Baskets%20Queue.pdf)
 *
 * Items are divided into baskets. Basket has certain lifetime to grow.
 *
 * Older baskets are removed together with items after overflow
 *
 * Graveyard has a limited size
 */
import { ICache } from "./ICache";
export interface IBasketsCacheOptions<K, V> {
    basketLifetime?: number;
    maxBaskets?: number;
    onRemove?: (item: V, key: K) => void;
}
export declare class BasketsCache<K, V> implements ICache<K, V> {
    private _baskets;
    private _head;
    private _lifeTimer;
    private _onRemove;
    private _basketLifetime;
    private _maxBaskets;
    constructor(options: IBasketsCacheOptions<K, V>);
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): void;
    keys(): Array<K>;
    values(): Array<V>;
    delete(key: K): boolean | undefined;
    private _removeBasket;
    private _freezeTopBucket;
    private _removeLastBucket;
}
