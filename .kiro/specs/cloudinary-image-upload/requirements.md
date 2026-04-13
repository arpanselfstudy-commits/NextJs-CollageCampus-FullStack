# Requirements Document

## Introduction

This feature integrates Cloudinary as the image hosting and delivery service for the CollageCampus Next.js application. Currently, images are compressed to base64 strings and sent as JSON payloads to the backend — a pattern that bloats request sizes and stores raw data in MongoDB. The new approach uploads images directly from the browser to Cloudinary using unsigned uploads, then sends the resulting secure HTTPS URLs to the backend for storage. This applies to all image upload surfaces: profile picture, listed product images, and requested product images. Additionally, all `next/image` components across the app receive a consistent blur placeholder to improve perceived performance.

## Glossary

- **Cloudinary**: Cloud-based image and video management service used for hosting, transforming, and delivering media assets.
- **Unsigned Upload**: A Cloudinary upload preset that allows direct browser-to-Cloudinary uploads without exposing the API secret.
- **Upload Preset**: A named configuration in Cloudinary that defines upload parameters (folder, transformations, access mode) for unsigned uploads.
- **Cloudinary URL**: A secure HTTPS URL (`https://res.cloudinary.com/...`) returned by Cloudinary after a successful upload, used as the image reference in the database.
- **Upload Utility**: A reusable TypeScript function (`uploadToCloudinary`) that accepts a `File` and returns a `Promise<string>` resolving to the Cloudinary URL.
- **ImageUploader**: The existing React component at `src/components/common/ImageUploader/ImageUploader.tsx` used across all image upload surfaces.
- **Blur Placeholder**: A low-quality base64-encoded image string passed to Next.js `Image` components as `blurDataURL` to show a blurred preview while the full image loads.
- **Upload Surface**: Any page or form in the application where a user can select and submit an image (edit profile, list product, request product).
- **API Secret**: The Cloudinary API secret, which must never be exposed to the browser and must only be stored server-side in environment variables.

## Requirements

### Requirement 1: Cloudinary Environment Configuration

**User Story:** As a developer, I want Cloudinary credentials stored securely in environment variables, so that the application can authenticate with Cloudinary without exposing secrets in source code.

#### Acceptance Criteria

1. THE Application SHALL read the Cloudinary cloud name from the `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` environment variable.
2. THE Application SHALL read the Cloudinary API key from the `NEXT_PUBLIC_CLOUDINARY_API_KEY` environment variable.
3. THE Application SHALL read the Cloudinary upload preset name from the `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` environment variable.
4. THE Application SHALL read the Cloudinary API secret from the `CLOUDINARY_API_SECRET` environment variable (server-side only, no `NEXT_PUBLIC_` prefix).
5. IF any required `NEXT_PUBLIC_` Cloudinary environment variable is missing at runtime, THEN THE Upload_Utility SHALL throw an error with a descriptive message identifying the missing variable.

---

### Requirement 2: Reusable Client-Side Upload Utility

**User Story:** As a developer, I want a single reusable upload function, so that all image upload surfaces use consistent Cloudinary integration without duplicating logic.

#### Acceptance Criteria

1. THE Upload_Utility SHALL be implemented as a TypeScript function exported from `src/lib/upload/cloudinary.ts`.
2. THE Upload_Utility SHALL accept a single `File` argument and return a `Promise<string>` that resolves to the Cloudinary secure URL.
3. WHEN a file is uploaded, THE Upload_Utility SHALL send a `multipart/form-data` POST request to the Cloudinary unsigned upload endpoint (`https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`).
4. WHEN the Cloudinary API returns a successful response, THE Upload_Utility SHALL resolve the promise with the `secure_url` field from the response.
5. IF the Cloudinary API returns an error response, THEN THE Upload_Utility SHALL reject the promise with an error message derived from the API response body.
6. IF a network error occurs during upload, THEN THE Upload_Utility SHALL reject the promise with a descriptive network error message.
7. THE Upload_Utility SHALL NOT use the Cloudinary API secret in any client-side code.

---

### Requirement 3: Profile Picture Upload via Cloudinary

**User Story:** As a user, I want my profile picture to be uploaded to Cloudinary, so that my photo is served from a fast CDN and stored as a URL rather than base64 data.

#### Acceptance Criteria

1. WHEN a user selects a new profile photo on the Edit Profile page, THE EditProfilePage SHALL upload the file to Cloudinary using the Upload_Utility before submitting the form.
2. WHEN the Cloudinary upload succeeds, THE EditProfilePage SHALL pass the resulting Cloudinary URL as the `photo` field to the `useUpdateProfile` mutation.
3. WHEN the Cloudinary upload is in progress, THE EditProfilePage SHALL set the form submission button to a disabled/loading state to prevent duplicate submissions.
4. IF the Cloudinary upload fails, THEN THE EditProfilePage SHALL display an error notification to the user and SHALL NOT submit the profile update to the backend.
5. WHEN no new photo is selected, THE EditProfilePage SHALL pass the existing `user.photo` URL unchanged to the `useUpdateProfile` mutation.
6. THE EditProfilePage SHALL remove the dependency on `compressImage` for profile photo handling.

