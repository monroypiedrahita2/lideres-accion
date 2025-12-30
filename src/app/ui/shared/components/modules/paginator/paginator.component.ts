import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PageEvent {
    pageIndex: number;
    pageSize: number;
    length?: number;
}

@Component({
    selector: 'mg-paginator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './paginator.component.html',
})
export class MgPaginatorComponent {
    /**
     * Mode: 'simple' (Next/Prev buttons only) or 'full' (Page size, Length info).
     * Automatically inferred: if length is provided, assumes 'full'.
     */

    @Input() length?: number;
    @Input() pageSize: number = 10;
    @Input() pageIndex: number = 0;
    @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
    @Input() showPageSizeOptions: boolean = false;

    // For 'simple' text mode (like "1 - 5 of 20" or just "Anterior" / "Siguiente")
    @Input() isFirstPage: boolean = false;
    @Input() isLastPage: boolean = false;

    @Output() page = new EventEmitter<PageEvent>();
    @Output() next = new EventEmitter<void>();
    @Output() previous = new EventEmitter<void>();

    get totalPages(): number {
        if (!this.length) return 0;
        return Math.ceil(this.length / this.pageSize);
    }

    get rangeLabel(): string {
        if (!this.length) return '';
        const start = this.pageIndex * this.pageSize + 1;
        const end = Math.min((this.pageIndex + 1) * this.pageSize, this.length);
        return `${start} - ${end} de ${this.length}`;
    }

    onNext(): void {
        if (!this.isLastPage && (this.length === undefined || (this.pageIndex + 1) < this.totalPages)) {
            this.pageIndex++;
            this.emitPageEvent();
            this.next.emit();
        }
    }

    onPrevious(): void {
        if (!this.isFirstPage && this.pageIndex > 0) {
            this.pageIndex--;
            this.emitPageEvent();
            this.previous.emit();
        }
    }

    onPageSizeChange(event: Event): void {
        const newSize = Number((event.target as HTMLSelectElement).value);
        this.pageSize = newSize;
        this.pageIndex = 0; // Reset to first page
        this.emitPageEvent();
    }

    private emitPageEvent(): void {
        this.page.emit({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            length: this.length
        });
    }
}
