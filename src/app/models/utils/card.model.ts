export interface CardModel {
    goTo: string;
    title: string;
    description: string;
    icon: string;
    activePoint?: boolean
    showIf?: string[]
}
