# Implementation Plan: Cloudinary Image Upload

## Overview

Replace the existing base64 `compressImage` approach with direct browser-to-Cloudinary uploads across all three upload surfaces (edit profile, list product, request product), add an `isUploading` spinner prop to `ImageUploader`, and apply a shared blur placeholder to all affected `next/image` components.

## Tasks

- [x] 1. Add Cloudinary environment variables to `.env`
  - Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dp7zceqz7`
  - Add `NEXT_PUBLIC_CLOUDINARY_API_KEY=781644622461612`
  - Add `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=campus_uploads`
  - Add `CLOUDINARY_API_SECRET=<secret>` (server-side only, no `NEXT_PUBLIC_` prefix)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create upload utility and shared constants
  - [x] 2.1 Create `src/lib/upload/constants.ts` exporting `BLUR_DATA_URL`
    - Export a `BLUR_DATA_URL` constant containing a valid base64-encoded 1×1 pixel JPEG string
    - _Requirements: 7.1_

  - [x] 2.2 Create `src/lib/upload/cloudinary.ts` with `uploadToCloudinary`
    - Implement `export async function uploadToCloudinary(file: File): Promise<string>`
    - Read `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` at call time; throw with descriptive message if any is missing
    - Build `FormData` with `file` and `upload_preset` keys
    - POST to `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
    - Resolve with `secure_url` from the response JSON on success
    - Reject with `error.message` from response JSON on non-2xx; re-throw original error on network failure
    - Do NOT reference `CLOUDINARY_API_SECRET`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 1.5_

  - [ ]* 2.3 Write property test — Property 1: Missing env var throws descriptive error
    - **Property 1: Missing env var throws descriptive error**
    - Use `fc.constantFrom` over each required `NEXT_PUBLIC_` var; unset it; assert thrown message names the variable
    - **Validates: Requirements 1.5**
    - `// Feature: cloudinary-image-upload, Property 1: Missing env var throws descriptive error`

  - [ ]* 2.4 Write property test — Property 2: Upload utility resolves to the API's secure_url
    - **Property 2: Upload utility resolves to the API's secure_url**
    - Use `fc.string()` to generate arbitrary `secure_url` values; mock `fetch` to return them; assert resolved value equals input exactly
    - **Validates: Requirements 2.2, 2.4**
    - `// Feature: cloudinary-image-upload, Property 2: Upload utility resolves to the API's secure_url`

  - [ ]* 2.5 Write property test — Property 3: Upload utility sends a correctly structured POST request
    - **Property 3: Upload utility sends a correctly structured POST request**
    - Use `fc.string()` to generate file names/content; assert `fetch` was called with the correct URL and `FormData` containing `file` and `upload_preset` keys
    - **Validates: Requirements 2.3**
    - `// Feature: cloudinary-image-upload, Property 3: Upload utility sends a correctly structured POST request`

  - [ ]* 2.6 Write property test — Property 4: Upload utility rejects with API error message
    - **Property 4: Upload utility rejects with API error message**
    - Use `fc.string()` to generate arbitrary error message strings; mock `fetch` to return non-2xx with that message; assert rejection message contains it
    - **Validates: Requirements 2.5**
    - `// Feature: cloudinary-image-upload, Property 4: Upload utility rejects with API error message`

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update `ImageUploader` component with `isUploading` prop
  - Add optional `isUploading?: boolean` to `ImageUploaderProps` interface
  - When `isUploading` is `true`: render a spinner overlay on the drop zone / avatar area, set `disabled` on the hidden `<input type="file">`, and set `disabled` on the camera / "Upload New" button
  - When `isUploading` transitions to `false`, restore normal interactive state
  - Do not alter any existing props or behavior
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.3_

