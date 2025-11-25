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

## New Features - Randomizers (Replace Quizzes)
- [x] Remove Quizzes tab and related code
- [x] Create Randomizers tab
- [x] Dice Roller component
  - [x] Visual dice display
  - [x] Roll animation
  - [x] Random number generation (1-6)
  - [x] "Бросить кубики" button
- [x] Roulette component
  - [x] Dynamic participant input (3-100)
  - [x] Pie chart visualization
  - [x] Spin animation
  - [x] Winner selection
  - [x] "Запустить рулетку" button
- [x] Update navigation icons and labels
- [x] Update i18n translations for randomizers

## Backend Integration
- [x] Add web-db-user feature (server + database + auth)
- [x] Design database schema
  - [x] Users table
  - [x] SantaEvents table
  - [x] EventParticipants table
  - [x] Assignments table
  - [x] Wishlist table
  - [x] RandomizerHistory table
- [x] Create API endpoints
  - [x] User authentication via Telegram
  - [x] Secret Santa CRUD operations
  - [x] Participant management
  - [x] Name drawing algorithm
  - [x] Wishlist CRUD operations
  - [x] Leaderboard queries
  - [x] Randomizer history storage
- [x] Set up Telegram bot (using grammy)
  - [x] Bot initialization
  - [x] Notification handlers
  - [x] Command handlers (/start, /help, /stats)
  - [x] WebApp button integration
- [ ] Frontend integration
  - [x] Add Telegram WebApp SDK
  - [ ] Replace local state with API calls (IN PROGRESS)
  - [ ] Add authentication flow
  - [ ] Add loading states
  - [ ] Add error handling

## Additional Requirements
- [x] Add image size validation (5MB limit) for wishlist uploads
  - [x] Frontend validation (in API)
  - [x] Backend validation

## Wishlist Sharing Feature
- [x] Add API endpoint for viewing public wishlist by user ID
- [x] Create public wishlist view page component
- [x] Add "Share Wishlist" button in Profile tab
- [x] Generate shareable link with user ID
- [x] Add route for public wishlist viewing
- [x] Test wishlist sharing functionality

## Gift Reservation Feature
- [x] Add WishlistReservations table to database schema
- [x] Create API endpoint to reserve a gift
- [x] Create API endpoint to unreserve a gift
- [x] Create API endpoint to check reservation status
- [x] Add "Reserve" button on public wishlist page
- [x] Show reservation status to other users (not owner)
- [x] Add ability to cancel own reservation
- [x] Test reservation functionality

## My Reservations Page
- [x] Create API endpoint to fetch user's reservations with full item details
- [x] Create MyReservations page component
- [x] Display reserved items with images, titles, and owner info
- [x] Add "Cancel Reservation" button for each item
- [x] Add navigation button in Profile tab
- [x] Add translations for My Reservations page
- [x] Test My Reservations functionality

## Deadline Date for Reservations
- [x] Add deadline date field to wishlist_reservations table
- [x] Create API endpoint to set/update reservation deadline
- [x] Add date picker UI in MyReservations page
- [x] Display deadline with urgency indicators (upcoming, today, overdue)
- [x] Sort reservations by deadline (soonest first)
- [x] Add translations for deadline labels and urgency states

## Calendar Page
- [x] Create Calendar tab component with monthly view
- [x] Display reservation deadlines on calendar
- [x] Display Secret Santa events on calendar
- [x] Add color coding for different event types
- [x] Add date click handler to show event details
- [x] Add month navigation (prev/next)
- [x] Add legend explaining color codes
- [x] Add Calendar tab to bottom navigation (5th tab)
- [x] Update BottomNav to support 5 tabs
- [x] Add calendar translations (EN/RU)

## Calendar Export Feature
- [x] Create iCal/ICS file generation utility
- [x] Add "Export All Events" button to calendar page
- [x] Add "Export" button for individual events
- [x] Generate proper iCal format with event details
- [x] Handle timezone conversion for events
- [x] Add translations for export buttons (EN/RU)
- [ ] Test export with Google Calendar and Apple Calendar

## New User-Requested Improvements (Nov 25, 2024)
- [x] Fix profile display - show real Telegram name instead of "Alex Johnson"
- [ ] Add profile editing functionality (name, avatar, etc.)
- [x] Make roulette participant names editable (replace "Участник 1, 2, 3")
- [ ] Implement Secret Santa invite link system with event ID
- [x] Set Russian as default language
- [x] Add theme switcher button (light/dark mode)
- [x] Add user avatar on home page greeting

## Comprehensive Feature Improvements (Nov 25, 2024)

### Secret Santa Invite System
- [x] Generate unique invite link for each event
- [x] Add invite code to event schema
- [x] Create invite link sharing functionality
- [x] Implement join-by-invite-only restriction
- [x] Show participant list to organizer (frontend)
- [x] Add invite link to event details page (frontend)

### Telegram Notifications
- [x] Notification when gift is reserved from wishlist (backend)
- [x] Reminder for approaching reservation deadline (backend)
- [x] Notification when Secret Santa draw is completed (backend)
- [x] Notification when invited to Secret Santa event (backend)
- [ ] Add notification preferences in settings (frontend)

### Enhanced Wishlist
- [x] Add product link field to wishlist items (schema)
- [x] Add price field to wishlist items (schema)
- [x] Add category field (electronics, books, clothing, etc.) (schema)
- [ ] Filter wishlist by category (frontend)
- [ ] Sort wishlist by price (frontend)
- [ ] Show price range in wishlist (frontend)
- [x] Update wishlist form to include new fields (frontend)

### Statistics and Achievements
- [x] Track Secret Santa participation count (schema + API)
- [x] Track gifts given/received count (schema + API)
- [x] Create achievement badges system (schema + API)
- [x] Display achievements in profile (frontend)
- [x] Add statistics page (frontend)
- [ ] Award points for achievements (integration)

### Event Chat
- [x] Create chat schema for events
- [x] Chat API endpoints
- [ ] Add chat UI to event details (frontend)
- [ ] Real-time message updates (frontend)
- [ ] Anonymous messaging option for Secret Santa (frontend)
- [ ] Message notifications (integration)

### Calendar Export Improvements
- [ ] Test export with Google Calendar
- [ ] Test export with Apple Calendar
- [ ] Add export all events button (frontend)
- [ ] Add export single event button (frontend)
- [ ] Improve ICS file format


## API Integration & Final Features (Nov 25, 2024)

### Telegram Authentication
- [x] Implement Telegram WebApp authentication flow
- [x] Create auth middleware for protected routes
- [x] Store user session with JWT
- [x] Auto-login from Telegram WebApp initData

### API Connections
- [ ] Connect wishlist form to POST /api/wishlist/create
- [ ] Connect statistics page to GET /api/features/statistics
- [ ] Connect achievements to GET /api/features/achievements
- [ ] Connect invite system to POST /api/features/invite/generate

### Event Chat
- [ ] Create EventChat component
- [ ] Integrate with GET /api/features/chat/:eventId
- [ ] Implement POST /api/features/chat/send
- [ ] Add real-time updates (polling or WebSocket)
- [ ] Anonymous messaging toggle

### Notification Integration
- [ ] Trigger notification on wishlist item reservation
- [ ] Trigger notification on Secret Santa draw completion
- [ ] Trigger notification on event invitation
- [ ] Add notification preferences UI
