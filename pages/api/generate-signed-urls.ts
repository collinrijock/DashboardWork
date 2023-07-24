import * as admin from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
// Initialize the Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { fileNames } = req.body;
    try {
      const signedUrls = await Promise.all(
        fileNames.map(async (fileName: string) => {
          const file = bucket.file(fileName);
          const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60, // 1 hour
          });
          return { [fileName]: signedUrl };
        })
      );
      res.status(200).json(signedUrls);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating signed URLs.' });
    }
  } else {
    res.status(404).json({ error: 'Invalid request method' });
  }
}