- [x] 5. Migrate `EditProfilePage` to use `uploadToCloudinary`
  - Remove `compressImage` import and `photoBase64` state
  - Add `isUploading` state (`useState<boolean>(false)`)
  - In `onDrop`, store only the `File` (no compression)
  - In `handleSubmit`, if a new photo file was selected: set `isUploading = true`, call `uploadToCloudinary(photoFile)`, set `isUploading = false` in `finally`; on error show a toast and return early without calling `update`
  - Pass the resolved Cloudinary URL (or existing `user.photo`) as `photo` to `useUpdateProfile`
  - Pass `isUploading` to `EditProfileView` → `ImageUploader`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 5.1 Write property test — Property 5: Upload result URL is passed unchanged to the backend mutation (profile)
    - **Property 5: Upload result URL is passed unchanged to the backend mutation**
    - Use `fc.webUrl()` to generate arbitrary Cloudinary URLs; mock `uploadToCloudinary`; assert `useUpdateProfile` mutation receives the exact URL as `photo`
    - **Validates: Requirements 3.2**
    - `// Feature: cloudinary-image-upload, Property 5: Upload result URL is passed unchanged to the backend mutation`

- [x] 6. Migrate `ListProductPage` to use `uploadToCloudinary`
  - Remove `compressImage` import
  - Add `isUploading` state (`useState<boolean>(false)`)
  - In `handleSubmit`, set `isUploading = true`, call `Promise.all(images.map(img => uploadToCloudinary(img.file)))`, set `isUploading = false` in `finally`; on error show a toast and return early without calling `create`
  - Pass the resolved URL array as `images` to `useCreateListedProduct`
  - Pass `isUploading` to `ListProductView` → `ImageUploader`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 6.1 Write property test — Property 5: Upload result URL is passed unchanged to the backend mutation (listed product)
    - **Property 5: Upload result URL is passed unchanged to the backend mutation**
    - Use `fc.webUrl()` to generate arbitrary Cloudinary URL arrays; mock `uploadToCloudinary`; assert `useCreateListedProduct` mutation receives the exact URLs as `images`
    - **Validates: Requirements 4.2**
    - `// Feature: cloudinary-image-upload, Property 5: Upload result URL is passed unchanged to the backend mutation`

- [x] 7. Migrate `RequestProductPage` to use `uploadToCloudinary`
  - Remove `compressImage` import
  - Add `isUploading` state (`useState<boolean>(false)`)
  - In `handleSubmit`, set `isUploading = true`, call `Promise.all(images.map(img => uploadToCloudinary(img.file)))`, set `isUploading = false` in `finally`; on error show a toast and return early without calling `create`
  - Pass the resolved URL array as `images` to `useCreateRequestedProduct`
  - Pass `isUploading` to `RequestProductView` → `ImageUploader`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Apply blur placeholder to `next/image` components
  - [x] 9.1 Update `MyProfileView` — profile avatar
    - Import `BLUR_DATA_URL` from `src/lib/upload/constants`
    - Add `placeholder="blur" blurDataURL={BLUR_DATA_URL}` to the `<Image>` rendering `user.photo` when `src` is non-empty
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 9.2 Update `MyProfileView` — listings and requests grids
    - Replace the inline `blurDataURL` base64 strings in both grids with the shared `BLUR_DATA_URL` constant
    - Ensure `placeholder="blur"` is only present when `item.images[0]` is truthy
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 9.3 Update `ManageListingView` — product hero image
    - Import `BLUR_DATA_URL` from `src/lib/upload/constants`
    - Add `placeholder="blur" blurDataURL={BLUR_DATA_URL}` to the `<Image>` rendering `product.images[0]` (already guarded by `product.images[0] &&`)
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 9.4 Update `ManageRequestView` — request hero image
    - Import `BLUR_DATA_URL` from `src/lib/upload/constants`
    - Add `placeholder="blur" blurDataURL={BLUR_DATA_URL}` to the `<Image>` rendering `request.images[0]` (already guarded by `request.images[0] &&`)
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ]* 9.5 Write property test — Property 6: Blur placeholder applied if and only if src is non-empty
    - **Property 6: Blur placeholder applied if and only if src is non-empty**
    - Use `fc.oneof(fc.webUrl(), fc.constant(''), fc.constant(null))` to generate src values; assert `placeholder="blur"` and `blurDataURL` presence matches src non-emptiness
    - **Validates: Requirements 7.2, 7.4**
    - `// Feature: cloudinary-image-upload, Property 6: Blur placeholder applied if and only if src is non-empty`

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- `CLOUDINARY_API_SECRET` must never appear in `src/lib/upload/cloudinary.ts` or any client-side module
- Property tests use fast-check with a minimum of 100 iterations per property
- Unit tests and property tests are complementary — both should be present for the upload utility
