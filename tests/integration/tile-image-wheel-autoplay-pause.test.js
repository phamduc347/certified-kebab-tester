import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const INIT_SLIDESHOW_SIGNATURE = 'function initSlideshow(card, slides) {';

class FakeClassList {
    constructor(initialClasses = []) {
        this.classes = new Set(initialClasses);
    }

    toggle(className, force) {
        if (force === undefined) {
            if (this.classes.has(className)) {
                this.classes.delete(className);
                return false;
            }
            this.classes.add(className);
            return true;
        }

        if (force) {
            this.classes.add(className);
            return true;
        }

        this.classes.delete(className);
        return false;
    }

    contains(className) {
        return this.classes.has(className);
    }
}

class FakeElement {
    constructor(initialClasses = []) {
        this.classList = new FakeClassList(initialClasses);
        this.listeners = new Map();
        this.style = {};
        this.offsetWidth = 320;
        this.offsetHeight = 180;
    }

    addEventListener(eventName, handler) {
        this.listeners.set(eventName, handler);
    }

    dispatchEvent(eventName, event) {
        const handler = this.listeners.get(eventName);
        if (handler) {
            handler(event);
        }
    }

    setPointerCapture() {}

    releasePointerCapture() {}
}

class FakeTrack extends FakeElement {
    constructor(children) {
        super();
        this.children = [...children];
    }

    get firstElementChild() {
        return this.children[0] || null;
    }

    get lastElementChild() {
        return this.children[this.children.length - 1] || null;
    }

    appendChild(child) {
        const currentIndex = this.children.indexOf(child);
        if (currentIndex !== -1) {
            this.children.splice(currentIndex, 1);
        }
        this.children.push(child);
        return child;
    }

    insertBefore(child, beforeChild) {
        const currentIndex = this.children.indexOf(child);
        if (currentIndex !== -1) {
            this.children.splice(currentIndex, 1);
        }

        const beforeIndex = this.children.indexOf(beforeChild);
        if (beforeIndex === -1) {
            this.children.unshift(child);
        } else {
            this.children.splice(beforeIndex, 0, child);
        }

        return child;
    }
}

function extractInitSlideshowSource() {
    const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');
    const startIndex = source.indexOf(INIT_SLIDESHOW_SIGNATURE);

    if (startIndex === -1) {
        throw new Error('Expected initSlideshow function not found in script.js');
    }

    let braceDepth = 0;
    let endIndex = -1;

    for (let index = startIndex; index < source.length; index++) {
        const char = source[index];
        if (char === '{') {
            braceDepth += 1;
        } else if (char === '}') {
            braceDepth -= 1;
            if (braceDepth === 0) {
                endIndex = index;
                break;
            }
        }
    }

    if (endIndex === -1) {
        throw new Error('Could not determine the end of initSlideshow in script.js');
    }

    return `${source.slice(startIndex, endIndex + 1)}\nthis.initSlideshow = initSlideshow;`;
}

function loadInitSlideshow() {
    const context = {
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Math,
        Date
    };

    vm.runInNewContext(extractInitSlideshowSource(), context, { filename: 'initSlideshow.js' });

    return context.initSlideshow;
}

function buildCardMarkup() {
    const images = [
        new FakeElement(['slide-image', 'active']),
        new FakeElement(['slide-image']),
        new FakeElement(['slide-image'])
    ];
    const dots = [
        new FakeElement(['slide-dot', 'active']),
        new FakeElement(['slide-dot']),
        new FakeElement(['slide-dot'])
    ];
    const track = new FakeTrack(images);
    const imageContainer = new FakeElement(['spot-tile-media']);
    const card = new FakeElement();

    card.id = 'tile-card-test';
    card._autoplayInterval = null;
    card._autoplayTimeout = null;
    card.querySelector = (selector) => {
        if (selector === '.spot-image-container, .spot-tile-media') return imageContainer;
        if (selector === '.spot-comment-area') return null;
        return null;
    };

    imageContainer.querySelectorAll = (selector) => {
        if (selector === '.slide-image') return images;
        if (selector === '.slide-dot') return dots;
        return [];
    };
    imageContainer.querySelector = (selector) => {
        if (selector === '.slide-image-track') return track;
        return null;
    };

    return { card, imageContainer, images };
}

function getActiveImageIndex(images) {
    return images.findIndex((image) => image.classList.contains('active'));
}

describe('Tile image wheel autoplay pause', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('keeps the manually selected image fixed for 8 seconds before autoplay resumes', () => {
        const initSlideshow = loadInitSlideshow();
        const { card, imageContainer, images } = buildCardMarkup();

        initSlideshow(card, [{ id: 1 }, { id: 2 }, { id: 3 }]);

        imageContainer.dispatchEvent('wheel', {
            deltaX: 120,
            preventDefault() {},
            stopPropagation() {}
        });

        expect(getActiveImageIndex(images)).toBe(1);

        vi.advanceTimersByTime(7999);
        expect(getActiveImageIndex(images)).toBe(1);

        vi.advanceTimersByTime(1);
        expect(getActiveImageIndex(images)).toBe(2);
    });
});