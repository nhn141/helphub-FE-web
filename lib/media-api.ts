import { apiData, API_BASE_URL } from "./api";

export type MediaVisibility = "PUBLIC" | "PRIVATE";

export type UploadSessionResponse = {
    mediaId: string;
    status: string;
    uploadMethod: "DIRECT" | "SERVER" | string;
    uploadUrl: string | null;
    parameters: Record<string, string> | null;
};

export type CompleteUploadResponse = {
    mediaId: string;
    status: string;
    visibility: MediaVisibility;
    format: string;
    sizeBytes: number;
    secureUrl: string | null;
};

export type MediaMetadataResponse = {
    mediaId: string;
    status: string;
    visibility: MediaVisibility;
    resourceType: string;
    mimeType: string;
    format: string;
    sizeBytes: number;
    secureUrl: string | null;
};

export type UploadedMediaResult = {
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
};

/**
 * Upload a media file via the real media-service microservice.
 * Handles both DIRECT upload (Cloudinary signed) and SERVER upload (Private).
 */
export async function uploadMedia(
    accessToken: string,
    file: File,
    visibility: MediaVisibility = "PUBLIC",
): Promise<UploadedMediaResult> {
    const filename = file.name || "upload-" + Date.now();
    const mimeType = file.type || "image/jpeg";
    const sizeBytes = file.size || 1024;

    // 1. Khởi tạo Upload Session trên media-service
    const session = await apiData<UploadSessionResponse>(
        "/api/v1/media/upload-sessions",
        {
            method: "POST",
            body: JSON.stringify({
                filename,
                mimeType,
                sizeBytes,
                visibility,
            }),
        },
        accessToken,
    );

    const { mediaId, uploadMethod, uploadUrl, parameters } = session;

    // 2. Upload file theo phương thức backend chỉ định
    if (uploadMethod === "DIRECT" && uploadUrl && parameters) {
        // Upload trực tiếp lên Cloudinary với chữ ký bảo mật từ media-service
        const formData = new FormData();
        Object.entries(parameters).forEach(([k, v]) => {
            formData.append(k, v);
        });
        formData.append("file", file);

        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Cloudinary upload failed: ${uploadRes.status} ${errText}`);
        }

        const cloudData = await uploadRes.json();

        // 3. Thông báo media-service hoàn tất upload
        const completeResult = await apiData<CompleteUploadResponse>(
            `/api/v1/media/${encodeURIComponent(mediaId)}/complete`,
            {
                method: "POST",
                body: JSON.stringify({
                    assetId: cloudData.asset_id,
                    publicId: cloudData.public_id,
                    version: Number(cloudData.version),
                }),
            },
            accessToken,
        );

        return {
            id: mediaId,
            url: completeResult.secureUrl || cloudData.secure_url,
            fileName: filename,
            mimeType,
            size: sizeBytes,
        };
    } else {
        // Upload Server nội bộ (Private media)
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/api/v1/media/${encodeURIComponent(mediaId)}/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Media upload failed: ${response.status} ${errText}`);
        }

        const json = await response.json();
        const data = json.data ?? json;

        return {
            id: mediaId,
            url: data.secureUrl || "",
            fileName: filename,
            mimeType,
            size: sizeBytes,
        };
    }
}

/**
 * Lấy metadata chi tiết của một file media
 */
export async function getMediaMetadata(
    accessToken: string,
    mediaId: string,
): Promise<MediaMetadataResponse> {
    return apiData<MediaMetadataResponse>(
        `/api/v1/media/${encodeURIComponent(mediaId)}`,
        { method: "GET" },
        accessToken,
    );
}

/**
 * Lấy danh sách metadata cho nhiều media theo batch
 */
export async function getBatchMediaMetadata(
    accessToken: string,
    mediaIds: string[],
): Promise<MediaMetadataResponse[]> {
    return apiData<MediaMetadataResponse[]>(
        "/api/v1/media/batch",
        {
            method: "POST",
            body: JSON.stringify({ mediaIds }),
        },
        accessToken,
    );
}

