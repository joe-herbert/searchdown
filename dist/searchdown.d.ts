export interface SearchdownOptions {
    values?: string[] | Record<string, string>;
    sort?: 'ASC' | 'DESC';
    limit?: number;
    enteredLimit?: number;
    multiple?: boolean;
    addValues?: boolean;
    saveEntered?: boolean;
    hideEntered?: boolean;
    allowDuplicates?: boolean;
    caseSensitive?: boolean;
    placeholder?: string;
    required?: number | boolean;
    maxHeight?: number;
    inputName?: string;
    initialValues?: string[];
    simpleInput?: boolean;
    textarea?: boolean;
    baseBackColor?: string;
    selectedBackColor?: string;
    hoverBackColor?: string;
    baseTextColor?: string;
    selectedTextColor?: string;
    hoverTextColor?: string;
}

export interface SearchdownInstance {
    element: HTMLElement;
    options: SdOptions;
}

export class SdOptions {
    constructor(opts?: SearchdownOptions);
    get(prop: keyof SearchdownOptions): any;
    set(prop: keyof SearchdownOptions, value: any): boolean;
    pushValue(value: string): boolean;
}

export function searchdown(
    element: string | HTMLElement,
    options?: SearchdownOptions | SdOptions
): SearchdownInstance | false;

export function getValue(
    element: string | HTMLElement,
    includeNotEntered?: boolean
): string | string[] | false;

export function setValue(
    element: string | HTMLElement,
    values: string | string[]
): void;

export function validate(element: string | HTMLElement): boolean;

export function reportValidity(element: string | HTMLElement): boolean;

export function autoCreate(): void;

export function enableAutoCreate(): void;

export default searchdown;