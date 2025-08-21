# Deployment Guide

This guide will help you deploy the School Learning Platform to various hosting services.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

1. **Connect to GitHub**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub
   - Import your repository

2. **Configure Environment Variables**
   - In your Vercel project dashboard
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Your app will be available at `https://your-project.vercel.app`

### Netlify

1. **Connect to GitHub**
   - Go to [Netlify](https://netlify.com)
   - Sign up with GitHub
   - Import your repository

2. **Configure Environment Variables**
   - In your Netlify dashboard
   - Go to Site Settings → Environment Variables
   - Add all variables from your `.env` file

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Deploy**
   - Netlify will automatically deploy on every push

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

## 🔧 Environment Variables

Make sure to set these environment variables in your hosting platform:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## 📱 PWA Configuration

### Custom Domain (Optional)

1. **Add Custom Domain**
   - In your hosting platform, add a custom domain
   - Update your Firebase Auth authorized domains
   - Update your manifest.json with the new domain

2. **SSL Certificate**
   - Most hosting platforms provide SSL automatically
   - Ensure HTTPS is enabled for PWA features

## 🔒 Security Checklist

- [ ] Environment variables are set in hosting platform
- [ ] Firebase security rules are configured
- [ ] Custom domain is added to Firebase Auth (if using)
- [ ] SSL certificate is active
- [ ] PWA manifest is properly configured

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Ensure all variables start with `VITE_`
   - Restart the build after adding variables

2. **Firebase Connection Issues**
   - Check Firebase project settings
   - Verify API keys are correct
   - Check Firebase security rules

3. **PWA Not Working**
   - Ensure HTTPS is enabled
   - Check service worker registration
   - Verify manifest.json is accessible

### Support

If you encounter issues, check:
1. Browser console for errors
2. Firebase console for authentication issues
3. Hosting platform logs for build errors

## 📊 Performance Optimization

1. **Enable Compression**
   - Most hosting platforms enable this automatically

2. **CDN Configuration**
   - Configure CDN for static assets
   - Enable caching for better performance

3. **Image Optimization**
   - Use WebP format for images
   - Implement lazy loading

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 Success!

Your School Learning Platform is now deployed and ready for use!
