export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const imageExtensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

export function validateImageFile(file, allowedTypes) {
    if (!allowedTypes.includes(file.type)) {
        return '';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return '';
    }
    return '';
}

export function addTimestampToImageFilename(file, prefix, index = 0) {
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace('.', '-');
    const extension = imageExtensions[file.type];
    const filename = `${prefix}-${timestamp}-${index + 1}.${extension}`;

    return new File([file], filename, {
        type: file.type,
        lastModified: file.lastModified,
    });
}
