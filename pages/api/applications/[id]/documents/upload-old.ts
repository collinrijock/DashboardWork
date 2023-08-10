import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { Configuration, DocumentsApi } from "@lula-technologies-inc/document-service";
import { GoogleAuth } from "google-auth-library";
import multer from "multer";

type AddApplicationDocumentRequest = {
  applicationId: string;
  documentType: "rental_agreement" | "loss_runs" | "coverage_agreement";
  documentDescription: string;
  fileUrl: string;
  documentName: string;
};


declare module "next" {
  interface NextApiRequest {
    file?: any;
  }
}

const startUpload = async (signedUrl: string) => {
  const resumable = await fetch(signedUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Resumable": "start",
      "x-goog-content-length-range": "0,20000000",
    },
    body: JSON.stringify({}),
  });

  if (!resumable.ok) {
    throw new Error(`Failed to initialize resumable upload: ${resumable.statusText}`);
  }

  const location = resumable.headers.get("location");

  if (!location) {
    throw new Error("No location header in response, cannot proceed with upload");
  }

  return location;
};

const finishUpload = async (location: string, buffer: Buffer, fileSizeInBytes: number) => {
  const result = await fetch(location, {
    method: "PUT",
    headers: {
      "Content-Type": "image/x-png",
      "Content-Length": fileSizeInBytes.toString(),
    },
    body: buffer,
  });

  if (!result.ok) {
    throw new Error(`Failed to upload file: ${result.statusText}`);
  }

  return String(result);
};

const uploadSignedUrl = async (signedUrl: string, filePath: string) => {
  const stats = await fs.stat(filePath);
  const fileSizeInBytes = stats.size;
  const buffer = await fs.readFile(filePath);
  const location = await startUpload(signedUrl);
  return await finishUpload(location, buffer, fileSizeInBytes);
};

const accessTokenLocal = async () => {
  return process.env.LOCAL_IDENTITY_TOKEN!;
};

const accessTokenRemote = async (basePath: string) => {
  const auth = new GoogleAuth();
  const authClient = await auth.getIdTokenClient(basePath);
  return authClient.credentials.id_token!;
};

const initializeApi = async (): Promise<DocumentsApi> => {
  try {
    const basePath = process.env.BASE_PATH || "https://api.documents.lula.com/";
    const accessToken = process.env.LOCAL_IDENTITY_TOKEN != null ? accessTokenLocal : await accessTokenRemote(basePath);
    const config = new Configuration({ basePath, accessToken });
    return new DocumentsApi(config);
  } catch (error) {
    throw new Error("Authentication failed");
  }
};

const getDocumentDownloadUrl = async (documentsApi: DocumentsApi, documentId: string): Promise<string> => {
  const document = await documentsApi.getDocument({ documentId });
  return document.downloadUrl!;
};

export const config = {
  api: { bodyParser: false },
};

const sendApplicationDocument = async (applicationId: string, documentType: "rental_agreement" | "loss_runs" | "coverage_agreement", documentDescription: string, downloadUrl: string, documentName: string, token: string): Promise<any> => {
  const url = `${process.env.LULA_API_URL}/embedded/v1/backoffice/application-document`;
  const body: AddApplicationDocumentRequest = {
    applicationId,
    documentType,
    documentDescription,
    fileUrl: downloadUrl,
    documentName,
  };
  console.log('body', body);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-firebase-auth': token || "",
        'X-Source': 'test'
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Response: ${await response.text()}}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let tempFilePath: string | null = null;

  try {
    const upload = multer({ dest: "uploads/" }).single("file");
    // @ts-ignore
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ error: err.message });
        return;
      } else if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!req.file) {
        throw new Error("File upload failed");
      }

      tempFilePath = req.file.path;

      const documentsApi = await initializeApi();
      const document = await documentsApi.createDocument({
        createDocumentRequest: { name: req.file.originalname, callbacks: {} },
      });

      await uploadSignedUrl(document.uploadUrl!, req.file.path);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const downloadUrl = await getDocumentDownloadUrl(documentsApi, document.id!);

      const applicationId = req.body.applicationId; 
      const documentType = "loss_runs"; 
      const documentDescription = "your-description";
      const documentName = req.file.originalname; 
      const token = String(req.headers["x-firebase-auth"]);
      const sendResponse = await sendApplicationDocument(applicationId, documentType, documentDescription, downloadUrl, documentName, token);

      if (!sendResponse.ok) {
        throw new Error(`Failed to send application document: ${sendResponse}`);
      }

    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  } finally {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => {});
    }
  }
}