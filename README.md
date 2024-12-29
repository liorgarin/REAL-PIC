
# REAL-PIC

**REAL-PIC** is a React Native (Expo) application that lets users capture photos, create albums, purchase prints, and manage delivery. It also includes supporting Node.js servers for PayPal integration, zipping photos, and a manager dashboard web interface.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Updating ngrok URL](#updating-ngrok-url)
- [Running the App](#running-the-app)
  1. [Run PayPal Backend](#1-run-paypal-backend)
  2. [Run Zip-Photos Backend](#2-run-zip-photos-backend)
  3. [Run Manager Dashboard](#3-run-manager-dashboard)
  4. [Run the Expo App](#4-run-the-expo-app)
- [Manager Login Credentials](#manager-login-credentials)
- [Usage Notes](#usage-notes)
- [License](#license)

---

## Project Structure

```plaintext
myproject/
 ├─ manager-dashboard/
 │   ├─ package.json
 │   └─ ...
 ├─ paypal-backend/
 │   ├─ server.js
 │   ├─ package.json
 │   └─ ...
 ├─ zip-photos-backend/
 │   ├─ server.js
 │   ├─ package.json
 │   └─ ...
 ├─ myrealpic/
 │   ├─ app.json
 │   ├─ package.json
 │   └─ ...
 ├─ ngrok.yml
 ├─ README.md
 └─ .gitignore
```

### Description of Directories

1. **manager-dashboard/**  
   A React web app for managers to oversee orders, coupons, and worker management.

2. **paypal-backend/**  
   A Node.js/Express server for handling PayPal checkout flows.

3. **zip-photos-backend/**  
   A Node.js server for bundling photos into a zip, used in the printing/shipping flow.

4. **myrealpic/** (Expo/React Native application)  
   The main mobile app that users interact with to create or manage albums.

---

## Prerequisites

- Node.js (v16 or v18 recommended).
- npm or yarn installed globally.
- Expo CLI (optional globally) – or use `npx expo`.
- Git for cloning or pulling updates.
- ngrok if you want to expose local services externally (for PayPal callbacks or webhooks).

> **Note**: PayPal credentials and Firebase configuration are already included in the code; no extra setup is required.

---

## Installation

1. Clone or download this repository to your local machine.
2. Install dependencies in each relevant folder:

   - **Manager Dashboard**
     ```bash
     cd manager-dashboard
     npm install
     ```

   - **PayPal Backend**
     ```bash
     cd ../paypal-backend
     npm install
     ```

   - **Zip-Photos Backend**
     ```bash
     cd ../zip-photos-backend
     npm install
     ```

   - **myrealpic**
     ```bash
     cd ../myrealpic
     npm install
     ```

3. Return to the `myproject/` directory if needed.

---

## Updating ngrok URL

If you use ngrok to test PayPal or other external callbacks, you’ll need to:

1. Run ngrok on the PayPal backend’s port (default 3002):

   ```bash
   ngrok http 3002
   ```

   This will provide an HTTPS forwarding address, for example: `https://1234abcd.ngrok.io`.

2. Update that ngrok domain in the relevant code:

   - **paypal-backend/server.js**:
     ```javascript
     const NGROK_DOMAIN = 'https://1234abcd.ngrok.io';
     ```

   - **myrealpic/screens/PurchaseFilmScreen.js** and **HomeScreen.js**:
     ```javascript
     const PAYPAL_SERVER_URL = 'https://1234abcd.ngrok.io/create-order';
     const SUCCESS_URL = 'https://1234abcd.ngrok.io/success.html';
     const CANCEL_URL = 'https://1234abcd.ngrok.io/cancel.html';
     ```

---

## Running the App

Follow the steps below to run all services:

### 1. Run PayPal Backend

From `myproject/paypal-backend/`:

```bash
node server.js
```

### 2. Run Zip-Photos Backend

In a separate terminal, go to `myproject/zip-photos-backend/`:

```bash
node server.js
```

### 3. Run Manager Dashboard

In another terminal, go to `myproject/manager-dashboard/`. If you are using Node 18+ and run into crypto issues, set:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

### 4. Run the Expo App

Finally, in `myproject/myrealpic/`, start the Expo app:

```bash
npx expo start
```

Scan the printed QR code with the Expo Go app on a mobile device, or press `i` to run on the iOS simulator / `a` for the Android emulator.

---

## Payment Testing with PayPal Sandbox

The app is configured to run PayPal transactions in sandbox mode, meaning no real funds will be used during testing. When you reach the PayPal login prompt in the app’s purchase flow, use the following **sandbox buyer** account details:

- **Sandbox Email**: `sb-olhlx34114057@personal.example.com`
- **Sandbox Password**: `PI#J3jWs`

These credentials allow you to test completing payments without incurring actual charges.

---

## Manager/Admin Login Credentials

In the **manager-dashboard**, log in with the “master manager” (admin) account:

- **Email**: `reals.pics@gmail.com`
- **Password**: `12345678`

After logging in, you can view and manage orders, coupons, workers, and more.

---

## Usage Notes

- **Coupons** can be managed in the manager-dashboard under the “Coupons” section (if implemented). Users can apply those coupons in the mobile app’s purchase screen.
- **Demo Film vs. Real Film**: Users can choose to purchase a new film with real prints or create a smaller “demo” album with limited functionality.
- **Album Flow**:
  - **Active** → user can add photos.
  - **Ready to Print** → user fills address, triggers “On the Way”.
  - **Arrived** → final status in user’s “My Albums” section.
- **Zipping Photos**: The zip-photos-backend (port 3001) can create zip packages of images. The app or dashboard can integrate that endpoint for printing or shipping.

---

Enjoy using **REAL-PIC**!
