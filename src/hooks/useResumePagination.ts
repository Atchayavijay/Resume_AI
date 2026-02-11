
import { useState, useLayoutEffect, useRef, useEffect } from 'react';

interface Dimensions {
    width: number;
    height: number;
    marginTop?: number;
    marginBottom?: number;
}

export const useResumePagination = (
    items: any[],
    renderItem: (item: any) => React.ReactNode,
    pageDimensions: Dimensions
) => {
    const [pages, setPages] = useState<any[][]>([]);
    const [measuring, setMeasuring] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // We use a simplified ID mapping to track heights
    const [itemHeights, setItemHeights] = useState<Record<string, number>>({});

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        // Measure all children
        const newHeights: Record<string, number> = {};
        const children = Array.from(containerRef.current.children) as HTMLElement[];
        let hasChanges = false;

        children.forEach((child) => {
            const id = child.getAttribute('data-id');
            if (id) {
                const style = window.getComputedStyle(child);
                const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                const height = child.offsetHeight + margin;
                newHeights[id] = height;

                if (itemHeights[id] !== height) {
                    hasChanges = true;
                }
            }
        });

        // Check if keys are different length (e.g., new items added)
        if (!hasChanges && Object.keys(newHeights).length !== Object.keys(itemHeights).length) {
            hasChanges = true;
        }

        // Only update if heights changed
        if (hasChanges && Object.keys(newHeights).length > 0) {
            setItemHeights(newHeights);
            setMeasuring(false);
        }
    }, [items, pageDimensions.width, itemHeights]);
    // Dependency on items means whenever resume data changes (flattened blocks), we re-measure.

    useEffect(() => {
        if (measuring || Object.keys(itemHeights).length === 0) return;

        // Distribute items into pages
        const newPages: any[][] = [];
        let currentPage: any[] = [];
        let currentHeight = 0;

        // Safety margin 
        const MAX_HEIGHT = pageDimensions.height - (pageDimensions.marginTop || 0) - (pageDimensions.marginBottom || 0);

        items.forEach((item) => {
            const h = itemHeights[item.id] || 0;

            // If item is too tall for a single page (rare for normal resume items, but check), 
            // we might need to handle it. For now, we assume items < page height.
            // If adding this item exceeds max height:
            if (currentHeight + h > MAX_HEIGHT && currentPage.length > 0) {
                // Push current page
                newPages.push(currentPage);
                // Start new page
                currentPage = [item];
                currentHeight = h;
            } else {
                currentPage.push(item);
                currentHeight += h;
            }
        });

        if (currentPage.length > 0) {
            newPages.push(currentPage);
        }

        // Check if pages actually changed to limit updates
        // Simple check: same number of pages? same first item of first page?
        // For deep check we can use JSON.stringify for simplicity given it's not massive data
        const isSame = JSON.stringify(newPages) === JSON.stringify(pages);

        if (!isSame) {
            setPages(newPages);
        }

    }, [items, itemHeights, measuring, pageDimensions, pages]);

    return {
        pages,
        measuring,
        containerRef
    };
};
