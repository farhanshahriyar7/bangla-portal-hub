# 🏛️ Government Employee Dashboard

A modern, user-friendly dashboard designed specifically for registered government employees to manage their personal and professional data digitally. Built with **React**, **TypeScript**, and **ShadCN UI**.

---

## 🌟 Features

### 🔄 Bilingual Support
- **Primary Language**: Bangla (বাংলা)  
- **Secondary Language**: English  
- Complete UI translation with seamless language switching  

### 🎨 Adaptive Theming
- **Day Mode**: Clean white background with black text  
- **Night Mode**: Professional gray-900 background with white text  
- **Accent Color**: Government green (`#2D5016`) for consistency  

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes  
- **Collapsible Sidebar**: Space-efficient navigation  
- **Adaptive Layouts**: Cards and grids adjust to screen size  

### 🚀 Core Functionality
- ✅ Personal information management  
- 📋 Professional data forms  
- 📄 Document upload/download  
- 🗓️ Leave applications  
- 📊 Quick statistics overview  
- 🔔 Notifications system  
- 🔐 Security settings  

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite  
- **UI Framework**: ShadCN UI, Tailwind CSS  
- **Icons**: Lucide React  
- **Routing**: React Router DOM  
- **State Management**: React Hooks  
- **Form Handling**: React Hook Form, Zod validation  
- **Theming**: Next Themes  
- **Notifications**: Sonner  

---


```
bangla-portal-hub
├─ bun.lockb
├─ components.json
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ favicon.ico
│  ├─ images.png
│  ├─ placeholder.svg
│  ├─ robots.txt
│  └─ _redirects
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  │  └─ accent-color.png
│  ├─ components
│  │  ├─ AppSidebar.tsx
│  │  ├─ CopyRights.tsx
│  │  ├─ DashboardCard.tsx
│  │  ├─ LanguageToggle.tsx
│  │  ├─ ProtectedRoute.tsx
│  │  ├─ QuickStats.tsx
│  │  ├─ ThemeToggle.tsx
│  │  ├─ ui
│  │  │  ├─ accordion.tsx
│  │  │  ├─ alert-dialog.tsx
│  │  │  ├─ alert.tsx
│  │  │  ├─ aspect-ratio.tsx
│  │  │  ├─ avatar.tsx
│  │  │  ├─ badge.tsx
│  │  │  ├─ breadcrumb.tsx
│  │  │  ├─ button.tsx
│  │  │  ├─ calendar.tsx
│  │  │  ├─ calendar22.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ carousel.tsx
│  │  │  ├─ chart.tsx
│  │  │  ├─ checkbox.tsx
│  │  │  ├─ collapsible.tsx
│  │  │  ├─ command.tsx
│  │  │  ├─ context-menu.tsx
│  │  │  ├─ dialog.tsx
│  │  │  ├─ drawer.tsx
│  │  │  ├─ dropdown-menu.tsx
│  │  │  ├─ empty.tsx
│  │  │  ├─ form.tsx
│  │  │  ├─ hover-card.tsx
│  │  │  ├─ input-otp.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ label.tsx
│  │  │  ├─ menubar.tsx
│  │  │  ├─ navigation-menu.tsx
│  │  │  ├─ pagination.tsx
│  │  │  ├─ popover.tsx
│  │  │  ├─ progress.tsx
│  │  │  ├─ radio-group.tsx
│  │  │  ├─ resizable.tsx
│  │  │  ├─ scroll-area.tsx
│  │  │  ├─ select.tsx
│  │  │  ├─ separator.tsx
│  │  │  ├─ sheet.tsx
│  │  │  ├─ sidebar.tsx
│  │  │  ├─ skeleton.tsx
│  │  │  ├─ slider.tsx
│  │  │  ├─ sonner.tsx
│  │  │  ├─ switch.tsx
│  │  │  ├─ table.tsx
│  │  │  ├─ tabs.tsx
│  │  │  ├─ textarea.tsx
│  │  │  ├─ toast.tsx
│  │  │  ├─ toaster.tsx
│  │  │  ├─ toggle-group.tsx
│  │  │  ├─ toggle.tsx
│  │  │  ├─ tooltip.tsx
│  │  │  └─ use-toast.ts
│  │  └─ WelcomeHeader.tsx
│  ├─ contexts
│  │  └─ AuthContext.tsx
│  ├─ hooks
│  │  ├─ use-mobile.tsx
│  │  └─ use-toast.ts
│  ├─ index.css
│  ├─ integrations
│  │  └─ supabase
│  │     ├─ client.ts
│  │     ├─ profile.ts
│  │     └─ types.ts
│  ├─ lib
│  │  ├─ fileValidation.ts
│  │  └─ utils.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ Index.tsx
│  │  ├─ Login.tsx
│  │  ├─ NotFound.tsx
│  │  ├─ OfficeInformation.tsx
│  │  ├─ PendingApproval.tsx
│  │  ├─ Register.tsx
│  │  ├─ Security.tsx
│  │  └─ Settings.tsx
│  └─ vite-env.d.ts
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  ├─ gotrue-version
│  │  ├─ pooler-url
│  │  ├─ postgres-version
│  │  ├─ project-ref
│  │  ├─ rest-version
│  │  └─ storage-version
│  ├─ config.toml
│  ├─ functions
│  │  └─ update_profile
│  │     └─ README.md
│  └─ migrations
│     ├─ 20251002065532_836d830b-a63d-404f-89ea-b6402a2c1a77.sql
│     ├─ 20251002065653_48c8095b-7f78-4e69-bdf4-c1e6a82b5159.sql
│     ├─ 20251003094322_374db26e-3908-4d52-895a-f6c9d74d1984.sql
│     ├─ 20251004165335_d56a37e3-0eaf-4433-a729-a87ba90b83a4.sql
│     ├─ 20251004170812_540cc37c-bc4f-401a-bdd7-81da2eea4672.sql
│     └─ 20251006082912_b5357026-1df6-4f4b-bd54-966390dace90.sql
├─ tailwind.config.ts
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.node.json

```