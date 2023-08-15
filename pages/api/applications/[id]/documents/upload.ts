import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import multer from "multer";
import axios from "axios";

const upload = multer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  // @ts-ignore
  upload.single("file")(req, res, async (err) => {
    if (err) {
      res.status(500).json({ error: "A file upload error occurred." });
      return;
    }

    const storage = new Storage({
      projectId: process.env.GCS_DOCUMENTS_PROJECTID,
    });

    const bucketName = process.env.GCS_DOCUMENTS_BUCKETNAME!;
    const bucket = storage.bucket(bucketName);

    // @ts-ignore
    const file = req.file;
    const documentType = req.body.documentType as string;
    const documentName = req.body.documentName as string;
    const applicationId = req.body.applicationId as string;

    const supportedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "text/plain",
    ];
    const allowedDocumentTypes = [
      "rental_agreement",
      "loss_runs",
      "coverage_agreement",
    ];

    if (!allowedDocumentTypes.includes(documentType)) {
      res.status(400).json({ error: "Invalid document type" });
      return;
    }

    if (!supportedFileTypes.includes(file.mimetype)) {
      res.status(400).json({ error: "Unsupported file type" });
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
    const fileName = `${formattedDate}-${documentName}`;

    bucket.file(`${applicationId}/${fileName}`).save(file.buffer,{
      contentType: file.mimetype,resumable: false
    });


    const fileLocation = `/${bucketName}/${applicationId}/${fileName}`;
    const backendBody = {
      applicationId,
      documentType,
      documentName,
      documentDescription: req.body.documentDescription,
      filePath: fileLocation,
    };

    const url = `${process.env.LULA_API_URL}/embedded/v1/application/documents`;
    const headers = {
      "x-firebase-auth": req.headers["x-firebase-auth"],
      "content-type": "application/json",
      "x-source": "test",
    };

    axios
      .post(url, backendBody, { headers })
      .then((response) => {
        res.status(200).json({ success: true, data: response.data });
      })
      .catch((error) => {
        res.status(500).json({
          message: "An error occurred while processing the request to the backend.",
          error: error,
        });
      });
  });
}
