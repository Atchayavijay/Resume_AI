
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
    const { height: PAGE_HEIGHT, marginTop: PAGE_PADDING_TOP = 40, marginBottom: PAGE_PADDING_BOTTOM = 40 } = pageDimensions;
    const USABLE_PAGE_HEIGHT = PAGE_HEIGHT - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM - 10; // Extra 10px safety to prevent rounding issues at bottom limit
    const [pages, setPages] = useState<any[][]>([]);
    const [measuring, setMeasuring] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [itemHeights, setItemHeights] = useState<Record<string, number>>({});

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const measure = () => {
            if (!containerRef.current) return;

            const newHeights: Record<string, number> = {};
            const children = Array.from(containerRef.current.children) as HTMLElement[];
            let hasChanges = false;

            children.forEach((child) => {
                const id = child.getAttribute('data-id');
                if (id) {
                    const rect = child.getBoundingClientRect();
                    let height = rect.height;

                    // Add margins from the inner rendered element (the resume-item)
                    const firstChild = child.firstElementChild;
                    if (firstChild) {
                        const style = window.getComputedStyle(firstChild);
                        const marginTop = parseFloat(style.marginTop) || 0;
                        const marginBottom = parseFloat(style.marginBottom) || 0;
                        height += marginTop + marginBottom;
                    }

                    newHeights[id] = height;

                    if (itemHeights[id] !== height) {
                        hasChanges = true;
                    }
                }
            });

            if (!hasChanges && Object.keys(newHeights).length !== Object.keys(itemHeights).length) {
                hasChanges = true;
            }

            if (hasChanges && Object.keys(newHeights).length > 0) {
                setItemHeights(newHeights);
                setMeasuring(false);
            }
        };

        // Use requestAnimationFrame to wait for layout stabilization
        const rafId = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(rafId);
    }, [items, pageDimensions.width, itemHeights]);

    useEffect(() => {
        if (measuring || Object.keys(itemHeights).length === 0) return;

        const newPages: any[][] = [];
        let currentPage: any[] = [];
        let currentHeight = 0;

        items.forEach((item, index) => {
            const sectionHeight = itemHeights[item.id] || 0;

            // Check if we should break page
            let shouldBreak = false;

            if (currentPage.length > 0) {
                // Standard break if item doesn't fit
                if (currentHeight + sectionHeight > USABLE_PAGE_HEIGHT) {
                    shouldBreak = true;
                }
                // --- Keep with Next Logic ---
                // If this is a title or a header block, check if at least one content block follows it on the same page
                else if (
                    (item.type === 'section-title' || (item.type === 'section-item' && item.content?._renderType === 'header')) &&
                    index < items.length - 1
                ) {
                    const nextItem = items[index + 1];
                    const nextHeight = itemHeights[nextItem.id] || 0;

                    // If title/header + next item > remaining space, break now to keep them together
                    if (currentHeight + sectionHeight + nextHeight > USABLE_PAGE_HEIGHT) {
                        shouldBreak = true;
                    }
                }
            }

            if (shouldBreak) {
                newPages.push(currentPage);
                currentPage = [item];
                currentHeight = sectionHeight;
            } else {
                currentPage.push(item);
                currentHeight += sectionHeight;
            }
        });

        if (currentPage.length > 0) {
            newPages.push(currentPage);
        }

        const isSame = JSON.stringify(newPages) === JSON.stringify(pages);
        if (!isSame) {
            setPages(newPages);
        }

    }, [items, itemHeights, measuring, pages, USABLE_PAGE_HEIGHT]);

    return {
        pages,
        measuring,
        containerRef
    };
};
