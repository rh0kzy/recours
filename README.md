# Recours - USTHB Specialty Change Request System

A web application for USTHB students to request specialty changes, with an admin panel for managing requests.

## Features

- **Student Portal**: Submit specialty change requests
- **Admin Panel**: Review and approve/reject requests
- **Email Notifications**: Automatic notifications for status updates
- **Database Integration**: PostgreSQL with Supabase
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **Database**: PostgreSQL (Supabase)
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Netlify

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   DATABASE_URL=your_supabase_database_url
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_APP_PASSWORD=your_app_password
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Netlify Deployment

### 1. Connect to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Connect your GitHub repository

### 2. Build Settings

Configure the following in Netlify:

- **Build command**: `npm run build`
- **Publish directory**: `.next` (this is handled by `netlify.toml`)

### 3. Environment Variables

Add these environment variables in Netlify dashboard:

```
DATABASE_URL=your_supabase_database_url
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_app_password
NODE_VERSION=18
```

### 4. Database Setup

Make sure your Supabase database has the `requests` table:

```sql
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  matricule TEXT,
  nom TEXT,
  prenom TEXT,
  email TEXT,
  telephone TEXT,
  specialite_actuelle TEXT,
  specialite_souhaitee TEXT,
  raison TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  admin_comment TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by TEXT
);
```

### 5. Deploy

Netlify will automatically build and deploy your site. The API routes will be converted to Netlify Functions.

## API Endpoints

- `GET /.netlify/functions/admin-requests` - Get all requests (admin)
- `PATCH /.netlify/functions/admin-requests-id` - Update request status
- `POST /.netlify/functions/submit-request` - Submit new request
- `GET /.netlify/functions/test` - Test API connectivity

## Project Structure

```
├── netlify/
│   └── functions/          # Netlify Functions
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app router
│   │   ├── admin/         # Admin panel
│   │   ├── api/           # API routes (converted to functions)
│   │   └── page.tsx       # Home page
│   └── components/        # React components
└── netlify.toml           # Netlify configuration
```

## Email Configuration

The app uses Gmail SMTP for sending emails. To set up:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password in `EMAIL_APP_PASSWORD`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is private and proprietary.

Vous pouvez consulter [le dépôt GitHub Next.js](https://github.com/vercel/next.js) - vos commentaires et contributions sont les bienvenus !

## Déploiement sur Vercel

Le moyen le plus simple de déployer votre application Next.js est d'utiliser la plateforme [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) des créateurs de Next.js.

Consultez notre [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.
