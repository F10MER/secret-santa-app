# Secret Santa Telegram Mini App - TODO

## Project Setup
- [x] Initialize React + TypeScript + Tailwind CSS project
- [x] Create project plan and todo list
- [x] Set up TypeScript interfaces and types
- [x] Create mock data constants
- [x] Implement i18n system (EN/RU)

## Core UI Components
- [x] Button component (reusable) - using shadcn/ui
- [x] Input component (reusable) - using shadcn/ui
- [x] Card component (reusable) - using shadcn/ui
- [x] SectionTitle component (reusable)
- [x] Integrate Telegram theme CSS variables (--tg-theme-*)
- [x] Add CSS animations (fade-in, slide-up)

## Navigation
- [x] Bottom sticky navigation bar (4 tabs)
- [x] Tab routing logic
- [x] Active tab highlighting

## Home Tab
- [x] Display greeting with user name
- [x] Show current Bonus Points in badge
- [x] Secret Santa dashboard card (Red gradient)
- [x] Quizzes dashboard card (Indigo gradient)
- [x] Leaderboard banner with navigation to Profile

## Secret Santa Tab
- [x] List view showing active events
- [x] Event status display (Created/Assigned)
- [x] Create event form (Name, Min/Max Budget, Date)
- [x] Add Mock Participant button
- [x] Draw Names button with random pairing algorithm
- [x] Secret Santa assignment reveal card

## Quizzes Tab
- [x] Quiz list view with icons and descriptions
- [x] Quiz view with single question display
- [x] Multiple choice buttons
- [x] Progress indicator (e.g., "1/5")
- [x] Completion success screen with animation
- [x] Award fake points on completion

## Profile Tab
- [x] User header with avatar (initials)
- [x] Display Name, Level (Novice/Active)
- [x] Show stats (Referrals, Points)
- [x] Leaderboard button
- [x] Leaderboard modal/overlay with top users
- [x] Highlight current user in leaderboard
- [x] Wishlist section with items (Image + Text)
- [x] Add Item button with image upload simulation
- [x] Privacy toggle (All / Friends Only)
- [x] Language switcher (EN/RU)
- [x] Share Referral Link button (copy to clipboard)

## Technical Implementation
- [x] Define User interface
- [x] Define SantaEvent interface
- [x] Define Quiz interface
- [x] Define WishlistItem interface
- [x] Create SVG icons (Gift, Brain, User, Home, Trophy, Camera, Lock)
- [x] MOCK_USER constant
- [x] MOCK_LEADERBOARD constant
- [x] getQuizzes(lang) function

## Testing & Polish
- [x] Test all features in browser
- [x] Verify responsive design on mobile
- [x] Test dark mode with Telegram theme
- [x] Test language switching
- [x] Final UI polish and animations
