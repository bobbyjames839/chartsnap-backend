import { Router, Request, Response } from 'express';
import admin from '../../config/firebase';

const router = Router();


router.post('/apple', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: 'ID token is required',
      });
      return;
    }

    // Check if Firebase is initialized
    if (!admin.apps.length) {
      res.status(500).json({
        success: false,
        message: 'Firebase not configured - please set up Firebase credentials',
      });
      return;
    }

    // Verify the Apple ID token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Here you would typically save/update user in your database
    const userData = {
      uid,
      email,
      name: name || decodedToken.firebase?.identities?.['apple.com']?.[0] || email,
      provider: 'apple',
    };

    res.json({
      success: true,
      message: 'Apple sign-in successful',
      user: userData,
    });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Apple token',
    });
  }
});

export default router;