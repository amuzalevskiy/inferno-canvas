export declare class SortedArray<T> {
    protected items: T[];
    protected key: string | null;
    protected cmp: (left: T, right: T) => number;
    constructor(arg?: string | ((left: T, right: T) => number));
    get length(): number;
    get(index: number): T;
    insert(elements: T | T[], ...args: T[]): SortedArray<T>;
    remove(index: number, deleteCount?: number): SortedArray<T>;
    removeByValue(value: T | T[]): SortedArray<T>;
    search(value: any): number;
    has(value: any): boolean;
    eq(value: any): SortedArray<T>;
    gt(value: any): SortedArray<T>;
    lt(value: any): SortedArray<T>;
    gte(value: any): SortedArray<T>;
    lte(value: any): SortedArray<T>;
    clear(): SortedArray<T>;
    toArray(): T[];
    toString(): string;
    private getEqual;
    greaterThan(value: any, orEqual?: boolean): number;
    lessThan(value: any, orEqual?: boolean): number;
    private prepareComparableValue;
    private defaultComparison;
    private objectComparison;
    private insertOne;
}