---

### Requirement 4: Listed Product Image Upload via Cloudinary

**User Story:** As a user, I want my product listing images to be uploaded to Cloudinary, so that product images are served reliably and stored as URLs in the database.

#### Acceptance Criteria

1. WHEN a user submits the List Product form, THE ListProductPage SHALL upload all selected image files to Cloudinary using the Upload_Utility before calling the create mutation.
2. WHEN all Cloudinary uploads succeed, THE ListProductPage SHALL pass the array of resulting Cloudinary URLs as the `images` field to the `useCreateListedProduct` mutation.
3. WHEN uploads are in progress, THE ListProductPage SHALL set the submit button to a disabled/loading state.
4. IF any Cloudinary upload fails, THEN THE ListProductPage SHALL display an error notification and SHALL NOT submit the product creation request to the backend.
5. THE ListProductPage SHALL support uploading between 1 and 5 images, consistent with the existing UI constraint.
6. THE ListProductPage SHALL remove the dependency on `compressImage` for product image handling.

---

### Requirement 5: Requested Product Image Upload via Cloudinary

**User Story:** As a user, I want my product request images to be uploaded to Cloudinary, so that request images are served reliably and stored as URLs in the database.

#### Acceptance Criteria

1. WHEN a user submits the Request Product form, THE RequestProductPage SHALL upload all selected image files to Cloudinary using the Upload_Utility before calling the create mutation.
2. WHEN all Cloudinary uploads succeed, THE RequestProductPage SHALL pass the array of resulting Cloudinary URLs as the `images` field to the `useCreateRequestedProduct` mutation.
3. WHEN uploads are in progress, THE RequestProductPage SHALL set the submit button to a disabled/loading state.
4. IF any Cloudinary upload fails, THEN THE RequestProductPage SHALL display an error notification and SHALL NOT submit the request creation to the backend.
5. THE RequestProductPage SHALL support uploading between 1 and 5 images, consistent with the existing UI constraint.
6. THE RequestProductPage SHALL remove the dependency on `compressImage` for request image handling.

---

### Requirement 6: Upload Loading State in ImageUploader Component

**User Story:** As a user, I want to see a loading indicator while my image is being uploaded to Cloudinary, so that I know the upload is in progress and do not interact with the form prematurely.

#### Acceptance Criteria

1. THE ImageUploader SHALL accept an optional `isUploading` boolean prop.
2. WHILE `isUploading` is `true`, THE ImageUploader SHALL display a visible loading indicator overlaid on the upload zone or avatar area.
3. WHILE `isUploading` is `true`, THE ImageUploader SHALL disable the file picker trigger to prevent selecting a new file during an active upload.
4. WHEN `isUploading` transitions from `true` to `false`, THE ImageUploader SHALL restore normal interactive state.

---

### Requirement 7: Next.js Image Blur Placeholder

**User Story:** As a user, I want a smooth loading experience for all images across the app, so that I see a blurred placeholder instead of a blank space while images load.

#### Acceptance Criteria

1. THE Application SHALL define a single shared `BLUR_DATA_URL` constant containing a valid base64-encoded 1×1 pixel JPEG for use as a blur placeholder.
2. WHEN a `next/image` `Image` component renders a remote image URL (non-null, non-empty `src`), THE Image_Component SHALL include `placeholder="blur"` and `blurDataURL={BLUR_DATA_URL}`.
3. THE Application SHALL apply the blur placeholder to all `Image` components that display user-provided or remote images, including: profile avatar in `MyProfileView`, product images in `MyProfileView` listings and requests grids, product images in `ManageListingView`, and request images in `ManageRequestView`.
4. WHEN an `Image` component renders with a null or empty `src`, THE Image_Component SHALL NOT use the blur placeholder (to avoid Next.js warnings).

---

### Requirement 8: Backward Compatibility and No Regression

**User Story:** As a developer, I want the Cloudinary integration to not break any existing functionality, so that users experience no disruption to current features.

#### Acceptance Criteria

1. WHEN the Cloudinary upload is complete, THE Application SHALL pass only the Cloudinary URL string to the backend API, maintaining the existing `images: string[]` and `photo: string` field contracts.
2. THE Application SHALL NOT modify any backend API route handlers, database models, or service layer code as part of this feature.
3. THE Application SHALL NOT remove or alter the `ImageUploader` component's existing props interface beyond adding the optional `isUploading` prop.
4. WHEN existing Cloudinary URLs are already stored in the database, THE Application SHALL continue to display them correctly via `next/image` without any migration.
5. THE `next.config.ts` `images.remotePatterns` entry for `**.cloudinary.com` SHALL remain in place to allow Next.js to serve Cloudinary images.
