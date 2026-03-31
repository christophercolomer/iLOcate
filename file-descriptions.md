# File Descriptions for the Frontend Branch

## Root Directory
- **components.json**: Configuration file for managing components in the project.
- **next-env.d.ts**: TypeScript declaration file for Next.js.
- **next.config.mjs**: Configuration file for Next.js settings.
- **package.json**: Contains metadata about the project and its dependencies.
- **pnpm-lock.yaml**: Lock file for dependencies managed by pnpm.
- **postcss.config.mjs**: Configuration file for PostCSS, used for processing CSS.
- **tsconfig.json**: TypeScript configuration file.

## app Directory
- **globals.css**: Global CSS styles for the application.
- **layout.tsx**: Defines the layout structure for the application.

### app/(auth) Directory
- **layout.tsx**: Layout for authentication-related pages.
- **login/page.tsx**: Login page component.
- **preferences/page.tsx**: Preferences page component.
- **signup/page.tsx**: Signup page component.

### app/(dashboard) Directory
- **layout.tsx**: Layout for dashboard-related pages.
- **dashboard/page.tsx**: Main dashboard page component.
- **dashboard/food/page.tsx**: Food-related dashboard page.
- **dashboard/itinerary/page.tsx**: Itinerary-related dashboard page.
- **dashboard/map/page.tsx**: Map-related dashboard page.
- **dashboard/places/page.tsx**: Places-related dashboard page.
- **dashboard/saved-routes/page.tsx**: Saved routes dashboard page.
- **dashboard/translator/page.tsx**: Translator-related dashboard page.

### app/(site) Directory
- **layout.tsx**: Layout for site-related pages.
- **page.tsx**: Main landing page component.
- **faqs/page.tsx**: FAQs page component.
- **premium/page.tsx**: Premium features page component.

## components Directory
- **footer.tsx**: Footer component for the application.
- **listing-card.tsx**: Component for displaying individual listings.
- **navbar.tsx**: Navigation bar component.
- **search-filters.tsx**: Component for search filters.
- **theme-provider.tsx**: Provides theme context for the application.

### components/home Directory
- **events-section.tsx**: Displays the events section on the homepage.
- **faq-section.tsx**: Displays the FAQ section on the homepage.
- **featured-places.tsx**: Displays featured places on the homepage.
- **hero-section.tsx**: Displays the hero section on the homepage, including the "View Routes" button.
- **how-it-works.tsx**: Explains how the application works.

### components/ui Directory
Contains reusable UI components such as buttons, modals, forms, and more. Examples include:
- **button.tsx**: Button component.
- **modal.tsx**: Modal component.
- **form.tsx**: Form component.
- **toast.tsx**: Toast notification component.

## hooks Directory
- **use-mobile.ts**: Custom hook for detecting mobile devices.
- **use-toast.ts**: Custom hook for managing toast notifications.

## lib Directory
- **firebase.ts**: Firebase configuration and initialization.
- **utils.ts**: Utility functions used across the application.

## public Directory
Contains static assets such as images and icons.
- **images/**: Directory containing image assets like hero images, icons, and placeholders.

## styles Directory
- **globals.css**: Global CSS styles for the application.



To access specific files like the layout for the premium page or other files, you can navigate to the respective directories in your project. Here's how you can locate them:

Premium Layout:

File: app/(site)/premium/page.tsx/premium/page.tsx)
Path: C:\Users\user\Desktop\Ilocate - Front end\iLOcate\app\(site)\premium\page.tsx
Authentication Layout:

File: app/(auth)/layout.tsx/layout.tsx)
Path: C:\Users\user\Desktop\Ilocate - Front end\iLOcate\app\(auth)\layout.tsx
Dashboard Layout:

File: app/(dashboard)/layout.tsx/layout.tsx)
Path: C:\Users\user\Desktop\Ilocate - Front end\iLOcate\app\(dashboard)\layout.tsx
Site Layout:

File: app/(site)/layout.tsx/layout.tsx)
Path: C:\Users\user\Desktop\Ilocate - Front end\iLOcate\app\(site)\layout.tsx
You can open these files in VS Code by navigating to their respective paths in the file explorer or by using the terminal command:

For example, to open the premium layout file, you can run:

code "C:\\Users\\user\\Desktop\\Ilocate - Front end\\iLOcate\\app\\(site)\\premium\\page.tsx"