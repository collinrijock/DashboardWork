import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { initializeApi } from '@/utils/apiUtils';

const upload = multer().single('file');

export default function uploadHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  upload(req, res, async (err: any) => {
    if (err) {
      console.error('Error uploading file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    try {
      const { fileName } = req.body;
      const file = req.file;

      const basePath = 'https://api.documents.lula.com/';
      const accessToken = process.env.LOCAL_IDENTITY_TOKEN!;
      const documentsApi = await initializeApi(basePath, accessToken);

      const document = await documentsApi.createDocument({
        createDocumentRequest: {
          name: fileName,
          callbacks: {
            uploaded: 'https://httpbin.org/status/200,500',
            clean: 'https://httpbin.org/status/200,500',
            infected: 'https://httpbin.org/status/200,500',
            errored: 'https://httpbin.org/status/200,500',
          },
        },
      });

      const signedUrl = document.uploadUrl;
      if (!signedUrl) {
        throw new Error('Failed to generate signed URL');
      }

      // Now we have the signedUrl, so we can upload the file directly from server-side.
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file.buffer, // multer stores the file data in buffer, so we can use it directly
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file to storage: ${uploadResponse.statusText}`);
      }

      res.status(200).json({ result: 'Success' });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
