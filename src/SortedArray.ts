  interface IEqualElements {
    first: number,
    length: number
  }
  
  export class SortedArray<T> {
    protected items: T[];
    protected key: string | null;
    protected cmp: (left: T, right: T) => number;
  
    constructor(arg?: string | ((left: T, right: T) => number)) {
      this.items = [];
      const type = typeof arg;
      if (type === 'string') {
        this.key = arg as string;
        this.cmp = this.objectComparison;
      } else if (type === 'function') {
        this.key = null;
        this.cmp = arg as ((left: T, right: T) => number);
      } else {
        this.key = null;
        this.cmp = this.defaultComparison;
      }
    }
  
    get length(): number {
      return this.items.length;
    }
  
    public get(index: number): T {
      return this.items[index];
    }
  
    public insert(elements: T | T[], ...args: T[]): SortedArray<T> {
      const toInsert: T[] = (arguments.length === 1 && Array.isArray(elements))
                              ? elements.slice()
                              : Array.prototype.slice.call(arguments);
  
      if (this.items.length === 0) {
        this.items = toInsert.sort(this.cmp.bind(this));
        return this;
      }
  
      toInsert.forEach((element) => {
        this.insertOne(element);
      });
      return this;
    }
  
    public remove(index: number, deleteCount: number = 1): SortedArray<T> {
      this.items.splice(index, deleteCount);
      return this;
    }
  
    public removeByValue(value: T | T[]): SortedArray<T> {
      if (value instanceof Array) {
        value.forEach(v => this.removeByValue(v));
        return this;
      }
      const found: IEqualElements = this.getEqual(value);
  
      if (found.length === 0) {
        return this;
      }
  
      this.items.splice(found.first, found.length);
  
      return this;
    }
  
    public search(value: any): number {
      const element = this.prepareComparableValue(value);
  
      let middle: number;
      let min = 0;
      let max = this.items.length - 1;
  
      while (min <= max) {
        middle = (min + max) >> 1;
  
        const cmp = this.cmp(this.get(middle), element);
        if (cmp < 0) {
          min = middle + 1;
        } else if (cmp > 0) {
          max = middle - 1;
        } else if (min !== middle) {
          max = middle;
        } else {
          return middle;
        }
      }
  
      return -1;
    }
  
    public has(value: any): boolean {
      return this.search(value) !== -1;
    }
  
    public eq(value: any): SortedArray<T> {
      const found: IEqualElements = this.getEqual(value);
      const result = new SortedArray(this.key || this.cmp);
      result.insert((found.length === 0) ? [] : this.items.slice(found.first, found.first + found.length));
      return result;
    }
  
    public gt(value: any): SortedArray<T> {
      const index = this.greaterThan(value);
      const result = new SortedArray(this.key || this.cmp);
      result.insert((index < 0) ? [] : this.items.slice(index));
      return result;
    }
  
    public lt(value: any): SortedArray<T> {
      const index = this.lessThan(value);
      const result = new SortedArray(this.key || this.cmp);
      result.insert((index < 0) ? [] : this.items.slice(0, index + 1));
      return result;
    }
  
    public gte(value: any): SortedArray<T> {
      const index = this.greaterThan(value, true);
      const result = new SortedArray(this.key || this.cmp);
      result.insert((index < 0) ? [] : this.items.slice(index));
      return result;
    }
  
    public lte(value: any): SortedArray<T> {
      const index = this.lessThan(value, true);
      const result = new SortedArray(this.key || this.cmp);
      result.insert((index < 0) ? [] : this.items.slice(0, index + 1));
      return result;
    }
  
    public clear(): SortedArray<T> {
      this.items = [];
      return this;
    }
  
    public toArray(): T[] {
      return this.items;
    }
  
    public toString(): string {
      return this.items.toString();
    }
  
    private getEqual(value: any): IEqualElements {
      const element = this.prepareComparableValue(value);
      const result: IEqualElements = { first: -1, length: 0 };
  
      let index = this.search(element);
      if (index === -1) {
        return result;
      }
  
      result.first = index++;
      let numberOfEqualValues = 1;
  
      while (index < this.items.length) {
        if (this.cmp(this.get(index), element) === 0) {
          numberOfEqualValues += 1;
        } else {
          break;
        }
        index += 1;
      }
  
      result.length = numberOfEqualValues;
      return result;
    }
  
    public greaterThan(value: any, orEqual: boolean = false): number {
      const element = this.prepareComparableValue(value);
  
      let middle: number;
      let min = 0;
      let max = this.items.length - 1;
  
      while (min <= max) {
        middle = (min + max) >> 1;
  
        const cmp = this.cmp(this.get(middle), element);
        if (cmp > 0 || (orEqual && cmp === 0)) {
          max = middle - 1;
        } else {
          min = middle + 1;
        }
      }
  
      return (max + 1 === this.items.length) ? -1 : max + 1;
    }
  
    public lessThan(value: any, orEqual: boolean = false): number {
      const element = this.prepareComparableValue(value);
  
      let middle: number;
      let min = 0;
      let max = this.items.length - 1;
  
      while (min <= max) {
        middle = (min + max) >> 1;
  
        const cmp = this.cmp(this.get(middle), element);
        if ((!orEqual && cmp >= 0) || (orEqual && cmp > 0)) {
          max = middle - 1;
        } else {
          min = middle + 1;
        }
      }
      return (min - 1 < 0) ? -1 : min - 1;
    }
  
    private prepareComparableValue(value: any): T {
      let element: any;
      if (this.key && typeof value !== 'object') {
        element = {};
        element[this.key] = value;
      } else {
        element = value;
      }
      return element;
    }
  
    private defaultComparison(left: T, right: T): number {
      if (left < right) {
        return -1;
      } else if (left > right) {
        return 1;
      }
      return 0;
    }
  
    private objectComparison(left: any, right: any): number {
      const leftValue: any = left[this.key!];
      const rightValue: any = right[this.key!];
  
      if (leftValue < rightValue) {
        return -1;
      } else if (leftValue > rightValue) {
        return 1;
      }
      return 0;
    }
  
    private insertOne(element: T): SortedArray<T> {
      let index = this.greaterThan(element);
      if (index < 0) {
        index = this.items.length;
      }
      this.items.splice(index, 0, element);
      return this;
    }
  }